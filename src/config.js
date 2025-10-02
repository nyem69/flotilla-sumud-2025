require('dotenv').config();

const config = {
  // Email configuration
  smtp: {
    server: process.env.SMTP_SERVER || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
    recipient: process.env.RECIPIENT_EMAIL || 'azmi@aga.my'
  },

  // Scraper configuration
  scraper: {
    url: process.env.FLOTILLA_URL || 'https://flotilla-orpin.vercel.app/',
    headlessMode: process.env.HEADLESS_MODE === 'true',
    timeoutSeconds: parseInt(process.env.TIMEOUT_SECONDS) || 30,
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS) || 3
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'INFO',
    file: process.env.LOG_FILE || 'logs/scraper.log'
  },

  // Timezone configuration
  timezone: process.env.TIMEZONE || 'Asia/Kuala_Lumpur'
};

// Validate required configuration
function validateConfig() {
  const required = [
    { key: 'SMTP_USERNAME', value: config.smtp.username },
    { key: 'SMTP_PASSWORD', value: config.smtp.password }
  ];

  const missing = required.filter(item => !item.value);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.map(m => m.key).join(', ')}\n` +
      'Please create a .env file based on .env.example'
    );
  }
}

// Only validate if not in test mode
if (process.env.NODE_ENV !== 'test') {
  try {
    validateConfig();
  } catch (error) {
    console.error('Configuration Error:', error.message);
    process.exit(1);
  }
}

module.exports = config;
