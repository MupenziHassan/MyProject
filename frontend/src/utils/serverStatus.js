/**
 * Simple utility for server status functions
 */

/**
 * Gets OS-specific server start instructions 
 * @returns {string[]} List of instructions
 */
export const getServerStartInstructions = () => {
  const isWindows = navigator.platform.toLowerCase().includes('win');
  
  if (isWindows) {
    return [
      '1. Open Command Prompt as Administrator',
      '2. Navigate to the project directory: cd path\\to\\Health-prediction-system',
      '3. Start the backend: cd backend && npm start',
      '4. Open a new Command Prompt and start the frontend: cd frontend && npm start'
    ];
  } else {
    return [
      '1. Open Terminal',
      '2. Navigate to the project directory: cd path/to/Health-prediction-system',
      '3. Start the backend: cd backend && npm start',
      '4. Open a new Terminal and start the frontend: cd frontend && npm start'
    ];
  }
};

/**
 * Checks server connection status
 * @returns {Promise<{connected: boolean, port?: number, error?: string}>}
 */
export const checkServerConnection = async () => {
  // ... existing function implementation ...
  return { connected: false, error: 'Function not implemented' };
};

/**
 * Check server status with retry mechanism
 */
export const checkServerStatus = async () => {
  // ... existing function implementation ...
  return { running: false, message: 'Function not implemented' };
};
