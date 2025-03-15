const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * Service for handling email delivery
 */
class EmailService {
  constructor() {
    // Create transporter with configuration from environment
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@healthprediction.com';
    this.templatesDir = path.join(__dirname, '../templates/email');
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
      // Get template content
      const templatePath = path.join(this.templatesDir, `${options.template}.html`);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      
      // Compile template with Handlebars
      const template = handlebars.compile(templateSource);
      const html = template(options.variables);

      // Send email
      const result = await this.transporter.sendMail({
        from: options.from || this.defaultFrom,
        to: options.to,
        subject: options.subject,
        html: html,
        text: this.htmlToText(html) // Simple text version
      });

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
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

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Convert HTML content to plain text
   * @param {string} html - HTML content
   * @returns {string} - Plain text
   */
  htmlToText(html) {
    // Very basic HTML to text conversion
    // In a production app, use a library like html-to-text
    return html
      .replace(/<style[^>]*>.*?<\/style>/gs, '')
      .replace(/<script[^>]*>.*?<\/script>/gs, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new EmailService();
