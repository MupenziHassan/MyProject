import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      console.log('Attempting login with:', email);
      await login(email, password);
      
      // Determine redirect based on user role
      const userRole = localStorage.getItem('userRole') || 'patient';
      navigate(`/${userRole}/dashboard`);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(error.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} xl={5}>
          <div className="text-center mb-4">
            <h2 className="text-primary fw-bold">Ubumuntu Cancer Risk Prediction System</h2>
            <p className="text-muted">Sign in to access your account</p>
          </div>
          
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {loginError && (
                <Alert variant="danger">{loginError}</Alert>
              )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control 
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control 
                    type="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </Form.Group>
                
                <div className="d-grid mb-3">
                  <Button 
                    type="submit" 
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span> Logging in...</>
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </div>
              </Form>
              
              <div className="text-center mt-3">
                <p>Don't have an account? <Link to="/register">Register</Link></p>
              </div>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <p className="text-muted small">
              &copy; 2025 Ubumuntu Clinic Cancer Prediction System<br />
              University of Kigali
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
