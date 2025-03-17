const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Server status endpoint
app.get('/api/v1/status', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Mock user authentication
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email && password) {
    let role = 'patient';
    if (email.includes('doctor')) {
      role = 'doctor';
    } else if (email.includes('admin')) {
      role = 'admin';
    }
    
    // Return mock user data
    return res.json({
      success: true,
      data: {
        user: {
          _id: '123456789',
          name: email.split('@')[0],
          email,
          role
        },
        token: 'mock-jwt-token'
      }
    });
  }
  
  return res.status(401).json({
    success: false,
    error: 'Invalid credentials'
  });
});

// Mock user registration
app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields'
    });
  }
  
  // Return mock created user
  return res.status(201).json({
    success: true,
    data: {
      _id: Date.now().toString(),
      name,
      email,
      role: role || 'patient',
      createdAt: new Date()
    }
  });
});

// Mock health dashboard data endpoint
app.get('/api/v1/patients/health-dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      recentMetrics: {
        bloodPressure: { systolic: 120, diastolic: 80 },
        bloodSugar: { value: 95 },
        heartRate: { value: 72 },
        weight: { value: 70 }
      },
      predictions: [
        {
          _id: 'pred1',
          condition: 'Type 2 Diabetes',
          riskLevel: 'Moderate',
          probability: 0.35,
          createdAt: new Date().toISOString(),
          doctor: { name: 'John Smith' }
        }
      ],
      appointments: [
        {
          _id: 'app1',
          date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
          doctor: { name: 'Sarah Johnson' },
          type: 'in-person',
          location: 'Kigali Main Clinic',
          reason: 'Regular check-up'
        }
      ],
      tests: [
        {
          _id: 'test1',
          name: 'Complete Blood Count',
          date: new Date().toISOString(),
          category: 'Blood',
          status: 'Normal'
        }
      ],
      riskFactors: [
        { name: 'Blood Pressure', level: 0.3, severity: 'Moderate' },
        { name: 'BMI', level: 0.2, severity: 'Low' },
        { name: 'Family History', level: 0.7, severity: 'High' }
      ]
    }
  });
});

// Mock appointments endpoint
app.get('/api/v1/appointments/patient', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: 'app1',
        date: new Date(Date.now() + 86400000).toISOString(), // tomorrow
        doctor: { name: 'Sarah Johnson' },
        type: 'in-person',
        location: 'Kigali Main Clinic',
        reason: 'Regular check-up',
        status: 'confirmed'
      }
    ]
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Mock server running on port ${PORT}`);
});

module.exports = app;
