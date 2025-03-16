describe('Patient Dashboard', () => {
  beforeEach(() => {
    // Login as patient
    cy.login('patient@example.com', 'password123');
    cy.visit('/patient/dashboard');
  });
  
  it('should display patient information', () => {
    cy.contains('Patient Dashboard');
    cy.contains('Welcome back, Test Patient');
  });
  
  it('should display risk assessments section', () => {
    cy.contains('Latest Risk Assessment').should('be.visible');
  });
  
  it('should navigate to appointments page', () => {
    cy.contains('Appointments').click();
    cy.url().should('include', '/patient/appointments');
    cy.contains('My Appointments');
  });
  
  it('should display medical timeline', () => {
    cy.contains('Medical Timeline').should('be.visible');
    cy.get('.timeline-event').should('exist');
  });
});
