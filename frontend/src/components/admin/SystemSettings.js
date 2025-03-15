import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Health Prediction System',
      contactEmail: 'support@healthprediction.com',
      enableRegistration: true
    },
    security: {
      passwordMinLength: 6,
      accountLockAttempts: 5,
      sessionTimeout: 30, // minutes
      requireEmailVerification: true
    },
    notifications: {
      enableEmailNotifications: true,
      enableSmsNotifications: true,
      enablePushNotifications: false
    },
    prediction: {
      defaultModelVersion: 'v1.0',
      confidenceThreshold: 0.75,
      showRiskFactors: true
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get('/api/v1/admin/settings');
        setSettings(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load system settings');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      await axios.put('/api/v1/admin/settings', settings);
      setSuccess('System settings updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update system settings');
    }
  };

  const handleToggleChange = (section, field) => {
    handleInputChange(section, field, !settings[section][field]);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;

  return (
    <div className="system-settings">
      <h2>System Settings</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      
      <div className="settings-container">
        <div className="settings-sidebar">
          <ul className="settings-nav">
            <li className={activeSection === 'general' ? 'active' : ''}>
              <button onClick={() => setActiveSection('general')}>
                <i className="fas fa-cog"></i> General
              </button>
            </li>
            <li className={activeSection === 'security' ? 'active' : ''}>
              <button onClick={() => setActiveSection('security')}>
                <i className="fas fa-shield-alt"></i> Security
              </button>
            </li>
            <li className={activeSection === 'notifications' ? 'active' : ''}>
              <button onClick={() => setActiveSection('notifications')}>
                <i className="fas fa-bell"></i> Notifications
              </button>
            </li>
            <li className={activeSection === 'prediction' ? 'active' : ''}>
              <button onClick={() => setActiveSection('prediction')}>
                <i className="fas fa-chart-line"></i> Prediction
              </button>
            </li>
          </ul>
        </div>
        
        <form onSubmit={handleSubmit} className="settings-form">
          {/* General Settings */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h3>General Settings</h3>
              <div className="form-group">
                <label htmlFor="siteName">Site Name</label>
                <input
                  type="text"
                  id="siteName"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactEmail">Support Email</label>
                <input
                  type="email"
                  id="contactEmail"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group toggle-group">
                <span className="toggle-label">Enable Registration</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.general.enableRegistration}
                    onChange={() => handleToggleChange('general', 'enableRegistration')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
          
          {/* Security Settings */}
          {activeSection === 'security' && (
            <div className="settings-section">
              <h3>Security Settings</h3>
              <div className="form-group">
                <label htmlFor="passwordMinLength">Minimum Password Length</label>
                <input
                  type="number"
                  id="passwordMinLength"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="form-control"
                  min="6"
                  max="20"
                />
              </div>
              <div className="form-group">
                <label htmlFor="accountLockAttempts">Failed Login Attempts Before Account Lock</label>
                <input
                  type="number"
                  id="accountLockAttempts"
                  value={settings.security.accountLockAttempts}
                  onChange={(e) => handleInputChange('security', 'accountLockAttempts', parseInt(e.target.value))}
                  className="form-control"
                  min="3"
                  max="10"
                />
              </div>
              <div className="form-group">
                <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
                <input
                  type="number"
                  id="sessionTimeout"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="form-control"
                  min="15"
                />
              </div>
              <div className="form-group toggle-group">
                <span className="toggle-label">Require Email Verification</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.security.requireEmailVerification}
                    onChange={() => handleToggleChange('security', 'requireEmailVerification')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
          
          {/* Notification Settings */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3>Notification Settings</h3>
              <div className="form-group toggle-group">
                <span className="toggle-label">Enable Email Notifications</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enableEmailNotifications}
                    onChange={() => handleToggleChange('notifications', 'enableEmailNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group toggle-group">
                <span className="toggle-label">Enable SMS Notifications</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enableSmsNotifications}
                    onChange={() => handleToggleChange('notifications', 'enableSmsNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              <div className="form-group toggle-group">
                <span className="toggle-label">Enable Push Notifications</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.enablePushNotifications}
                    onChange={() => handleToggleChange('notifications', 'enablePushNotifications')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
          
          {/* Prediction Settings */}
          {activeSection === 'prediction' && (
            <div className="settings-section">
              <h3>Prediction Settings</h3>
              <div className="form-group">
                <label htmlFor="defaultModelVersion">Default Model Version</label>
                <select
                  id="defaultModelVersion"
                  value={settings.prediction.defaultModelVersion}
                  onChange={(e) => handleInputChange('prediction', 'defaultModelVersion', e.target.value)}
                  className="form-control"
                >
                  <option value="v1.0">Version 1.0 (Stable)</option>
                  <option value="v1.1">Version 1.1 (Beta)</option>
                  <option value="v2.0">Version 2.0 (Experimental)</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="confidenceThreshold">Confidence Threshold</label>
                <input
                  type="number"
                  id="confidenceThreshold"
                  value={settings.prediction.confidenceThreshold}
                  onChange={(e) => handleInputChange('prediction', 'confidenceThreshold', parseFloat(e.target.value))}
                  className="form-control"
                  min="0"
                  max="1"
                  step="0.05"
                />
                <small className="form-text text-muted">
                  Predictions with confidence below this threshold will be marked as inconclusive
                </small>
              </div>
              <div className="form-group toggle-group">
                <span className="toggle-label">Show Risk Factors</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.prediction.showRiskFactors}
                    onChange={() => handleToggleChange('prediction', 'showRiskFactors')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>
          )}
          
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save"></i> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SystemSettings;
