const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:3000',
  },
  env: {
    apiUrl: 'http://localhost:8080/api/v1'
  },
  video: false,
  screenshotOnRunFailure: false,
});
