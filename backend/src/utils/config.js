// ...existing code...

// Load environment-specific .env file
const loadEnvConfig = () => {
  const environment = process.env.NODE_ENV || 'development';
  
  // Default .env file
  const defaultEnvPath = path.resolve(process.cwd(), '.env');
  
  // Environment-specific .env file (e.g., .env.production)
  const envPath = path.resolve(process.cwd(), `.env.${environment}`);
  
  // Try to load environment-specific file first, fall back to default
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log(`Loaded environment variables from ${envPath}`);
  } else if (fs.existsSync(defaultEnvPath)) {
    dotenv.config();
    console.log(`Loaded environment variables from ${defaultEnvPath}`);
  } else {
    console.warn('No .env file found. Using environment variables from the system.');
  }
};

// Get config value with type checking and default
const get = (key, defaultValue = null, type = 'string') => {
  const value = process.env[key];
  
  if (value === undefined) {
    return defaultValue;
  }
  
  switch (type) {
    case 'number':
      return Number(value);
    case 'boolean':
      return value === 'true' || value === '1';
    case 'json':
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error(`Error parsing JSON from env var ${key}`);
        return defaultValue;
      }
    case 'array':
      return value.split(',').map(item => item.trim());
    default:
      return value;
  }
};

// Required config - will throw error if missing
const required = (key) => {
  const value = process.env[key];
  
  if (value === undefined) {
    throw new Error(`Required environment variable ${key} is missing`);
  }
  
  return value;
};

// Export config utility
module.exports = {
  loadEnvConfig,
  get,
  required
};
