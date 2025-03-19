import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const response = await api.get('/api/v1/notifications?limit=50');
        setNotifications(response.data.data);
      } catch (error) {
        console.log('Using mock notification data');
        // Mock data for presentation
        const mockNotifications = [];
        
        // Generate some mock notifications
        for(let i = 0; i < 15; i++) {
          const types = ['assessment', 'appointment', 'system', 'message'];
          const type = types[Math.floor(Math.random() * types.length)];
          
          let title, message;
          switch(type) {
            case 'assessment':
              title = 'New Assessment Result';
              message = 'Your health assessment has been completed.';
              break;
            case 'appointment':
              title = 'Appointment Reminder';
              message = 'You have an upcoming appointment.';
              break;
            case 'message':
              title = 'New Message';
              message = 'You have received a new message.';
              break;
            default:
              title = 'System Update';
              message = 'System has been updated with new features.';
          }
          
          mockNotifications.push({
            _id: `${i}`,
            title,
            message,
            type,
            referenceId: '123456',
            read: Math.random() > 0.3, // 30% chance of being unread
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
        
        // Sort by date (newest first)
        mockNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllNotifications();
  }, []);
  
  const markAllAsRead = async () => {
    try {
      await api.put('/api/v1/notifications/read-all');
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // For demo, still update UI
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    }
  };
  
  const handleNotificationAction = async (notification) => {
    if (!notification.read) {
      try {
        await api.put(`/api/v1/notifications/${notification._id}/read`);
        
        // Update local state
        setNotifications(prev => 
          prev.map(n => 
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    // Navigate based on notification type
    switch(notification.type) {
      case 'assessment':
        navigate(`/patient/assessments/${notification.referenceId}`);
        break;
      case 'appointment':
        navigate(`/patient/appointments/${notification.referenceId}`);
        break;
      case 'message':
        navigate('/patient/messages');
        break;
      default:
        // No navigation needed
        break;
    }
  };
  
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'assessment':
        return 'clipboard-check';
      case 'appointment':
        return 'calendar-check';
      case 'message':
        return 'envelope';
      default:
        return 'info-circle';
    }
  };

  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return (
    <Container className="py-4">
      <PageHeader 
        title="Notifications"
        subtitle="View all your system notifications"
      />
      
      <Card className="shadow-sm">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Notifications</h5>
          {notifications.some(n => !n.read) && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-bell-slash text-muted fa-3x mb-3"></i>
              <h5>No Notifications</h5>
              <p>You don't have any notifications yet.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}></th>
                    <th>Notification</th>
                    <th style={{ width: '180px' }}>Date</th>
                    <th style={{ width: '100px' }}>Status</th>
                    <th style={{ width: '100px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr key={notification._id} className={notification.read ? '' : 'table-light'}>
                      <td className="text-center">
                        <i className={`fas fa-${getNotificationIcon(notification.type)} text-primary`}></i>
                      </td>
                      <td>
                        <div className="fw-bold">{notification.title}</div>
                        <div className="text-muted small">{notification.message}</div>
                      </td>
                      <td>{formatDateTime(notification.createdAt)}</td>
                      <td>
                        {notification.read ? (
                          <Badge bg="secondary">Read</Badge>
                        ) : (
                          <Badge bg="primary">New</Badge>
                        )}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleNotificationAction(notification)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default NotificationsPage;
