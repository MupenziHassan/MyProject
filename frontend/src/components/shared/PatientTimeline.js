import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PatientTimeline = ({ events = [] }) => {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({});
  
  // Group events by year and month
  const groupByDate = (events) => {
    const grouped = {};
    
    if (!Array.isArray(events)) {
      console.warn('Events provided to PatientTimeline is not an array');
      return {};
    }
    
    events.forEach(event => {
      if (!event || !event.date) {
        console.warn('Invalid event or missing date in event:', event);
        return;
      }
      
      const date = new Date(event.date);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date in event:', event);
        return;
      }
      
      const year = date.getFullYear();
      const month = date.getMonth();
      
      if (!grouped[year]) {
        grouped[year] = {};
      }
      
      if (!grouped[year][month]) {
        grouped[year][month] = [];
      }
      
      grouped[year][month].push(event);
    });
    
    // Sort events within each month by date (newest first)
    Object.keys(grouped).forEach(year => {
      Object.keys(grouped[year]).forEach(month => {
        grouped[year][month].sort((a, b) => new Date(b.date) - new Date(a.date));
      });
    });
    
    return grouped;
  };
  
  // Filter events based on selected type
  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event && event.type === filter);
  
  const groupedEvents = groupByDate(filteredEvents);
  const years = Object.keys(groupedEvents).sort((a, b) => b - a); // Sort years in descending order
  
  const toggleExpand = (eventId) => {
    if (!eventId) return; // Guard against events without IDs
    
    setExpanded({
      ...expanded,
      [eventId]: !expanded[eventId]
    });
  };
  
  // Get icon for event type
  const getEventIcon = (type) => {
    if (!type) return <i className="fas fa-file-medical"></i>;
    
    switch (type.toLowerCase()) {
      case 'test':
        return <i className="fas fa-vial"></i>;
      case 'prediction':
        return <i className="fas fa-chart-line"></i>;
      case 'appointment':
        return <i className="fas fa-calendar-check"></i>;
      case 'medication':
        return <i className="fas fa-pills"></i>;
      case 'diagnosis':
        return <i className="fas fa-stethoscope"></i>;
      case 'treatment':
        return <i className="fas fa-procedures"></i>;
      case 'screening':
        return <i className="fas fa-search"></i>;
      default:
        return <i className="fas fa-file-medical"></i>;
    }
  };
  
  // Get color for event type
  const getEventColor = (type) => {
    if (!type) return '#607d8b'; // Default color
    
    switch (type.toLowerCase()) {
      case 'test':
        return '#2196f3'; // Blue
      case 'prediction':
        return '#9c27b0'; // Purple
      case 'appointment':
        return '#4caf50'; // Green
      case 'medication':
        return '#ff9800'; // Orange
      case 'diagnosis':
        return '#f44336'; // Red
      case 'treatment':
        return '#795548'; // Brown
      case 'screening':
        return '#009688'; // Teal
      default:
        return '#607d8b'; // Blue grey
    }
  };
  
  // Format date in a readable way
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Get month name
  const getMonthName = (month) => {
    try {
      return new Date(0, parseInt(month)).toLocaleString('default', { month: 'long' });
    } catch (error) {
      console.error('Error getting month name:', error);
      return 'Unknown Month';
    }
  };

  if (!Array.isArray(events) || events.length === 0) {
    return (
      <div className="patient-timeline">
        <div className="timeline-header">
          <h3>Medical History Timeline</h3>
        </div>
        <div className="no-events">
          <i className="fas fa-calendar-times"></i>
          <p>No medical events found in your history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-timeline">
      <div className="timeline-header">
        <h3>Medical History Timeline</h3>
        
        <div className="timeline-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${filter === 'test' ? 'active' : ''}`} 
            onClick={() => setFilter('test')}
          >
            Tests
          </button>
          <button 
            className={`filter-btn ${filter === 'prediction' ? 'active' : ''}`} 
            onClick={() => setFilter('prediction')}
          >
            Predictions
          </button>
          <button 
            className={`filter-btn ${filter === 'appointment' ? 'active' : ''}`} 
            onClick={() => setFilter('appointment')}
          >
            Appointments
          </button>
          <button 
            className={`filter-btn ${filter === 'treatment' ? 'active' : ''}`} 
            onClick={() => setFilter('treatment')}
          >
            Treatments
          </button>
        </div>
      </div>
      
      {filteredEvents.length === 0 ? (
        <div className="no-events">
          <i className="fas fa-calendar-times"></i>
          <p>No medical events found with the selected filter.</p>
        </div>
      ) : (
        <div className="timeline-container">
          {years.map(year => (
            <div key={year} className="timeline-year">
              <div className="year-header">
                <h4>{year}</h4>
                <div className="year-line"></div>
              </div>
              
              {Object.keys(groupedEvents[year]).sort((a, b) => b - a).map(month => (
                <div key={`${year}-${month}`} className="timeline-month">
                  <h5 className="month-name">{getMonthName(month)}</h5>
                  
                  <div className="month-events">
                    {groupedEvents[year][month].map((event, index) => (
                      <div key={event.id || `event-${year}-${month}-${index}`} className="timeline-event">
                        <div className="event-marker" style={{ backgroundColor: getEventColor(event.type) }}>
                          {getEventIcon(event.type)}
                        </div>
                        
                        <div className="event-content">
                          <div className="event-header">
                            <span className="event-date">{formatDate(event.date)}</span>
                            <span 
                              className="event-type" 
                              style={{ backgroundColor: getEventColor(event.type) }}
                            >
                              {(event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Event')}
                            </span>
                          </div>
                          
                          <h4 className="event-title">{event.title || 'Untitled Event'}</h4>
                          
                          <div className={`event-details ${(event.id && expanded[event.id]) ? 'expanded' : ''}`}>
                            {event.description && (
                              <p className="event-description">{event.description}</p>
                            )}
                            
                            {event.provider && (
                              <p className="event-provider">
                                <strong>Provider:</strong> {event.provider}
                              </p>
                            )}
                            
                            {event.location && (
                              <p className="event-location">
                                <strong>Location:</strong> {event.location}
                              </p>
                            )}
                            
                            {event.status && (
                              <p className="event-status">
                                <strong>Status:</strong> 
                                <span className={`status-badge status-${event.status.toLowerCase()}`}>
                                  {event.status}
                                </span>
                              </p>
                            )}
                            
                            {event.results && (
                              <div className="event-results">
                                <strong>Results:</strong>
                                <p>{event.results}</p>
                              </div>
                            )}
                            
                            {event.recommendations && (
                              <div className="event-recommendations">
                                <strong>Recommendations:</strong>
                                <p>{event.recommendations}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="event-actions">
                            {event.id && (
                              <button 
                                className="btn-text" 
                                onClick={() => toggleExpand(event.id)}
                              >
                                {expanded[event.id] ? 'Show Less' : 'Show More'}
                              </button>
                            )}
                            
                            {event.link && (
                              <Link to={event.link} className="btn-text view-details">
                                View Details
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientTimeline;
