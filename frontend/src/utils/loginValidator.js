/**
 * Utility to validate login credentials and help diagnose login issues
 */

// Known test accounts from the setupUsers.js script
const TEST_ACCOUNTS = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'doctor@example.com', password: 'doctor123', role: 'doctor' },
  { email: 'patient@example.com', password: 'patient123', role: 'patient' }
];

/**
 * Validates if credentials match a known test account
 * @param {string} email - Email to check
 * @param {string} password - Password to check
 * @returns {Object} Result of validation
 */
export const validateCredentials = (email, password) => {
  // Check if email is properly formatted
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { 
      valid: false, 
      message: 'Email format is invalid. Please provide a valid email address.'
    };
  }
  
  // Check if the credentials match a test account
  const matchingAccount = TEST_ACCOUNTS.find(account => 
    account.email.toLowerCase() === email.toLowerCase()
  );
  
  if (!matchingAccount) {
    return { 
      valid: false, 
      message: `Email "${email}" is not recognized as a test account. Available test accounts: ${TEST_ACCOUNTS.map(a => a.email).join(', ')}`
    };
  }
  
  if (matchingAccount.password !== password) {
    return { 
      valid: false, 
      message: `Password is incorrect for ${email}. The correct password is "${matchingAccount.password}"`
    };
  }
  
  return { valid: true, role: matchingAccount.role };
};

/**
 * Helper function to check credentials and provide hints
 */
export const checkCredentialsAndProvideHints = (email, password) => {
  const result = validateCredentials(email, password);
  
  if (result.valid) {
    console.log(`✅ Credentials match test account for role: ${result.role}`);
    return null;
  } else {
    console.warn(`❌ Credential validation failed: ${result.message}`);
    return result.message;
  }
};
