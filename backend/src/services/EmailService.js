const nodemailer = require('nodemailer');
let handlebars;
try {
  handlebars = require('handlebars');
} catch (error) {
  console.warn('Handlebars not installed. Fallback template rendering will be used.');
  // Simple template renderer function as fallback
  handlebars = {
    compile: (template) => (data) => {
      let result = template;
      Object.keys(data).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, data[key]);
      });
      return result;
    }
  };
}
const fs = require('fs');
const path = require('path');

/**
 * Service for handling email delivery
 */
class EmailService {
  constructor() {
    // Create a test account if we're in development mode
    if (process.env.NODE_ENV !== 'production') {
      this.createTestAccount();
    } else {
      this.initializeTransporter();
    }

    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@healthprediction.com';
    this.templatesDir = path.join(__dirname, '../templates/email');
    
    // Create templates directory if it doesn't exist
    if (!fs.existsSync(this.templatesDir)) {
      try {
        fs.mkdirSync(this.templatesDir, { recursive: true });
      } catch (error) {
        console.warn(`Could not create templates directory: ${error.message}`);
      }
    }
  }

  // Initialize the email transporter with environment variables
  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Create a test account for development
  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Using test email account:', testAccount.user);
    } catch (error) {
      console.error('Failed to create test email account:', error);
      // Fallback to dummy transporter
      this.transporter = {
        sendMail: (options) => {
          console.log('Email would be sent in production:', options);
          return Promise.resolve({ messageId: 'test-message-id' });
        }
      };
    }
  }

  /**
   * Send an email using a template
   * @param {Object} options - Email options
   * @param {string} options.to - Recipient email
   * @param {string} options.subject - Email subject
   * @param {string} options.template - Template name (filename without extension)
   * @param {Object} options.variables - Template variables
   * @param {string} options.from - Sender email (optional)
   * @returns {Promise<Object>} - Email send result
   */
  async sendTemplatedEmail(options) {
    try {
      if (!handlebars) {
        console.warn('Email templating skipped: handlebars not available');
        return this.sendEmail({
          to: options.to,
          subject: options.subject,
          text: `Template: ${options.template}\nVariables: ${JSON.stringify(options.variables)}`,
          html: `<p>Template: ${options.template}</p><pre>${JSON.stringify(options.variables, null, 2)}</pre>`
        });
      }
      
      // Get template content
      const templatePath = path.join(this.templatesDir, `${options.template}.html`);
      
      let html;
      try {
        const templateSource = fs.readFileSync(templatePath, 'utf8');
        const template = handlebars.compile(templateSource);
        html = template(options.variables);
      } catch (error) {
        console.warn(`Template error: ${error.message}. Using fallback.`);
        html = `<h1>${options.subject}</h1><pre>${JSON.stringify(options.variables, null, 2)}</pre>`;
      }

      // Send email
      const result = await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: html,
        text: this.htmlToText(html) // Simple text version
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent in dev mode:', nodemailer.getTestMessageUrl(result));
      }

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send a simple text email
   * @param {Object} options - Email options
   * @returns {Promise<Object>} - Email send result
   */
  async sendEmail(options) {
    try {
      const result = await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || null
      });

      if (process.env.NODE_ENV !== 'production') {
        console.log('Email sent in dev mode:', nodemailer.getTestMessageUrl(result));
      }

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Convert HTML content to plain text
   * @param {string} html - HTML content
   * @returns {string} - Plain text
   */
  htmlToText(html) {
    // Very basic HTML to text conversion
    if (!html) return '';
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new EmailService();
