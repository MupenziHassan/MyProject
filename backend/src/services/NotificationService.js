const emailService = require('./EmailService');

class NotificationService {
  /**
   * Send a notification to user through available channels
   */
  async sendNotification(options) {
    // For now, we'll just log the notification and send email if enabled
    console.log(`Notification for ${options.user?.email || 'unknown user'}:`, options.message);
    
    const results = {
      inApp: true,
      email: false
    };
    
    // Send email if user has email and email sending is enabled
    if (options.email && options.user?.email) {
      const emailResult = await emailService.sendEmail({
        to: options.user.email,
        subject: options.subject || 'Notification from Health Prediction System',
        text: options.message,
        html: options.html
      });
      
      results.email = emailResult.success;
    }
    
    return results;
  }

  /**
   * Send test result notification to patient
   */
  async sendTestResultNotification(patient, test, doctor) {
    return this.sendNotification({
      user: patient,
      subject: 'Your Test Results Are Ready',
      message: `Your test results for ${test.name} are now available. Please log in to view them.`,
      html: `<p>Your test results for <strong>${test.name}</strong> are now available.</p>
             <p>Doctor: ${doctor?.name || 'Unknown'}</p>
             <p>Date: ${new Date(test.date).toLocaleDateString()}</p>
             <p>Please log in to view them.</p>`,
      email: true
    });
  }

  /**
   * Send prediction notification to patient
   */
  async sendPredictionNotification(patient, prediction, doctor) {
    return this.sendNotification({
      user: patient,
      subject: 'Risk Assessment Results Available',
      message: `Your risk assessment results for ${prediction.condition} are now available. Risk level: ${prediction.riskLevel}`,
      html: `<p>Your risk assessment results are now available.</p>
             <p>Condition: ${prediction.condition}</p>
             <p>Risk Level: <strong>${prediction.riskLevel}</strong></p>
             <p>Please log in to view the details.</p>`,
      email: true
    });
  }
}

module.exports = new NotificationService();
