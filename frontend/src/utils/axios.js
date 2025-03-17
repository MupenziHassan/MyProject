import axios from 'axios';

// Create a new axios instance with the correct base URL
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1'
});

export default instance;
