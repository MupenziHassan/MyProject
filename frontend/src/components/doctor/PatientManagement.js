import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/api/v1/doctors/patients');
        setPatients(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load patients');
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="patient-management">
      <h2>Patient Management</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search patients by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {patients.length === 0 ? (
        <div className="no-patients">
          <p>You don't have any patients yet.</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="no-results">
          <p>No patients match your search criteria.</p>
        </div>
      ) : (
        <div className="patient-list">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="patient-card">
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p>{patient.email}</p>
              </div>
              <div className="patient-actions">
                <Link to={`/doctor/patients/${patient._id}`} className="btn btn-primary">
                  View Details
                </Link>
                <Link to={`/doctor/patients/${patient._id}/order-test`} className="btn btn-secondary">
                  Order Test
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientManagement;
