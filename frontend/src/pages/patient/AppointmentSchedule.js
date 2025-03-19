import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AppointmentSchedule = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [doctors, setDoctors] = useState([]);
  
  const [formData, setFormData] = useState({
    doctorId: '',
    appointmentDate: null,
    appointmentTime: '',
    reasonForVisit: '',
    notes: ''
  });
  
  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];
  
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await api.get('/api/v1/doctors');
        setDoctors(response.data.data);
      } catch (error) {
        console.log('Using mock doctor data');
        // Mock data for presentation
        setDoctors([
          { _id: '1', name: 'Dr. Sarah Johnson', specialty: 'Oncology' },
          { _id: '2', name: 'Dr. Michael Smith', specialty: 'General Practice' },
          { _id: '3', name: 'Dr. Jessica Williams', specialty: 'Hematology' },
          { _id: '4', name: 'Dr. Robert Brown', specialty: 'Radiology' }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDoctors();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      appointmentDate: date
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.doctorId || !formData.appointmentDate || !formData.appointmentTime || !formData.reasonForVisit) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      // Format the datetime for API
      const appointmentDateTime = new Date(formData.appointmentDate);
      const [hours, minutes] = formData.appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      const requestData = {
        doctorId: formData.doctorId,
        appointmentDateTime: appointmentDateTime.toISOString(),
        reason: formData.reasonForVisit,
        notes: formData.notes
      };
      
      // Submit to API
      // const response = await api.post('/api/v1/patient/appointments', requestData);
      
      // For demo purposes
      console.log('Appointment request:', requestData);
      
      // Simulating successful response
      setSuccess('Appointment scheduled successfully! You will receive a confirmation shortly.');
      
      // Reset form
      setFormData({
        doctorId: '',
        appointmentDate: null,
        appointmentTime: '',
        reasonForVisit: '',
        notes: ''
      });
      
      // Navigate to appointments page after delay
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
      
    } catch (err) {
      setError('Failed to schedule appointment. Please try again later.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Filter out weekends for datepicker
  const filterWeekends = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 is Sunday, 6 is Saturday
  };
  
  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading available doctors...</p>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <PageHeader
        title="Schedule Appointment"
        subtitle="Book a consultation with Ubumuntu Clinic doctors"
        showBackButton={true}
        backPath="/patient/appointments"
      />
      
      <Row>
        <Col lg={8} className="mx-auto">
          <Card className="shadow-sm">
            <Card.Body className="p-lg-4">
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
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Select Doctor</Form.Label>
                  <Form.Select
                    name="doctorId"
                    value={formData.doctorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select a doctor --</option>
                    {doctors.map(doctor => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.name} - {doctor.specialty}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>Date</Form.Label>
                      <DatePicker
                        selected={formData.appointmentDate}
                        onChange={handleDateChange}
                        filterDate={filterWeekends}
                        minDate={new Date()}
                        maxDate={new Date(new Date().setMonth(new Date().getMonth() + 3))}
                        className="form-control"
                        placeholderText="Select a date"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label>Time</Form.Label>
                      <Form.Select
                        name="appointmentTime"
                        value={formData.appointmentTime}
                        onChange={handleChange}
                        disabled={!formData.appointmentDate}
                        required
                      >
                        <option value="">-- Select time --</option>
                        {timeSlots.map((time, index) => (
                          <option key={index} value={time}>{time}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label>Reason for Visit</Form.Label>
                  <Form.Select
                    name="reasonForVisit"
                    value={formData.reasonForVisit}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select reason --</option>
                    <option value="consultation">General Consultation</option>
                    <option value="followup">Follow-up Appointment</option>
                    <option value="screening">Cancer Screening</option>
                    <option value="results">Discuss Test Results</option>
                    <option value="treatment">Treatment Discussion</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Additional Notes</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional information you want to provide to the doctor"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-center">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={submitting}
                    className="px-4"
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-calendar-check me-2"></i>
                        Schedule Appointment
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AppointmentSchedule;
