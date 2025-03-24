import { useEffect } from 'react';
import eventBus from '../utils/eventBus';

/**
 * Hook for component communication
 * @param {string} eventName - Event to listen for
 * @param {function} callback - Function to call when event is triggered
 */
const useComponentCommunication = (eventName, callback) => {
  useEffect(() => {
    // Subscribe to event
    const unsubscribe = eventBus.subscribe(eventName, callback);
    
    // Unsubscribe on component unmount
    return () => {
      unsubscribe();
    };
  }, [eventName, callback]);
  
  // Return function to emit events
  return (data) => {
    eventBus.publish(eventName, data);
  };
};

export default useComponentCommunication;
