# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flotilla Sumud 2025 is an automated monitoring and hourly reporting system for Global Sumud Flotilla vessel tracking.

- **Data Source**: https://flotilla-orpin.vercel.app/
- **Goal**: Scrape vessel data (44 vessels), convert timestamps to Malaysia Time (UTC+8), sort by latest update, and email hourly reports to azmi@aga.my

## Architecture

This is a scheduled automation system with three core modules:

1. **Web Scraper** (`src/scraper.py` or `src/scraper.js`): Uses Selenium/Playwright to scrape dynamic JavaScript content from the flotilla tracking website. Must click each vessel dropdown to extract full details.

2. **Data Processor** (`src/data_processor.py` or `src/data_processor.js`): Converts UTC timestamps to Malaysia Time (UTC+8), sorts vessels by latest update, structures data into JSON format with summary statistics.

3. **Email Reporter** (`src/email_sender.py` or `src/email_sender.js`): Generates HTML emails from templates and sends hourly reports via SMTP.

4. **Scheduler** (`scheduler.py` or `scheduler.js`): Orchestrates hourly execution of the scrape → process → email workflow.

## Technology Stack

Choose one implementation:
- **Python**: Selenium/Playwright, APScheduler, smtplib, pytz
- **Node.js**: Puppeteer/Playwright, node-cron, nodemailer

## Critical Implementation Details

### Scraping Requirements
- Website loads 44 vessels dynamically via JavaScript
- Each vessel has a dropdown button that must be clicked to reveal details
- Extract: name, status (SAILING/INTERCEPTED), last update (UTC), speed, position, course, location
- Use explicit waits for element loading
- Implement retry logic with exponential backoff
- Run headless in production

### Data Format
```json
{
  "report_generated": "2025-10-02T10:39:00+08:00",
  "total_vessels": 44,
  "vessels": [
    {
      "name": "Vessel Name",
      "status": "SAILING",
      "last_update_utc": "2025-10-02T02:20:00Z",
      "last_update_myt": "2025-10-02T10:20:00+08:00",
      "speed": "6.59 knots",
      "position": "31.7377, 33.4533",
      "course": "90°",
      "location": "City Name"
    }
  ],
  "summary": {
    "sailing": 33,
    "intercepted": 11,
    "most_recent_update": "2025-10-02T10:22:00+08:00"
  }
}
```

### Environment Variables (`.env`)
```
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
RECIPIENT_EMAIL=azmi@aga.my
FLOTILLA_URL=https://flotilla-orpin.vercel.app/
HEADLESS_MODE=true
TIMEOUT_SECONDS=30
RETRY_ATTEMPTS=3
TIMEZONE=Asia/Kuala_Lumpur
```

## Directory Structure

```
src/
  scraper.py|js           # Web scraping logic
  data_processor.py|js    # Timestamp conversion & sorting
  email_sender.py|js      # Email generation & sending
  config.py|js            # Config loader & validation
  main.py|js              # Main workflow orchestrator
data/
  vessels_latest.json     # Current scrape results
  vessels_history.json    # Historical data log
logs/
  scraper.log            # Scraping activity logs
  email.log              # Email sending logs
  scheduler.log          # Scheduling events
templates/
  email_template.html    # HTML email template
tests/
  test_scraper.py|js     # Unit tests for scraper
  test_email.py|js       # Unit tests for email
```

## Development Commands

### Python
```bash
# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run components
python src/scraper.py      # Test scraper only
python src/main.py         # Run full workflow once
python scheduler.py        # Start hourly scheduler

# Testing
pytest tests/
```

### Node.js
```bash
# Setup
npm install

# Run components
npm run scrape     # Test scraper only
npm start          # Run full workflow once
npm run schedule   # Start hourly scheduler

# Testing
npm test
```

## Deployment Options

1. **GitHub Actions** (Recommended): Cloud-based, no server needed, 2000 free minutes/month
2. **Cron** (Linux/Mac): `0 * * * * /path/to/venv/bin/python /path/to/main.py`
3. **Windows Task Scheduler**: Hourly trigger with PowerShell wrapper
4. **Docker**: Containerized deployment to any cloud provider

## Error Handling Requirements

- Implement retry logic: 3 attempts with exponential backoff
- Log all errors with context (vessel count, timestamps)
- Send alert email if scraper fails 3 consecutive times
- Send alert if no new data for 4+ hours
- Gracefully handle website structure changes
- Validate all data before sending emails

## Email Configuration Notes

For Gmail:
- Enable 2FA on your Google account
- Generate App Password (not regular password)
- Use TLS/SSL encryption on port 587

## Key Considerations

- **Reliability over speed**: Optimize for consistent operation
- **Website resilience**: Site structure may change - use robust selectors
- **Data validation**: Always validate before emailing
- **Timezone handling**: All times must convert correctly to Malaysia Time (UTC+8)
- **Security**: Never commit `.env` file (add to `.gitignore`)
- **Logging**: Comprehensive logging for debugging production issues

## Implementation Priority

1. Phase 1: Web scraping module (core functionality)
2. Phase 2: Email reporting (output capability)
3. Phase 3: Scheduler (automation)
4. Phase 4: Configuration & security (production readiness)
5. Phase 5: Error handling & monitoring (reliability)
6. Phase 6: Testing (quality assurance)
7. Phase 7: Documentation (maintainability)
8. Phase 8: Deployment (production)
9. Phase 9: Maintenance & monitoring (long-term operations)

## Testing Strategy

- Unit tests: Data extraction, timestamp conversion, sorting, email rendering
- Integration tests: Full scraping workflow (use mock website), email sending (test address)
- Validate against success criteria: 44 vessels scraped, correct timezone conversion, proper sorting
