const { chromium } = require('playwright');
const config = require('./config');
const { createLogger } = require('./logger');

const logger = createLogger('scraper');

/**
 * Scrapes vessel data from the flotilla tracking website
 * @returns {Promise<Array>} Array of vessel objects
 */
async function scrapeVessels() {
  const browser = await chromium.launch({
    headless: config.scraper.headlessMode,
    timeout: config.scraper.timeoutSeconds * 1000
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    logger.info(`Starting scrape of ${config.scraper.url}`);

    // Navigate to the website
    await page.goto(config.scraper.url, {
      waitUntil: 'networkidle',
      timeout: config.scraper.timeoutSeconds * 1000
    });

    logger.info('Page loaded, waiting for vessel list...');

    // Wait for vessel rows to load - look for elements that contain vessel data
    await page.waitForTimeout(3000); // Give time for JavaScript to render

    // Find all vessel row containers - they contain cursor-pointer and have vessel data
    const vesselRows = await page.locator('div[class*="cursor-pointer"]:has(button)').all();

    logger.info(`Found ${vesselRows.length} vessel rows`);

    const vessels = [];

    for (let i = 0; i < vesselRows.length; i++) {
      try {
        const row = vesselRows[i];

        // Check if this row has a button (expand button for details)
        const expandButton = row.locator('button').first();
        const hasButton = await expandButton.count() > 0;

        if (!hasButton) {
          logger.debug(`Row ${i + 1} has no expand button, skipping`);
          continue;
        }

        // Extract basic info from collapsed state
        const rowText = await row.innerText();
        const lines = rowText.split('\n').map(l => l.trim()).filter(l => l);

        // Skip if this doesn't look like vessel data
        if (lines.length < 2) continue;

        // Click to expand and get detailed info
        await expandButton.click({ timeout: 5000 });
        await page.waitForTimeout(1500); // Wait longer for expansion animation

        // The expanded details appear as a sibling element, not within the row
        // Get the parent container that includes both the row and expanded details
        const parentContainer = row.locator('..'); // Go up one level
        const expandedText = await parentContainer.innerText();

        // Debug: log first vessel's expanded text
        if (i === 0) {
          logger.debug(`First vessel expanded text:\n${expandedText.substring(0, 500)}`);
        }

        // Extract vessel data
        const vesselData = extractVesselDataFromText(expandedText, i + 1);

        if (vesselData && vesselData.name) {
          // Filter out incidents (they have "Attack" in the name)
          if (!vesselData.name.toLowerCase().includes('attack') &&
              !vesselData.name.toLowerCase().includes('incident')) {
            vessels.push(vesselData);
            logger.debug(`Extracted: ${vesselData.name} - ${vesselData.status}`);
          }
        }

        // Collapse it back to avoid clutter
        await expandButton.click({ timeout: 5000 }).catch(() => {});
        await page.waitForTimeout(300);

      } catch (error) {
        logger.warn(`Error processing vessel row ${i + 1}: ${error.message}`);
        continue;
      }
    }

    logger.info(`Successfully scraped ${vessels.length} vessels`);

    return vessels;

  } catch (error) {
    logger.error(`Scraping failed: ${error.message}`);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Extracts vessel data from the expanded text content
 * @param {string} text - Full text from expanded vessel row
 * @param {number} index - Vessel index
 * @returns {Object} Vessel data object
 */
function extractVesselDataFromText(text, index) {
  try {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);

    // First line typically has the index number (e.g., "1.")
    // Second line has the vessel name
    // Third line (in parentheses) is the location or might not exist
    // Then status (sailing/intercepted)
    // After clicking, we get expanded details

    let name = '';
    let location = null;
    let status = 'UNKNOWN';
    let lastUpdate = null;
    let speed = null;
    let course = null;
    let position = null;

    // Parse the lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip index numbers like "1.", "2."
      if (/^\d+\.$/.test(line)) continue;

      // Extract name (usually comes after the number, before location)
      if (!name && !line.startsWith('(') && !line.includes('Last update') && !line.includes('Speed')) {
        // Check if this line has location in parentheses
        const nameMatch = line.match(/^(.+?)(?:\s*\((.+)\))?$/);
        if (nameMatch) {
          name = nameMatch[1].trim();
          if (nameMatch[2]) {
            location = nameMatch[2].trim();
          }
        } else {
          name = line;
        }
        continue;
      }

      // Extract location if in parentheses
      if (line.startsWith('(') && line.endsWith(')')) {
        location = line.substring(1, line.length - 1);
        continue;
      }

      // Extract status
      if (/^(sailing|intercepted|docked|anchored)$/i.test(line)) {
        status = line.toUpperCase();
        continue;
      }

      // Extract last update (case insensitive)
      if (line.toUpperCase() === 'LAST UPDATE' && i + 1 < lines.length) {
        lastUpdate = lines[i + 1];
        continue;
      }

      // Extract speed
      if (line.toUpperCase() === 'SPEED' && i + 1 < lines.length) {
        speed = lines[i + 1];
        continue;
      }

      // Extract course
      if (line.toUpperCase() === 'COURSE' && i + 1 < lines.length) {
        course = lines[i + 1];
        continue;
      }

      // Extract position
      if (line.toUpperCase() === 'POSITION' && i + 1 < lines.length) {
        position = lines[i + 1];
        continue;
      }
    }

    return {
      id: index,
      name: name || `Vessel ${index}`,
      location,
      status,
      last_update_utc: lastUpdate || new Date().toISOString(),
      speed,
      position,
      course
    };
  } catch (error) {
    logger.warn(`Error parsing vessel text: ${error.message}`);
    return null;
  }
}

/**
 * Helper function to parse timestamp to ISO format
 * Handles formats like "2 Oct 2025 01:43 UTC"
 */
function parseTimestampToISO(timestamp) {
  if (!timestamp) return new Date().toISOString();

  try {
    // Try parsing as-is first
    const date = new Date(timestamp);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }

    // Handle "2 Oct 2025 01:43 UTC" format
    const match = timestamp.match(/(\d+)\s+(\w+)\s+(\d{4})\s+(\d{2}):(\d{2})\s+UTC/);
    if (match) {
      const [, day, monthStr, year, hour, minute] = match;
      const months = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      const month = months[monthStr];
      const utcDate = new Date(Date.UTC(year, month, day, hour, minute));
      return utcDate.toISOString();
    }

    // Fallback
    return new Date().toISOString();
  } catch (error) {
    logger.warn(`Failed to parse timestamp: ${timestamp}`);
    return new Date().toISOString();
  }
}

/**
 * Retry wrapper for scraping with exponential backoff
 */
async function scrapeWithRetry() {
  let lastError;

  for (let attempt = 1; attempt <= config.scraper.retryAttempts; attempt++) {
    try {
      logger.info(`Scrape attempt ${attempt} of ${config.scraper.retryAttempts}`);
      return await scrapeVessels();
    } catch (error) {
      lastError = error;
      logger.warn(`Attempt ${attempt} failed: ${error.message}`);

      if (attempt < config.scraper.retryAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.info(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed after ${config.scraper.retryAttempts} attempts: ${lastError.message}`);
}

// Allow direct execution for testing
if (require.main === module) {
  (async () => {
    try {
      const vessels = await scrapeWithRetry();
      console.log(JSON.stringify(vessels, null, 2));
      console.log(`\nTotal vessels scraped: ${vessels.length}`);
    } catch (error) {
      console.error('Scraping failed:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = { scrapeVessels, scrapeWithRetry };
