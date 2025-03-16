module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:cypress/recommended'
  ],
  plugins: [
    'cypress'
  ],
  env: {
    'cypress/globals': true
  }
};
