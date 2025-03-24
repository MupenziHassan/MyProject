/**
 * Simple event bus for component communication
 * Allows components to communicate without direct props or context
 */
const eventBus = {
  events: {},
  
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {function} callback - Function to call when event is triggered
   * @returns {function} Unsubscribe function
   */
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  /**
   * Publish an event with data
   * @param {string} event - Event name
   * @param {any} data - Data to pass to subscribers
   */
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(data);
      });
    }
  }
};

export default eventBus;
