module.exports = function override(config, env) {
  // Add polyfills for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "path": require.resolve("path-browserify"),
    "fs": false,
    "util": require.resolve("util/"),
    "assert": require.resolve("assert/"),
    "stream": require.resolve("stream-browserify"),
    "constants": require.resolve("constants-browserify")
  };
  
  return config;
};
