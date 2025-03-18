import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const SystemSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('general');
  
  // Settings state
  const [generalSettings, setGeneralSettings] = useState({
    systemName: 'Health Prediction System',
    contactEmail: 'support@healthsystem.com',
    maintenanceMode: false,
    allowRegistration: true
  });
  
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
    emailFrom: 'noreply@healthsystem.com',
    emailFromName: 'Health Prediction System'
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5
  });
  
  // Load settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Try to fetch from API
        const response = await adminService.getSystemSettings();
        
        // Update settings state with fetched data
        setGeneralSettings(response.data.general);
        setEmailSettings(response.data.email);
        setSecuritySettings(response.data.security);
      } catch (error) {
        console.log('Using mock settings data');
        // Keep default values (mock data)
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Handle form input changes
  const handleGeneralChange = (e) => {
    const { name, value, type, checked } = e.target;
    setGeneralSettings({
      ...generalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailSettings({
      ...emailSettings,
      [name]: value
    });
  };
  
  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSecuritySettings({
      ...securitySettings,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value
    });
  };
  
  // Save settings
  const saveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Combine all settings
      const allSettings = {
        general: generalSettings,
        email: emailSettings,
        security: securitySettings
      };
      
      // Save to API
      await adminService.updateSystemSettings(allSettings);
      
      // Show success message
      setSuccess('Settings saved successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };
  
  // Test email configuration
  const testEmailConfig = async () => {
    try {
      setSuccess(null);
      setError(null);
      
      // Call API to test email
      await adminService.testEmailConfig(emailSettings);
      
      setSuccess('Test email sent successfully! Check your inbox.');
    } catch (err) {
      setError('Email test failed: ' + (err.message || 'Unknown error'));
    }
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{minHeight: '400px'}}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Loading settings...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container fluid className="system-settings py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center">
            <Button 
              variant="outline-secondary" 
              className="me-3"
              onClick={() => navigate('/admin/dashboard')}
            >
              <i className="fas fa-arrow-left"></i>
            </Button>
            <div>
              <h2 className="mb-0">System Settings</h2>
              <p className="text-muted mb-0">Configure system parameters and options</p>
            </div>
          </div>
        </Col>
      </Row>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          <i className="fas fa-check-circle me-2"></i>
          {success}
        </Alert>
      )}
      
      <Card className="shadow">
        <Card.Body>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="general" title={<><i className="fas fa-cog me-2"></i>General</>}>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>System Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="systemName"
                        value={generalSettings.systemName}
                        onChange={handleGeneralChange}
                      />
                      <Form.Text className="text-muted">
                        The name displayed throughout the application
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Contact Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="contactEmail"
                        value={generalSettings.contactEmail}
                        onChange={handleGeneralChange}
                      />
                      <Form.Text className="text-muted">
                        Primary contact email for system notifications
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Check 
                        type="switch"
                        id="maintenance-mode"
                        label="Maintenance Mode"
                        name="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onChange={handleGeneralChange}
                      />
                      <Form.Text className="text-muted">
                        When enabled, only administrators can access the system
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="allow-registration"
                        label="Allow User Registration"
                        name="allowRegistration"
                        checked={generalSettings.allowRegistration}
                        onChange={handleGeneralChange}
                      />
                      <Form.Text className="text-muted">
                        When enabled, new users can register accounts
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>
            
            <Tab eventKey="email" title={<><i className="fas fa-envelope me-2"></i>Email</>}>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Host</Form.Label>
                      <Form.Control
                        type="text"
                        name="smtpHost"
                        value={emailSettings.smtpHost}
                        onChange={handleEmailChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Port</Form.Label>
                      <Form.Control
                        type="text"
                        name="smtpPort"
                        value={emailSettings.smtpPort}
                        onChange={handleEmailChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>"From" Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="emailFrom"
                        value={emailSettings.emailFrom}
                        onChange={handleEmailChange}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="smtpUser"
                        value={emailSettings.smtpUser}
                        onChange={handleEmailChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>SMTP Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="smtpPassword"
                        value={emailSettings.smtpPassword}
                        onChange={handleEmailChange}
                        placeholder="••••••••"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>"From" Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="emailFromName"
                        value={emailSettings.emailFromName}
                        onChange={handleEmailChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button variant="info" onClick={testEmailConfig} className="mt-2">
                  <i className="fas fa-paper-plane me-2"></i>
                  Test Email Configuration
                </Button>
              </Form>
            </Tab>
            
            <Tab eventKey="security" title={<><i className="fas fa-shield-alt me-2"></i>Security</>}>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Password Length</Form.Label>
                      <Form.Control
                        type="number"
                        name="passwordMinLength"
                        value={securitySettings.passwordMinLength}
                        onChange={handleSecurityChange}
                        min="6"
                        max="20"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Session Timeout (minutes)</Form.Label>
                      <Form.Control
                        type="number"
                        name="sessionTimeout"
                        value={securitySettings.sessionTimeout}
                        onChange={handleSecurityChange}
                        min="5"
                      />
                      <Form.Text className="text-muted">
                        Time of inactivity before user is logged out
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="require-numbers"
                        label="Require Numbers in Password"
                        name="passwordRequireNumbers"
                        checked={securitySettings.passwordRequireNumbers}
                        onChange={handleSecurityChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="switch"
                        id="require-symbols"
                        label="Require Symbols in Password"
                        name="passwordRequireSymbols"
                        checked={securitySettings.passwordRequireSymbols}
                        onChange={handleSecurityChange}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Max Login Attempts</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxLoginAttempts"
                        value={securitySettings.maxLoginAttempts}
                        onChange={handleSecurityChange}
                        min="3"
                        max="10"
                      />
                      <Form.Text className="text-muted">
                        Number of failed attempts before account lockout
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Tab>
          </Tabs>
          
          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" className="me-2" onClick={() => navigate('/admin/dashboard')}>
              Cancel
            </Button>
            <Button 
              variant="success" 
              onClick={saveSettings}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SystemSettings;
