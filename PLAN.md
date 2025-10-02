# Flotilla Sumud 2025 - Automation Implementation Plan

## Project Overview
Automated monitoring and hourly reporting system for Global Sumud Flotilla vessel tracking.

**Data Source:** https://flotilla-orpin.vercel.app/  
**Target:** Extract all vessel last update timestamps, convert to Malaysia Time (UTC+8), sort by latest, and email hourly reports to azmi@aga.my

---

## Phase 1: Web Scraping Module

### Task 1.1: Setup Project Structure
**Instructions for Claude Code:**
```
Create the following directory structure:
- src/
  - scraper.py (or scraper.js)
  - email_sender.py (or email_sender.js)
  - data_processor.py (or data_processor.js)
  - config.py (or config.js)
- data/
  - vessels_latest.json
- logs/
  - scraper.log
- tests/
  - test_scraper.py
  - test_email.py
- requirements.txt (or package.json)
- .env.example
- .gitignore
- README.md
```

### Task 1.2: Implement Web Scraper
**Instructions for Claude Code:**
```
Create a web scraper that:
1. Uses Selenium or Playwright to handle dynamic JavaScript content
2. Navigates to https://flotilla-orpin.vercel.app/
3. Waits for the vessel list to fully load (check for 44 vessels)
4. Systematically clicks on each vessel's dropdown button to expand details
5. Extracts for each vessel:
   - Vessel name
   - Status (SAILING, INTERCEPTED, etc.)
   - Last Update timestamp (UTC)
   - Speed (if available)
   - Position coordinates (if available)
   - Course (if available)
   - Additional info (city/location name)
6. Handles errors gracefully (retry mechanism, timeouts)
7. Logs all actions to logs/scraper.log

Technology recommendations:
- Python: Use Selenium with ChromeDriver or Playwright
- Node.js: Use Puppeteer or Playwright

Key considerations:
- Add explicit waits for elements to load
- Handle cases where vessel data might not be available
- Implement exponential backoff for retries
- Use headless mode for production
```

### Task 1.3: Data Processing Module
**Instructions for Claude Code:**
```
Create a data processor that:
1. Receives raw vessel data from scraper
2. Converts all UTC timestamps to Malaysia Time (UTC+8)
3. Sorts vessels by latest timestamp (most recent first)
4. Structures data in a clean format:
   {
     "report_generated": "2025-10-02T10:39:00+08:00",
     "total_vessels": 44,
     "vessels": [
       {
         "id": 1,
         "name": "Vessel Name",
         "location": "City Name",
         "status": "SAILING/INTERCEPTED",
         "last_update_utc": "2025-10-02T02:20:00Z",
         "last_update_myt": "2025-10-02T10:20:00+08:00",
         "speed": "6.59 knots",
         "position": "31.7377, 33.4533",
         "course": "90°"
       }
     ],
     "summary": {
       "sailing": 33,
       "intercepted": 11,
       "most_recent_update": "2025-10-02T10:22:00+08:00"
     }
   }
5. Saves to data/vessels_latest.json
6. Maintains historical data in data/vessels_history.json (append each run)
```

---

## Phase 2: Email Reporting Module

### Task 2.1: Email Template Creation
**Instructions for Claude Code:**
```
Create an HTML email template (templates/email_template.html):
1. Professional layout with clear sections
2. Summary statistics at the top
3. Sortable table of all vessels
4. Color coding: Green for SAILING, Red for INTERCEPTED
5. Timestamp in Malaysia Time prominently displayed
6. Footer with data source link
7. Responsive design for mobile viewing

Create a plain text fallback version as well.
```

### Task 2.2: Email Sender Implementation
**Instructions for Claude Code:**
```
Create email sender module that:
1. Uses environment variables for credentials:
   - SMTP_SERVER (e.g., smtp.gmail.com)
   - SMTP_PORT (e.g., 587)
   - SMTP_USERNAME
   - SMTP_PASSWORD
   - RECIPIENT_EMAIL (azmi@aga.my)
2. Generates email from data/vessels_latest.json
3. Uses HTML template with dynamic data injection
4. Includes plain text alternative
5. Handles authentication errors gracefully
6. Logs email sending status
7. Implements retry logic (3 attempts with delays)

For Gmail:
- Use App Password (not regular password)
- Enable 2FA and generate app-specific password
- Use TLS/SSL encryption
```

---

## Phase 3: Scheduling & Automation

### Task 3.1: Scheduler Implementation
**Instructions for Claude Code:**
```
Create a scheduler script (scheduler.py or scheduler.js) that:
1. Runs every hour on the hour (0 minutes past each hour)
2. Executes the workflow:
   a. Run scraper
   b. Process data
   c. Send email
   d. Log completion status
3. Handles failures gracefully (log and continue)
4. Includes a manual run option for testing

Use:
- Python: APScheduler or schedule library
- Node.js: node-cron or node-schedule
```

### Task 3.2: System-Level Scheduling (Alternative)
**Instructions for Claude Code:**
```
Create documentation for system-level scheduling options:

Option A: Cron (Linux/Mac)
- Create crontab entry: 0 * * * * /path/to/venv/bin/python /path/to/main.py
- Log rotation setup
- Error notification setup

Option B: Windows Task Scheduler
- Create XML task definition
- PowerShell script wrapper
- Event log integration

Option C: GitHub Actions (Cloud-based)
- Create .github/workflows/hourly-report.yml
- Use schedule trigger: cron: '0 * * * *'
- Store secrets in GitHub Secrets
- Setup artifact retention for logs
```

---

## Phase 4: Configuration & Security

### Task 4.1: Environment Configuration
**Instructions for Claude Code:**
```
Create .env.example file with:
```
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
RECIPIENT_EMAIL=azmi@aga.my

# Scraper Configuration
FLOTILLA_URL=https://flotilla-orpin.vercel.app/
HEADLESS_MODE=true
TIMEOUT_SECONDS=30
RETRY_ATTEMPTS=3

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/scraper.log

# Timezone
TIMEZONE=Asia/Kuala_Lumpur
```
```

Create config loader that:
- Validates all required environment variables
- - Provides sensible defaults
  - - Raises clear errors for missing required values
    - ```

      ### Task 4.2: Security Best Practices
      **Instructions for Claude Code:**
      ```
      Implement:
      1. Never commit .env file (add to .gitignore)
      2. 2. Use secrets management for production:
         3.    - GitHub Secrets for GitHub Actions
               -    - Environment variables for server deployment
                    - 3. Encrypt sensitive data at rest
                      4. 4. Use HTTPS for all web requests
                         5. 5. Validate all input data
                            6. 6. Sanitize email content to prevent injection
                               7. ```

                                  ---

                                  ## Phase 5: Error Handling & Monitoring

                                  ### Task 5.1: Logging System
                                  **Instructions for Claude Code:**
                                  ```
                                  Implement comprehensive logging:
                                  1. Structured logging with timestamps
                                  2. 2. Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
                                     3. 3. Separate log files:
                                        4.    - scraper.log: Scraping activities
                                              -    - email.log: Email sending status
                                                   -    - scheduler.log: Scheduling events
                                                        - 4. Log rotation (daily, keep 30 days)
                                                          5. 5. Include context: vessel count, timestamps, errors
                                                             6. ```

                                                                ### Task 5.2: Error Notifications
                                                                **Instructions for Claude Code:**
                                                                ```
                                                                Create error notification system:
                                                                1. Send alert email when:
                                                                2.    - Scraper fails 3 times consecutively
                                                                      -    - Website structure changes (unexpected HTML)
                                                                           -    - Email sending fails
                                                                                -    - No new data for 4+ hours
                                                                                     - 2. Include error details and suggestions
                                                                                       3. 3. Rate limit notifications (max 1 per hour)
                                                                                          4. ```

                                                                                             ---

                                                                                             ## Phase 6: Testing & Validation

                                                                                             ### Task 6.1: Unit Tests
                                                                                             **Instructions for Claude Code:**
                                                                                             ```
                                                                                             Create unit tests for:
                                                                                             1. Data extraction functions
                                                                                             2. 2. Timestamp conversion (UTC to MYT)
                                                                                                3. 3. Sorting algorithm
                                                                                                   4. 4. Email template rendering
                                                                                                      5. 5. Error handling scenarios
                                                                                                        
                                                                                                         6. Use:
                                                                                                         7. - Python: pytest
                                                                                                            - - Node.js: Jest or Mocha
                                                                                                              - ```

                                                                                                                ### Task 6.2: Integration Tests
                                                                                                                **Instructions for Claude Code:**
                                                                                                                ```
                                                                                                                Create integration tests:
                                                                                                                1. Full scraping workflow (use mock website)
                                                                                                                2. 2. Email sending (use test email address)
                                                                                                                   3. 3. Data persistence and retrieval
                                                                                                                      4. 4. Schedule execution (dry run)
                                                                                                                         5. ```

                                                                                                                            ---

                                                                                                                            ## Phase 7: Documentation

                                                                                                                            ### Task 7.1: README.md
                                                                                                                            **Instructions for Claude Code:**
                                                                                                                            ```
                                                                                                                            Create comprehensive README with:
                                                                                                                            1. Project description
                                                                                                                            2. 2. Features list
                                                                                                                               3. 3. Requirements and dependencies
                                                                                                                                  4. 4. Installation instructions
                                                                                                                                     5. 5. Configuration guide
                                                                                                                                        6. 6. Usage examples
                                                                                                                                           7. 7. Deployment options
                                                                                                                                              8. 8. Troubleshooting guide
                                                                                                                                                 9. 9. Contributing guidelines
                                                                                                                                                    10. 10. License information
                                                                                                                                                        11. ```

                                                                                                                                                            ### Task 7.2: API Documentation
                                                                                                                                                            **Instructions for Claude Code:**
                                                                                                                                                            ```
                                                                                                                                                            Document:
                                                                                                                                                            1. Data structure schemas (JSON format)
                                                                                                                                                            2. 2. Function signatures and parameters
                                                                                                                                                               3. 3. Expected return values
                                                                                                                                                                  4. 4. Error codes and messages
                                                                                                                                                                     5. 5. Example API calls (if applicable)
                                                                                                                                                                        6. ```

                                                                                                                                                                           ---

                                                                                                                                                                           ## Phase 8: Deployment

                                                                                                                                                                           ### Task 8.1: Local Deployment
                                                                                                                                                                           **Instructions for Claude Code:**
                                                                                                                                                                           ```
                                                                                                                                                                           Create deployment script that:
                                                                                                                                                                           1. Checks system requirements
                                                                                                                                                                           2. 2. Installs dependencies
                                                                                                                                                                              3. 3. Sets up virtual environment
                                                                                                                                                                                 4. 4. Configures environment variables
                                                                                                                                                                                    5. 5. Tests the setup
                                                                                                                                                                                       6. 6. Starts the scheduler
                                                                                                                                                                                          7. 7. Provides status dashboard
                                                                                                                                                                                             8. ```

                                                                                                                                                                                                ### Task 8.2: Cloud Deployment Options
                                                                                                                                                                                                **Instructions for Claude Code:**
                                                                                                                                                                                                ```
                                                                                                                                                                                                Create deployment guides for:
                                                                                                                                                                                                
                                                                                                                                                                                                Option A: GitHub Actions (Recommended for Simplicity)
                                                                                                                                                                                                - Runs in cloud, no server needed
                                                                                                                                                                                                - - Free tier: 2000 minutes/month
                                                                                                                                                                                                  - - Automated, reliable, version controlled
                                                                                                                                                                                                   
                                                                                                                                                                                                    - Option B: Docker Container
                                                                                                                                                                                                    - - Create Dockerfile
                                                                                                                                                                                                      - - Docker Compose configuration
                                                                                                                                                                                                        - - Deployment to any cloud provider (AWS, Azure, GCP)
                                                                                                                                                                                                         
                                                                                                                                                                                                          - Option C: Serverless Functions
                                                                                                                                                                                                          - - AWS Lambda + EventBridge
                                                                                                                                                                                                            - - Azure Functions + Timer Trigger
                                                                                                                                                                                                              - - Google Cloud Functions + Scheduler
                                                                                                                                                                                                                - ```

                                                                                                                                                                                                                  ---

                                                                                                                                                                                                                  ## Phase 9: Maintenance & Monitoring

                                                                                                                                                                                                                  ### Task 9.1: Health Check Dashboard
                                                                                                                                                                                                                  **Instructions for Claude Code:**
                                                                                                                                                                                                                  ```
                                                                                                                                                                                                                  Create a simple status page (HTML) that shows:
                                                                                                                                                                                                                  1. Last successful scrape time
                                                                                                                                                                                                                  2. 2. Next scheduled run
                                                                                                                                                                                                                     3. 3. Total vessels monitored
                                                                                                                                                                                                                        4. 4. Recent errors (last 24 hours)
                                                                                                                                                                                                                           5. 5. Email delivery status
                                                                                                                                                                                                                              6. 6. System uptime
                                                                                                                                                                                                                                 7. ```

                                                                                                                                                                                                                                    ### Task 9.2: Backup Strategy
                                                                                                                                                                                                                                    **Instructions for Claude Code:**
                                                                                                                                                                                                                                    ```
                                                                                                                                                                                                                                    Implement:
                                                                                                                                                                                                                                    1. Daily backup of historical data
                                                                                                                                                                                                                                    2. 2. Configuration backup
                                                                                                                                                                                                                                       3. 3. Log archival
                                                                                                                                                                                                                                          4. 4. Recovery procedures documentation
                                                                                                                                                                                                                                             5. ```

                                                                                                                                                                                                                                                ---

                                                                                                                                                                                                                                                ## Quick Start Commands

                                                                                                                                                                                                                                                ### For Claude Code to Execute:

                                                                                                                                                                                                                                                ```bash
                                                                                                                                                                                                                                                # Python Implementation
                                                                                                                                                                                                                                                python -m venv venv
                                                                                                                                                                                                                                                source venv/bin/activate  # On Windows: venv\Scripts\activate
                                                                                                                                                                                                                                                pip install -r requirements.txt
                                                                                                                                                                                                                                                python src/scraper.py  # Test scraper
                                                                                                                                                                                                                                                python src/main.py     # Run full workflow
                                                                                                                                                                                                                                                ```
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                ```bash
                                                                                                                                                                                                                                                # Node.js Implementation
                                                                                                                                                                                                                                                npm install
                                                                                                                                                                                                                                                npm test              # Run tests
                                                                                                                                                                                                                                                npm run scrape        # Test scraper
                                                                                                                                                                                                                                                npm start             # Run full workflow
                                                                                                                                                                                                                                                ```
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                ---
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                ## Success Criteria
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                - [ ] Successfully scrapes all 44 vessels
                                                                                                                                                                                                                                                - [ ] - [ ] Correctly converts UTC to Malaysia Time
                                                                                                                                                                                                                                                - [ ] - [ ] Sorts vessels by latest timestamp
                                                                                                                                                                                                                                                - [ ] - [ ] Sends formatted email to azmi@aga.my
                                                                                                                                                                                                                                                - [ ] - [ ] Runs automatically every hour
                                                                                                                                                                                                                                                - [ ] - [ ] Handles errors gracefully
                                                                                                                                                                                                                                                - [ ] - [ ] Logs all activities
                                                                                                                                                                                                                                                - [ ] - [ ] Maintains data history
                                                                                                                                                                                                                                                - [ ] - [ ] Can recover from failures
                                                                                                                                                                                                                                                - [ ] - [ ] Well documented and tested
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] ---
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] ## Priority Order for Implementation
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] 1. **Phase 1 (Scraper)** - Core functionality
                                                                                                                                                                                                                                                - [ ] 2. **Phase 2 (Email)** - Reporting capability
                                                                                                                                                                                                                                                - [ ] 3. **Phase 3 (Scheduler)** - Automation
                                                                                                                                                                                                                                                - [ ] 4. **Phase 4 (Config)** - Production readiness
                                                                                                                                                                                                                                                - [ ] 5. **Phase 5 (Monitoring)** - Reliability
                                                                                                                                                                                                                                                - [ ] 6. **Phase 6 (Testing)** - Quality assurance
                                                                                                                                                                                                                                                - [ ] 7. **Phase 7 (Documentation)** - Maintainability
                                                                                                                                                                                                                                                - [ ] 8. **Phase 8 (Deployment)** - Production deployment
                                                                                                                                                                                                                                                - [ ] 9. **Phase 9 (Maintenance)** - Long-term operations
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] ---
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] ## Notes for Claude Code
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] - Start with Phase 1 and work sequentially
                                                                                                                                                                                                                                                - [ ] - Test each module thoroughly before proceeding
                                                                                                                                                                                                                                                - [ ] - Keep code modular and maintainable
                                                                                                                                                                                                                                                - [ ] - Follow PEP 8 (Python) or Airbnb style guide (JavaScript)
                                                                                                                                                                                                                                                - [ ] - Add comments for complex logic
                                                                                                                                                                                                                                                - [ ] - Use type hints/annotations where applicable
                                                                                                                                                                                                                                                - [ ] - Handle edge cases explicitly
                                                                                                                                                                                                                                                - [ ] - Optimize for reliability over speed
                                                                                                                                                                                                                                                - [ ] - Consider the website may change - build resilient scrapers
                                                                                                                                                                                                                                                - [ ] - Always validate data before sending emails
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] ---
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] ## Contact & Support
                                                                                                                                                                                                                                               
                                                                                                                                                                                                                                                - [ ] For questions or issues, refer to the GitHub repository issues section or contact the maintainer.
