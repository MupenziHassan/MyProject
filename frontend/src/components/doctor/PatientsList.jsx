import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Table, Form, InputGroup, Button } from 'react-bootstrap';
import LoadingState from '../common/LoadingState';
import Skeleton from '../common/Skeleton';
import useApi from '../../hooks/useApi';

const PatientsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Use our custom API hook to fetch patients
  const { 
    data: apiResponse, 
    isLoading, 
    error, 
    fetchData: refetchPatients 
  } = useApi({
    endpoint: '/doctors/patients',
    autoFetch: true,
    cacheDuration: 2 * 60 * 1000 // 2 minutes cache
  });
  
  // Extract patients from API response using useMemo to prevent dependencies changes
  const patients = useMemo(() => apiResponse?.data || [], [apiResponse]);
  
  // Filter and sort patients
  const filterPatients = useCallback(() => {
    let results = [...patients];
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const search = searchTerm.toLowerCase();
      results = results.filter(patient => 
        patient.name?.toLowerCase().includes(search) || 
        patient.email?.toLowerCase().includes(search) ||
        patient.id?.toString().includes(search)
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let fieldA = a[sortField] || '';
      let fieldB = b[sortField] || '';
      
      // Handle nested fields like patient.dob
      if (sortField.includes('.')) {
        const parts = sortField.split('.');
        fieldA = parts.reduce((obj, key) => obj?.[key] ?? '', a);
        fieldB = parts.reduce((obj, key) => obj?.[key] ?? '', b);
      }
      
      // Handle date comparisons
      if (fieldA instanceof Date && fieldB instanceof Date) {
        return sortDirection === 'asc' 
          ? fieldA.getTime() - fieldB.getTime() 
          : fieldB.getTime() - fieldA.getTime();
      }
      
      // Handle string comparisons
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB) 
          : fieldB.localeCompare(fieldA);
      }
      
      // Handle number comparisons
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    });
    
    return results;
  }, [patients, searchTerm, sortField, sortDirection]);
  
  // Get filtered patients
  const filteredPatients = useMemo(() => filterPatients(), [filterPatients]);
  
  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field clicked again
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <i className="fas fa-sort-up ml-1"></i> 
      : <i className="fas fa-sort-down ml-1"></i>;
  };
  
  // Custom loading component using Skeleton
  const loadingComponent = (
    <div className="patients-list-loading">
      <div className="mb-3">
        <Skeleton type="text" />
      </div>
      <Skeleton type="table-row" count={5} />
    </div>
  );
  
  return (
    <div className="patients-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Patients</h2>
        
        <InputGroup style={{ maxWidth: '300px' }}>
          <Form.Control
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
            {searchTerm ? <i className="fas fa-times"></i> : <i className="fas fa-search"></i>}
          </Button>
        </InputGroup>
      </div>
      
      <LoadingState 
        isLoading={isLoading} 
        error={error}
        loadingComponent={loadingComponent}
        onRetry={refetchPatients}
      >
        {filteredPatients.length > 0 ? (
          <Table responsive hover>
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                  Patient Name {renderSortIcon('name')}
                </th>
                <th onClick={() => handleSort('age')} style={{ cursor: 'pointer' }}>
                  Age {renderSortIcon('age')}
                </th>
                <th onClick={() => handleSort('gender')} style={{ cursor: 'pointer' }}>
                  Gender {renderSortIcon('gender')}
                </th>
                <th onClick={() => handleSort('lastVisit')} style={{ cursor: 'pointer' }}>
                  Last Visit {renderSortIcon('lastVisit')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle bg-primary text-white mr-2">
                        {patient.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        {patient.name}
                        <div className="small text-muted">{patient.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{patient.age || 'N/A'}</td>
                  <td>{patient.gender || 'N/A'}</td>
                  <td>
                    {patient.lastVisit 
                      ? new Date(patient.lastVisit).toLocaleDateString() 
                      : 'No visits'}
                  </td>
                  <td>
                    <Link 
                      to={`/doctor/patients/${patient.id}`} 
                      className="btn btn-sm btn-primary mr-2"
                    >
                      <i className="fas fa-user-md mr-1"></i> View
                    </Link>
                    <Link 
                      to={`/doctor/patients/${patient.id}/treatment-plan`} 
                      className="btn btn-sm btn-outline-secondary"
                    >
                      <i className="fas fa-clipboard-list mr-1"></i> Plan
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-center py-5">
            <i className="fas fa-users fa-3x text-muted mb-3"></i>
            <h4 className="text-muted">No patients found</h4>
            <p className="text-muted">
              {searchTerm 
                ? `No patients match "${searchTerm}"`
                : "You don't have any patients yet"}
            </p>
          </div>
        )}
      </LoadingState>
      
      <style jsx="true">{`
        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
        }
        .patients-list-loading {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default PatientsList;
