import React from 'react';
import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

const MainLayout = ({ navItems, navColor, brandText, rolePrefix }) => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="main-layout">
      <Navbar bg={navColor} variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to={`/${rolePrefix}/dashboard`}>
            <i className="fas fa-heartbeat me-2"></i>
            {brandText}
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="main-navbar" />
          <Navbar.Collapse id="main-navbar">
            <Nav className="me-auto">
              {navItems.map((item, index) => (
                <Nav.Link 
                  key={index} 
                  as={Link} 
                  to={`/${rolePrefix}/${item.path}`}
                >
                  {item.icon && <i className={`fas fa-${item.icon} me-1`}></i>} {item.label}
                </Nav.Link>
              ))}
            </Nav>
            <Nav>
              <span className="navbar-text text-light me-3">
                {rolePrefix === 'doctor' ? 'Dr. ' : ''}{auth?.user?.name || 'User'}
              </span>
              <NavDropdown title={<i className="fas fa-user-circle"></i>} align="end">
                <NavDropdown.Item as={Link} to={`/${rolePrefix}/profile`}>
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
      
      <style jsx="true">{`
        .dashboard-stat-card {
          border: none;
          border-radius: 0.5rem;
          transition: transform 0.2s ease;
        }
        .dashboard-stat-card:hover {
          transform: translateY(-5px);
        }
        .stat-icon {
          opacity: 0.8;
        }
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default MainLayout;
