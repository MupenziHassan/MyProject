import apiClient from './apiClient';

export const testDatabaseConnection = async () => {
  try {
    const response = await apiClient.get('/db-status');
    return {
      isConnected: response.data.connected,
      details: response.data
    };
  } catch (error) {
    console.error('Error testing database connection:', error);
    return {
      isConnected: false,
      error: error.response?.status === 429 
        ? "Rate limit exceeded. Please try again later." 
        : error.message
    };
  }
};

export const testDataFetch = async () => {
  try {
    // Make a request to an endpoint that should return real data
    const response = await apiClient.get('/status');
    
    // Check if the data looks real or mocked
    const isMockData = response.data.isMock === true;
    
    return {
      success: true,
      isMockData,
      data: response.data
    };
  } catch (error) {
    console.error('Error testing data fetch:', error);
    return {
      success: false,
      error: error.response?.status === 429 
        ? "Rate limit exceeded. Please try again later." 
        : error.message
    };
  }
};
