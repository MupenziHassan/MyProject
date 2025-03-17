import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const DoctorVerifications = () => {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('pending'); // 'pending', 'verified', 'all'
  const [viewingDoctor, setViewingDoctor] = useState(null);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/admin/verifications?status=${filter}`);
      setVerifications(res.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load doctor verifications');
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleApprove = async (doctorId) => {
    try {
      await axios.post(`/api/v1/admin/verifications/${doctorId}/approve`);
      fetchVerifications(); // Refresh list
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to approve doctor verification');
    }
  };

  const handleReject = async (doctorId) => {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason) {
      try {
        await axios.post(`/api/v1/admin/verifications/${doctorId}/reject`, { reason });
        fetchVerifications(); // Refresh list
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to reject doctor verification');
      }
    }
  };

  const handleViewDetails = (doctor) => {
    setViewingDoctor(doctor);
  };

  const closeDetails = () => {
    setViewingDoctor(null);
  };

  if (loading) return <div className="loading-container"><div className="loading-spinner"></div><p>Loading...</p></div>;

  return (
    <div className="doctor-verifications">
      <h2>Doctor Verifications</h2>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="filter-toolbar">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} 
            onClick={() => setFilter('pending')}
          >
            Pending Verifications
          </button>
          <button 
            className={`filter-btn ${filter === 'verified' ? 'active' : ''}`} 
            onClick={() => setFilter('verified')}
          >
            Verified Doctors
          </button>
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            All Doctors
          </button>
        </div>
        
        <div className="verification-count">
          <span className="badge">{verifications.length}</span> doctors found
        </div>
      </div>
      
      {verifications.length === 0 ? (
        <div className="no-results">
          <div className="empty-state">
            <i className="fas fa-user-md fa-3x"></i>
            <p>No doctor verifications found with the selected filter.</p>
          </div>
        </div>
      ) : (
        <div className="verifications-container">
          {verifications.map((doctor) => (
            <div key={doctor._id} className="doctor-verification-card">
              <div className="doctor-info">
                <div className="doctor-avatar">
                  {doctor.user?.name.charAt(0).toUpperCase() || 'D'}
                </div>
                <div className="doctor-details">
                  <h3>{doctor.user?.name || 'Unknown Doctor'}</h3>
                  <p className="doctor-specialty">{doctor.specialization}</p>
                  <p className="doctor-license">License: {doctor.licenseNumber}</p>
                </div>
                <div className="verification-status">
                  {doctor.isVerified ? (
                    <span className="status verified">
                      <i className="fas fa-check-circle"></i> Verified
                    </span>
                  ) : (
                    <span className="status pending">
                      <i className="fas fa-clock"></i> Pending
                    </span>
                  )}
                </div>
              </div>
              
              <div className="verification-actions">
                <button 
                  className="btn btn-info" 
                  onClick={() => handleViewDetails(doctor)}
                >
                  <i className="fas fa-eye"></i> View Details
                </button>
                
                {!doctor.isVerified && (
                  <>
                    <button 
                      className="btn btn-success" 
                      onClick={() => handleApprove(doctor._id)}
                    >
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleReject(doctor._id)}
                    >
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Doctor Details Modal */}
      {viewingDoctor && (
        <div className="modal show">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">Doctor Details</h3>
                <button className="close-btn" onClick={closeDetails}>×</button>
              </div>
              <div className="modal-body">
                <div className="doctor-profile-card">
                  <div className="profile-section personal-info">
                    <h4>Personal Information</h4>
                    <div className="info-row">
                      <span className="label">Name:</span>
                      <span className="value">{viewingDoctor.user?.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Email:</span>
                      <span className="value">{viewingDoctor.user?.email}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Contact:</span>
                      <span className="value">{viewingDoctor.contactNumber || 'Not provided'}</span>
                    </div>
                  </div>
                  
                  <div className="profile-section professional-info">
                    <h4>Professional Information</h4>
                    <div className="info-row">
                      <span className="label">Specialization:</span>
                      <span className="value">{viewingDoctor.specialization}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">License Number:</span>
                      <span className="value">{viewingDoctor.licenseNumber}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">Experience:</span>
                      <span className="value">{viewingDoctor.experience} years</span>
                    </div>
                  </div>
                  
                  <div className="profile-section qualifications">
                    <h4>Qualifications</h4>
                    {viewingDoctor.qualifications && viewingDoctor.qualifications.length > 0 ? (
                      <ul className="qualifications-list">
                        {viewingDoctor.qualifications.map((qual, index) => (
                          <li key={index} className="qualification-item">
                            <span className="degree">{qual.degree}</span> from 
                            <span className="institution"> {qual.institution}</span>
                            <span className="year"> ({qual.year})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>No qualifications provided</p>
                    )}
                  </div>
                  
                  <div className="profile-section documents">
                    <h4>Verification Documents</h4>
                    {viewingDoctor.verificationDocuments && viewingDoctor.verificationDocuments.length > 0 ? (
                      <div className="documents-grid">
                        {viewingDoctor.verificationDocuments.map((doc, index) => (
                          <div key={index} className="document-card">
                            <div className="document-icon">
                              <i className="fas fa-file-alt"></i>
                            </div>
                            <div className="document-info">
                              <p className="document-type">{doc.documentType}</p>
                              <p className="document-date">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-primary">
                              <i className="fas fa-eye"></i> View
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p>No verification documents uploaded</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                {!viewingDoctor.isVerified && (
                  <>
                    <button className="btn btn-success" onClick={() => { handleApprove(viewingDoctor._id); closeDetails(); }}>
                      <i className="fas fa-check"></i> Approve
                    </button>
                    <button className="btn btn-danger" onClick={() => { handleReject(viewingDoctor._id); closeDetails(); }}>
                      <i className="fas fa-times"></i> Reject
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={closeDetails}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorVerifications;
