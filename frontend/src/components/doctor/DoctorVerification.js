import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DoctorVerification = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [documentData, setDocumentData] = useState({
    documentType: '',
    documentUrl: ''
  });

  // Fetch doctor profile to check verification status
  useEffect(() => {
    const fetchDocumentStatus = async () => {
      try {
        const res = await axios.get('/api/v1/doctors/me');
        setProfile(res.data.data);
        
        if (res.data.data && res.data.data.verificationDocuments) {
          setDocuments(res.data.data.verificationDocuments);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load verification status');
        setLoading(false);
      }
    };

    fetchDocumentStatus();
  }, []);

  const handleChange = (e) => {
    setDocumentData({
      ...documentData,
      [e.target.name]: e.target.value
    });
  };

  // Simulate file upload - in a real app, use file input and upload to storage
  const handleFileChange = (e) => {
    // Simulate file URL - in real app, this would be handled by file upload
    const fakeUrl = `https://storage.example.com/documents/${Date.now()}-${e.target.files[0].name}`;
    setDocumentData({
      ...documentData,
      documentUrl: fakeUrl
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!documentData.documentType || !documentData.documentUrl) {
      setError('Please select a document type and upload a file');
      return;
    }
    
    try {
      const res = await axios.post('/api/v1/doctors/verification', documentData);
      setDocuments(res.data.data);
      setSuccess('Document uploaded successfully');
      
      // Reset form
      setDocumentData({
        documentType: '',
        documentUrl: ''
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload document');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="verification-container">
      <h2>Doctor Verification</h2>
      
      {profile?.isVerified ? (
        <div className="verification-status verified">
          <div className="status-icon">✓</div>
          <div className="status-text">
            <h3>Verified</h3>
            <p>Your account has been verified. You can now access all doctor features.</p>
          </div>
        </div>
      ) : (
        <div className="verification-status pending">
          <div className="status-icon">!</div>
          <div className="status-text">
            <h3>Verification Pending</h3>
            <p>Your account is waiting for verification. Please upload the required documents below.</p>
          </div>
        </div>
      )}
      
      <div className="documents-section">
        <h3>Verification Documents</h3>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        {documents.length > 0 ? (
          <div className="documents-list">
            {documents.map((doc, index) => (
              <div key={index} className="document-item">
                <div className="document-icon">📄</div>
                <div className="document-details">
                  <h4>{doc.documentType}</h4>
                  <p>Uploaded on: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No documents uploaded yet. Please upload your verification documents.</p>
        )}
        
        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-group">
            <label htmlFor="documentType">Document Type</label>
            <select
              id="documentType"
              name="documentType"
              value={documentData.documentType}
              onChange={handleChange}
              required
            >
              <option value="">Select Document Type</option>
              <option value="Medical License">Medical License</option>
              <option value="Board Certification">Board Certification</option>
              <option value="Government ID">Government ID</option>
              <option value="Medical Degree">Medical Degree</option>
              <option value="Hospital Affiliation">Hospital Affiliation</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="documentFile">Upload Document</label>
            <input
              type="file"
              id="documentFile"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <small>Accepted formats: PDF, JPG, PNG (max 5MB)</small>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Upload Document
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorVerification;
