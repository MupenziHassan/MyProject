import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import AdminStats from '../../components/admin/AdminStats';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  return (
    <Container fluid className="admin-dashboard py-4">
      <Row className="mb-4">
        <Col>
          <h2>Admin Dashboard</h2>
          <p>Manage your healthcare system from here</p>
        </Col>
      </Row>
      
      <Row className="mb-4">
        <Col md={3}>
          <Card className="admin-sidebar">
            <Card.Header>Administration</Card.Header>
            <Card.Body className="p-0">
              <div className="list-group">
                <Button 
                  variant="primary" 
                  className="list-group-item text-start"
                  onClick={() => navigate('/admin/dashboard')}
                >
                  <i className="fas fa-tachometer-alt me-2"></i> Dashboard Overview
                </Button>
                <Button 
                  variant="light" 
                  className="list-group-item text-start"
                  onClick={() => navigate('/admin/users')}
                >
                  <i className="fas fa-users me-2"></i> User Management
                </Button>
                <Button 
                  variant="light" 
                  className="list-group-item text-start"
                  onClick={() => navigate('/admin/settings')}
                >
                  <i className="fas fa-cog me-2"></i> System Settings
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <AdminStats />
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
