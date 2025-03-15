const twilio = require('twilio');

/**
 * Service for handling SMS delivery
 */
class SmsService {
  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    // Initialize Twilio client if credentials are available
    if (this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    }
  }

  /**
   * Send an SMS message
   * @param {Object} options - SMS options
   * @param {string} options.to - Recipient phone number
   * @param {string} options.message - SMS message content
   * @param {string} options.from - Sender phone number (optional)
   * @returns {Promise<Object>} - SMS send result
   */
  async sendSms(options) {
    try {
      // Check if Twilio is configured
      if (!this.client) {
        throw new Error('SMS service not properly configured');
      }

      // Send SMS using Twilio
      const message = await this.client.messages.create({
        body: options.message,
        from: options.from || this.fromNumber,
        to: options.to
      });

      return {
        success: true,
        sid: message.sid,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }

  /**
   * Format and process SMS template with variables
   * @param {string} template - SMS template string
   * @param {Object} variables - Template variables
   * @returns {string} - Formatted SMS content
   */
  processTemplate(template, variables) {
    let processedTemplate = template;
    
    // Replace placeholders with actual values
    Object.keys(variables).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processedTemplate = processedTemplate.replace(placeholder, variables[key]);
    });
    
    return processedTemplate;
  }
}

module.exports = new SmsService();
