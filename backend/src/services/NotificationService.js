const Notification = require('../models/Notification');
const NotificationTemplate = require('../models/NotificationTemplate');
const emailService = require('./EmailService');
const smsService = require('./SmsService');
const handlebars = require('handlebars');

/**
 * Service for handling all types of notifications
 */
class NotificationService {
  /**
   * Create a new notification
   * @param {Object} notificationData - Notification data
   * @returns {Promise<Object>} Created notification
   */
  async createNotification(notificationData) {
    try {
      const notification = await Notification.create(notificationData);
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  }

  /**
   * Process and send a notification using a template
   * @param {Object} options - Notification options
   * @param {string} options.templateName - Template name
   * @param {Object} options.user - User receiving the notification
   * @param {Object} options.variables - Template variables
   * @param {Object} options.relatedTo - Related entity
   * @param {string} options.priority - Notification priority
   * @returns {Promise<Object>} Created notification with delivery status
   */
  async sendTemplatedNotification(options) {
    try {
      // Get notification template
      const template = await NotificationTemplate.findOne({ name: options.templateName });
      
      if (!template) {
        throw new Error(`Template '${options.templateName}' not found`);
      }

      // Create notification data
      const notificationData = {
        user: options.user._id,
        type: template.type,
        priority: options.priority || 'medium',
        relatedTo: options.relatedTo || { model: null, id: null }
      };

      // Process in-app notification
      if (template.channels.inApp.enabled) {
        // Compile title and message templates
        const titleTemplate = handlebars.compile(template.channels.inApp.title);
        const messageTemplate = handlebars.compile(template.channels.inApp.template);
        
        notificationData.title = titleTemplate(options.variables);
        notificationData.message = messageTemplate(options.variables);
      } else {
        // Fallback if in-app is disabled
        notificationData.title = options.templateName;
        notificationData.message = 'Notification';
      }

      // Create notification record
      const notification = await this.createNotification(notificationData);

      // Attempt to deliver via email
      if (template.channels.email.enabled && options.user.email) {
        try {
          const emailSubject = handlebars.compile(template.channels.email.subject)(options.variables);
          
          await emailService.sendTemplatedEmail({
            to: options.user.email,
            subject: emailSubject,
            template: `${options.templateName}_email`,
            variables: options.variables
          });

          // Update notification with email status
          notification.deliveryStatus.email = {
            sent: true,
            sentAt: new Date()
          };
          await notification.save();
        } catch (emailError) {
          console.error('Email delivery failed:', emailError);
        }
      }

      // Attempt to deliver via SMS
      if (template.channels.sms.enabled && options.user.phoneNumber) {
        try {
          const smsMessage = smsService.processTemplate(
            template.channels.sms.template,
            options.variables
          );
          
          await smsService.sendSms({
            to: options.user.phoneNumber,
            message: smsMessage
          });

          // Update notification with SMS status
          notification.deliveryStatus.sms = {
            sent: true,
            sentAt: new Date()
          };
          await notification.save();
        } catch (smsError) {
          console.error('SMS delivery failed:', smsError);
        }
      }

      return notification;
    } catch (error) {
      console.error('Error sending templated notification:', error);
      throw new Error(`Failed to send notification: ${error.message}`);
    }
  }

  /**
   * Send test result notification to patient
   * @param {Object} patient - Patient user object
   * @param {Object} test - Test object
   * @param {Object} doctor - Doctor user object
   * @returns {Promise<Object>} Created notification
   */
  async sendTestResultNotification(patient, test, doctor) {
    return await this.sendTemplatedNotification({
      templateName: 'test_result_ready',
      user: patient,
      variables: {
        patientName: patient.name,
        testName: test.name,
        testDate: new Date(test.date).toLocaleDateString(),
        doctorName: doctor.name,
        viewUrl: `${process.env.FRONTEND_URL}/tests/${test._id}`
      },
      relatedTo: {
        model: 'Test',
        id: test._id
      },
      priority: 'high'
    });
  }

  /**
   * Send prediction notification to patient
   * @param {Object} patient - Patient user object
   * @param {Object} prediction - Prediction object
   * @param {Object} doctor - Doctor user object
   * @returns {Promise<Object>} Created notification
   */
  async sendPredictionNotification(patient, prediction, doctor) {
    return await this.sendTemplatedNotification({
      templateName: 'prediction_result',
      user: patient,
      variables: {
        patientName: patient.name,
        condition: prediction.condition,
        riskLevel: prediction.riskLevel,
        doctorName: doctor.name,
        viewUrl: `${process.env.FRONTEND_URL}/predictions/${prediction._id}`
      },
      relatedTo: {
        model: 'Prediction',
        id: prediction._id
      },
      priority: 'high'
    });
  }

  /**
   * Send appointment reminder notification
   * @param {Object} patient - Patient user object
   * @param {Object} appointment - Appointment object
   * @returns {Promise<Object>} Created notification
   */
  async sendAppointmentReminder(patient, appointment, doctor) {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString();
    const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return await this.sendTemplatedNotification({
      templateName: 'appointment_reminder',
      user: patient,
      variables: {
        patientName: patient.name,
        doctorName: doctor.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        appointmentType: appointment.type,
        viewUrl: `${process.env.FRONTEND_URL}/appointments/${appointment._id}`
      },
      relatedTo: {
        model: 'Appointment',
        id: appointment._id
      },
      priority: 'medium'
    });
  }

  /**
   * Send appointment notification to patient and doctor
   * @param {Object} patient - Patient user object
   * @param {Object} doctor - Doctor user object
   * @param {Object} appointment - Appointment object
   * @returns {Promise<Array>} Created notifications
   */
  async sendAppointmentNotification(patient, doctor, appointment) {
    const notifications = [];
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString();
    const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Notification for patient
    const patientNotification = await this.sendTemplatedNotification({
      templateName: 'appointment_scheduled',
      user: patient,
      variables: {
        patientName: patient.name,
        doctorName: doctor.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        appointmentType: appointment.type,
        reason: appointment.reason,
        viewUrl: `${process.env.FRONTEND_URL}/appointments/${appointment._id}`
      },
      relatedTo: {
        model: 'Appointment',
        id: appointment._id
      },
      priority: 'medium'
    });
    
    notifications.push(patientNotification);

    // Notification for doctor
    const doctorNotification = await this.sendTemplatedNotification({
      templateName: 'new_appointment',
      user: doctor,
      variables: {
        doctorName: doctor.name,
        patientName: patient.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        appointmentType: appointment.type,
        reason: appointment.reason,
        viewUrl: `${process.env.FRONTEND_URL}/doctor/appointments/${appointment._id}`
      },
      relatedTo: {
        model: 'Appointment',
        id: appointment._id
      },
      priority: 'medium'
    });
    
    notifications.push(doctorNotification);

    return notifications;
  }

  /**
   * Send appointment update notification
   * @param {Object} patient - Patient user object
   * @param {Object} doctor - Doctor user object
   * @param {Object} appointment - Appointment object
   * @param {String} updatedBy - Role of the user who made the update
   * @returns {Promise<Object>} Created notification
   */
  async sendAppointmentUpdateNotification(patient, doctor, appointment, updatedBy) {
    const appointmentDate = new Date(appointment.date);
    const formattedDate = appointmentDate.toLocaleDateString();
    const formattedTime = appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Determine who to notify based on who made the update
    const userToNotify = updatedBy === 'doctor' ? patient : doctor;
    const updatedByName = updatedBy === 'doctor' ? doctor.name : patient.name;
    
    return await this.sendTemplatedNotification({
      templateName: 'appointment_status_changed',
      user: userToNotify,
      variables: {
        userName: userToNotify.name,
        appointmentDate: formattedDate,
        appointmentTime: formattedTime,
        newStatus: appointment.status,
        updatedBy: updatedByName,
        viewUrl: updatedBy === 'doctor' 
          ? `${process.env.FRONTEND_URL}/appointments/${appointment._id}`
          : `${process.env.FRONTEND_URL}/doctor/appointments/${appointment._id}`
      },
      relatedTo: {
        model: 'Appointment',
        id: appointment._id
      },
      priority: appointment.status === 'cancelled' ? 'high' : 'medium'
    });
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        throw new Error('Notification not found or not accessible');
      }

      notification.status.read = true;
      notification.status.readAt = new Date();
      await notification.save();

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw new Error(`Failed to update notification: ${error.message}`);
    }
  }

  /**
   * Get user notifications
   * @param {string} userId - User ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 20, unreadOnly = false, page = 1 } = options;
      const skip = (page - 1) * limit;

      const query = { user: userId };
      if (unreadOnly) {
        query['status.read'] = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  }
}

module.exports = new NotificationService();
