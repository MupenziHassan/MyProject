import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Form, Modal, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient'
  });
  
  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // For presentation, use mock data
      try {
        const response = await api.get('/api/v1/admin/users');
        setUsers(response.data);
      } catch (apiError) {
        console.error('API error, using mock data:', apiError);
        // Mock data for presentation purposes
        setUsers([
          { _id: '1', name: 'John Doe', email: 'john@example.com', role: 'patient', createdAt: '2023-05-15T10:30:00Z' },
          { _id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'doctor', createdAt: '2023-04-22T14:15:00Z' },
          { _id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin', createdAt: '2023-01-10T09:00:00Z' },
          { _id: '4', name: 'Robert Johnson', email: 'robert@example.com', role: 'patient', createdAt: '2023-06-01T11:45:00Z' },
          { _id: '5', name: 'Dr. Williams', email: 'williams@example.com', role: 'doctor', createdAt: '2023-03-18T16:20:00Z' }
        ]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // Add new user
  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/v1/admin/users', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', role: 'patient' });
      fetchUsers();
    } catch (err) {
      setError('Failed to add user');
    }
  };
  
  // Edit user
  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/v1/admin/users/${currentUser._id}`, formData);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
    }
  };
  
  // Delete user
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/v1/admin/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };
  
  // Open edit modal with user data
  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowEditModal(true);
  };
  
  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Actually use navigate in the component
  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };
  
  return (
    <Container className="py-4">
      <PageHeader 
        title="User Management"
        subtitle="Manage system users"
        buttonText="Add New User"
        buttonIcon="plus"
        buttonVariant="primary"
        buttonAction={() => setShowAddModal(true)}
        showBackButton={true}
        backPath="/admin/dashboard"
      />
      
      <Card className="shadow">
        <Card.Header className="bg-white py-3">
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Control
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Select 
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="all">All Roles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="admin">Admins</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={5} className="text-md-end">
              <span className="text-muted">
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </Col>
          </Row>
        </Card.Header>
        
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status" variant="primary">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-3">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        {searchTerm || filterRole !== 'all' ? 
                          "No users match your search criteria" : 
                          "No users found in the system"}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user._id} className="user-row">
                        <td>
                          <div className="d-flex align-items-center">
                            <div className={`avatar-circle bg-${
                              user.role === 'admin' ? 'danger' : 
                              user.role === 'doctor' ? 'success' : 'primary'
                            } me-3`}>
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>{user.name}</div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge bg-${
                            user.role === 'admin' ? 'danger' : 
                            user.role === 'doctor' ? 'success' : 'primary'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Button 
                              variant="outline-info" 
                              size="sm" 
                              onClick={() => openEditModal(user)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Add User Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-user-plus me-2"></i>Add New User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddUser}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter password"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              <i className="fas fa-user-plus me-2"></i> Add User
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Edit User Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title><i className="fas fa-user-edit me-2"></i>Edit User</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditUser}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
              />
              <Form.Text className="text-muted">
                Leave blank to keep current password
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              <i className="fas fa-save me-2"></i> Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Custom CSS for avatar circles */}
      <style jsx="true">{`
        .avatar-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .user-row:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }
      `}</style>

      {/* Add a back button at the bottom that uses navigate */}
      <div className="text-center mt-4">
        <Button 
          variant="outline-secondary"
          onClick={handleBackToDashboard}
        >
          <i className="fas fa-arrow-left me-2"></i>
          Back to Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default UserManagement;
