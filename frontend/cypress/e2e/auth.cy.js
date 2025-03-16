describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear database and seed test users
    cy.request('POST', 'http://localhost:5000/api/testing/reset');
    cy.request('POST', 'http://localhost:5000/api/testing/users', {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'patient'
    });
  });
  
  it('should show login page', () => {
    cy.visit('/login');
    cy.contains('h2', 'Login to Your Account');
    cy.get('input[name="email"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });
  
  it('should login with valid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/patient/dashboard');
    cy.contains('Welcome back, Test User');
  });
  
  it('should show error with invalid credentials', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.contains('Login failed. Please check your credentials.');
    cy.url().should('include', '/login');
  });
  
  it('should register a new user', () => {
    cy.visit('/register');
    cy.get('input[name="name"]').type('New User');
    cy.get('input[name="email"]').type('new@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('input[name="password2"]').type('password123');
    cy.get('select[name="role"]').select('patient');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to login after registration
    cy.url().should('include', '/login');
  });
  
  it('should logout a user', () => {
    // Log in first
    cy.login('test@example.com', 'password123');
    
    // Click logout
    cy.contains('Logout').click();
    
    // Should redirect to login page
    cy.url().should('include', '/login');
  });
});
