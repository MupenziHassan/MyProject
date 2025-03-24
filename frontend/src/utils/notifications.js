import eventBus from './eventBus';

// Toast notification types
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning'
};

// Toast notification system
const notifications = {
  /**
   * Show success notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms (default: 3000)
   */
  success(message, duration = 3000) {
    this.show(message, NOTIFICATION_TYPES.SUCCESS, duration);
  },
  
  /**
   * Show error notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms (default: 5000)
   */
  error(message, duration = 5000) {
    this.show(message, NOTIFICATION_TYPES.ERROR, duration);
  },
  
  /**
   * Show info notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms (default: 3000)
   */
  info(message, duration = 3000) {
    this.show(message, NOTIFICATION_TYPES.INFO, duration);
  },
  
  /**
   * Show warning notification
   * @param {string} message - Message to display
   * @param {number} duration - Duration in ms (default: 4000)
   */
  warning(message, duration = 4000) {
    this.show(message, NOTIFICATION_TYPES.WARNING, duration);
  },
  
  /**
   * Show notification
   * @param {string} message - Message to display
   * @param {string} type - Notification type
   * @param {number} duration - Duration in ms
   */
  show(message, type, duration) {
    const id = Date.now();
    
    // Publish notification event
    eventBus.publish('notification', {
      id,
      message,
      type,
      duration
    });
    
    // Automatically remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    
    return id;
  },
  
  /**
   * Remove notification
   * @param {number} id - Notification ID
   */
  remove(id) {
    eventBus.publish('notification-remove', id);
  }
};

export default notifications;
