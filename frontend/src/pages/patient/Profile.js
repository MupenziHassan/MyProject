import React, { useState, useContext, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import api from '../../services/api';

const Profile = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Initialize state with values from auth context to prevent errors
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: auth?.user?.name || '',
    email: auth?.user?.email || '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Load user data
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/v1/patients/profile');
        const userData = response.data;
        
        setFormData(prevData => ({
          ...prevData,
          name: userData.name || auth?.user?.name || '',
          email: userData.email || auth?.user?.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          dateOfBirth: userData.dateOfBirth || '',
          gender: userData.gender || '',
          emergencyContact: userData.emergencyContact || ''
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Use current auth data as fallback
        setFormData(prevData => ({
          ...prevData,
          name: auth?.user?.name || '',
          email: auth?.user?.email || ''
        }));
      }
    };

    fetchUserProfile();
  }, [auth]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Handle password change if provided
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New passwords do not match');
          setLoading(false);
          return;
        }
        
        if (!formData.currentPassword) {
          setError('Current password is required to set a new password');
          setLoading(false);
          return;
        }
      }

      // Prepare data for submission (exclude password fields if not changing password)
      const dataToSubmit = { ...formData };
      if (!dataToSubmit.newPassword) {
        delete dataToSubmit.currentPassword;
        delete dataToSubmit.newPassword;
        delete dataToSubmit.confirmPassword;
      }

      // Submit profile update
      await api.put('/api/v1/patients/profile', dataToSubmit);
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Logout handler function
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2>My Profile</h2>
          <p className="text-muted">Manage your personal information</p>
        </Col>
        <Col xs="auto">
          <Button 
            variant="outline-danger"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </Button>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="text-center">
            <Card.Body>
              <div className="avatar-circle mx-auto mb-3 bg-primary text-white">
                {formData.name.charAt(0).toUpperCase() || 'P'}
              </div>
              <h4>{formData.name}</h4>
              <p className="text-muted">{formData.email}</p>
              <Button 
                variant={isEditing ? "outline-secondary" : "primary"}
                onClick={() => setIsEditing(!isEditing)}
                className="w-100"
              >
                {isEditing ? (
                  <>
                    <i className="fas fa-times me-2"></i>
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-edit me-2"></i>
                    Edit Profile
                  </>
                )}
              </Button>
            </Card.Body>
          </Card>

          <Card className="mt-4">
            <Card.Header>
              <h5 className="mb-0">Quick Links</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="list-group list-group-flush">
                <Button 
                  variant="link" 
                  className="list-group-item list-group-item-action text-start"
                  onClick={() => navigate('/patient/dashboard')}
                >
                  <i className="fas fa-home me-2"></i> Dashboard
                </Button>
                <Button 
                  variant="link" 
                  className="list-group-item list-group-item-action text-start"
                  onClick={() => navigate('/patient/health-assessment')}
                >
                  <i className="fas fa-clipboard-check me-2"></i> Health Assessment
                </Button>
                <Button 
                  variant="link" 
                  className="list-group-item list-group-item-action text-start"
                  onClick={() => navigate('/patient/appointments')}
                >
                  <i className="fas fa-calendar-alt me-2"></i> Appointments
                </Button>
                <Button 
                  variant="link" 
                  className="list-group-item list-group-item-action text-start"
                  onClick={() => navigate('/patient/medical-records')}
                >
                  <i className="fas fa-file-medical me-2"></i> Medical Records
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">{isEditing ? 'Edit Profile Information' : 'Profile Information'}</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!isEditing}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={true} // Email can't be changed
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date of Birth</Form.Label>
                      <Form.Control
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        disabled={!isEditing}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Emergency Contact</Form.Label>
                      <Form.Control
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={!isEditing}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {isEditing && (
                  <>
                    <hr />
                    <h5 className="mb-3">Change Password</h5>
                    <p className="text-muted small">Leave blank if you don't want to change your password</p>
                    
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-grid mt-4">
                      <Button 
                        type="submit" 
                        variant="success" 
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save me-2"></i>
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx="true">{`
        .avatar-circle {
          width: 100px;
          height: 100px;
          font-size: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </Container>
  );
};

export default Profile;
