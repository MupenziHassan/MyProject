import React, { useContext } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { AuthContext } from '../contexts/AuthContext';
import Notifications from '../components/common/Notifications';

const PatientLayout = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="patient-layout">
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/patient/dashboard">
            <i className="fas fa-heartbeat me-2"></i>
            Ubumuntu Cancer Prediction
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="patient-navbar" />
          <Navbar.Collapse id="patient-navbar">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/patient/dashboard">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/patient/health-assessment">Cancer Risk Assessment</Nav.Link> {/* Updated text */}
              <Nav.Link as={Link} to="/patient/assessments">Assessment History</Nav.Link>
              <Nav.Link as={Link} to="/patient/appointments">Appointments</Nav.Link>
              <Nav.Link as={Link} to="/patient/medical-records">Medical Records</Nav.Link>
            </Nav>
            <Nav>
              <Notifications />
              <span className="navbar-text text-light me-3">
                Welcome, {auth?.user?.name || 'Patient'}
              </span>
              <NavDropdown title={<i className="fas fa-user-circle"></i>} align="end">
                <NavDropdown.Item as={Link} to="/patient/profile">
                  <i className="fas fa-user me-2"></i> My Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <Outlet />
      </Container>

      <footer className="mt-5 py-3 bg-light text-center">
        <Container>
          <p className="mb-0 text-muted">© 2023 Ubumuntu Cancer Prediction System - University of Kigali</p>
        </Container>
      </footer>
    </div>
  );
};

export default PatientLayout;
