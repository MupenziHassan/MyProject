import React, { useState, useEffect } from 'react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for notifications
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/v1/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.data.filter(n => !n.read).length);
    } catch (error) {
      console.log('Using mock notifications');
      // Mock data for presentation
      const mockNotifications = [
        {
          _id: '1',
          title: 'New Assessment Result',
          message: 'Dr. Johnson has completed your health assessment.',
          type: 'assessment',
          referenceId: '123',
          read: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '2',
          title: 'Appointment Reminder',
          message: 'Your appointment with Dr. Smith is tomorrow at 10:00 AM.',
          type: 'appointment',
          referenceId: '456',
          read: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          _id: '3',
          title: 'System Update',
          message: 'Ubumuntu Cancer Prediction system has been updated with new features.',
          type: 'system',
          read: false,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/api/v1/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // For demo, still update UI
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };
  
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    // Navigate based on notification type
    switch(notification.type) {
      case 'assessment':
        navigate(`/patient/assessments/${notification.referenceId}`);
        break;
      case 'appointment':
        navigate(`/patient/appointments/${notification.referenceId}`);
        break;
      default:
        // Default action is to stay on the same page
        break;
    }
  };
  
  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
    
    return 'just now';
  };
  
  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="link" id="notification-dropdown" className="nav-link">
        <i className="fas fa-bell"></i>
        {unreadCount > 0 && (
          <Badge bg="danger" pill className="notification-badge">{unreadCount}</Badge>
        )}
      </Dropdown.Toggle>
      
      <Dropdown.Menu className="notification-dropdown-menu">
        <div className="notification-header">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <Badge bg="danger" pill>{unreadCount} new</Badge>
          )}
        </div>
        
        <div className="notification-body">
          {loading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" />
              <p className="mb-0 mt-2">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-3">
              <p className="mb-0">No notifications yet.</p>
            </div>
          ) : (
            notifications.map(notification => (
              <Dropdown.Item 
                key={notification._id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {notification.type === 'assessment' && (
                    <i className="fas fa-clipboard-check"></i>
                  )}
                  {notification.type === 'appointment' && (
                    <i className="fas fa-calendar-check"></i>
                  )}
                  {notification.type === 'system' && (
                    <i className="fas fa-info-circle"></i>
                  )}
                  {notification.type === 'message' && (
                    <i className="fas fa-envelope"></i>
                  )}
                </div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{formatTimeAgo(notification.createdAt)}</div>
                </div>
                {!notification.read && (
                  <div className="notification-indicator"></div>
                )}
              </Dropdown.Item>
            ))
          )}
        </div>
        
        <div className="notification-footer">
          <Dropdown.Item onClick={() => navigate('/notifications')} className="text-center">
            View All Notifications
          </Dropdown.Item>
        </div>
      </Dropdown.Menu>
      
      <style jsx="true">{`
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          font-size: 0.6rem;
        }
        .notification-dropdown-menu {
          width: 320px;
          padding: 0;
        }
        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #dee2e6;
        }
        .notification-body {
          max-height: 360px;
          overflow-y: auto;
        }
        .notification-item {
          display: flex;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f1f1;
        }
        .notification-item.unread {
          background-color: #f8f9fa;
        }
        .notification-icon {
          margin-right: 1rem;
          color: #6c757d;
          display: flex;
          align-items: center;
        }
        .notification-content {
          flex: 1;
        }
        .notification-title {
          font-weight: 600;
          font-size: 0.875rem;
        }
        .notification-message {
          font-size: 0.8125rem;
          color: #6c757d;
          margin: 0.25rem 0;
        }
        .notification-time {
          font-size: 0.75rem;
          color: #adb5bd;
        }
        .notification-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #dc3545;
        }
        .notification-footer {
          border-top: 1px solid #dee2e6;
        }
      `}</style>
    </Dropdown>
  );
};

export default Notifications;
