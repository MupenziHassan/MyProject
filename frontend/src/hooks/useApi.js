import { useState, useEffect, useCallback, useRef } from 'react';
import apiConnection from '../utils/apiConnection';

/**
 * Custom hook for making API requests with caching, loading state, and error handling
 * @param {Object} options - Hook options
 * @returns {Object} - API state and request function
 */
export function useApi(options = {}) {
  const {
    endpoint = null,
    method = 'get',
    initialData = null,
    params = null,
    body = null,
    autoFetch = true,
    cacheDuration = 5 * 60 * 1000, // 5 minutes by default
    cacheKey = null,
    onSuccess = null,
    onError = null
  } = options;
  
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [timestamp, setTimestamp] = useState(null);
  
  // Keep a reference to the request options to avoid dependency issues
  const requestOptionsRef = useRef({ 
    endpoint, method, params, body, cacheKey, cacheDuration, onSuccess, onError 
  });
  
  // Update request options when props change
  useEffect(() => {
    requestOptionsRef.current = { 
      endpoint, method, params, body, cacheKey, cacheDuration, onSuccess, onError 
    };
  }, [endpoint, method, params, body, cacheKey, cacheDuration, onSuccess, onError]);
  
  // Function to make the API request
  const fetchData = useCallback(async (customOptions = {}) => {
    // Get the current options
    const options = requestOptionsRef.current;
    
    // Override options with custom options
    const { 
      endpoint: customEndpoint, 
      method: customMethod, 
      params: customParams, 
      body: customBody,
      skipCache = false
    } = customOptions;
    
    const requestEndpoint = customEndpoint || options.endpoint;
    const requestMethod = customMethod || options.method;
    const requestParams = customParams || options.params;
    const requestBody = customBody || options.body;
    
    // If no endpoint, return
    if (!requestEndpoint) {
      console.warn('No endpoint provided to useApi hook');
      return;
    }
    
    // Generate cache key
    const actualCacheKey = options.cacheKey || 
      `${requestMethod}-${requestEndpoint}-${JSON.stringify(requestParams)}-${JSON.stringify(requestBody)}`;
    
    // Check cache if GET request and not skipping cache
    if (!skipCache && requestMethod.toLowerCase() === 'get') {
      try {
        const cachedData = localStorage.getItem(`api-cache-${actualCacheKey}`);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = new Date().getTime();
          
          // If cache is still valid, use it
          if (now - timestamp < options.cacheDuration) {
            setData(data);
            setTimestamp(timestamp);
            setIsLoading(false);
            return { data, cached: true };
          }
        }
      } catch (e) {
        console.warn('Error reading from cache:', e);
      }
    }
    
    // Make API request
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiConnection.request(
        requestMethod,
        requestEndpoint,
        requestMethod.toLowerCase() === 'get' ? requestParams : requestBody
      );
      
      // Set data and timestamp
      setData(response);
      const now = new Date().getTime();
      setTimestamp(now);
      setIsLoading(false);
      
      // Cache response if GET request
      if (requestMethod.toLowerCase() === 'get') {
        try {
          localStorage.setItem(`api-cache-${actualCacheKey}`, JSON.stringify({
            data: response,
            timestamp: now
          }));
        } catch (e) {
          console.warn('Error writing to cache:', e);
        }
      }
      
      // Call onSuccess callback if provided
      if (options.onSuccess) {
        options.onSuccess(response);
      }
      
      return { data: response, cached: false };
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'An error occurred');
      setIsLoading(false);
      
      // Call onError callback if provided
      if (options.onError) {
        options.onError(error);
      }
      
      throw error;
    }
  }, []);
  
  // Fetch data automatically if autoFetch is true
  useEffect(() => {
    if (autoFetch && requestOptionsRef.current.endpoint) {
      fetchData();
    }
  }, [autoFetch, fetchData]);
  
  // Clear cache for this request
  const clearCache = useCallback(() => {
    if (!requestOptionsRef.current.endpoint) return;
    
    const actualCacheKey = requestOptionsRef.current.cacheKey || 
      `${requestOptionsRef.current.method}-${requestOptionsRef.current.endpoint}-${JSON.stringify(requestOptionsRef.current.params)}-${JSON.stringify(requestOptionsRef.current.body)}`;
    
    try {
      localStorage.removeItem(`api-cache-${actualCacheKey}`);
    } catch (e) {
      console.warn('Error clearing cache:', e);
    }
  }, []);
  
  // Return API state and request function
  return {
    data,
    isLoading,
    error,
    timestamp,
    fetchData,
    clearCache
  };
}

export default useApi;
