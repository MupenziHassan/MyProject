const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Doctor = require('./models/Doctor');
const Patient = require('./models/Patient');
const ModelVersion = require('./models/ModelVersion');
const NotificationTemplate = require('./models/NotificationTemplate');

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Create sample data
const createUsers = async () => {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin user created');

    // Create doctor users
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const doctor1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'doctor@example.com',
      password: doctorPassword,
      role: 'doctor'
    });

    const doctor2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'doctor2@example.com',
      password: doctorPassword,
      role: 'doctor'
    });

    // Create doctor profiles
    await Doctor.create({
      user: doctor1._id,
      specialization: 'oncology',
      licenseNumber: 'MED123456',
      experience: 8,
      isVerified: true,
      contactNumber: '+1234567890',
      qualifications: [
        {
          degree: 'MD',
          institution: 'Harvard Medical School',
          year: 2010
        }
      ]
    });

    await Doctor.create({
      user: doctor2._id,
      specialization: 'cardiology',
      licenseNumber: 'MED654321',
      experience: 12,
      isVerified: true,
      contactNumber: '+1987654320',
      qualifications: [
        {
          degree: 'MD',
          institution: 'Stanford University',
          year: 2008
        }
      ]
    });
    console.log('Doctor users created');

    // Create patient users
    const patientPassword = await bcrypt.hash('patient123', 10);
    const patient1 = await User.create({
      name: 'John Smith',
      email: 'patient@example.com',
      password: patientPassword,
      role: 'patient'
    });

    const patient2 = await User.create({
      name: 'Emily Davis',
      email: 'patient2@example.com',
      password: patientPassword,
      role: 'patient'
    });

    // Create patient profiles
    await Patient.create({
      user: patient1._id,
      dateOfBirth: new Date('1985-05-15'),
      gender: 'male',
      bloodType: 'O+',
      contactInfo: {
        primaryPhone: '+1123456789',
        address: {
          city: 'Boston',
          state: 'MA',
          country: 'USA'
        }
      },
      medicalHistory: [
        {
          condition: 'Hypertension',
          diagnosedDate: new Date('2018-03-10'),
          status: 'managed'
        }
      ]
    });

    await Patient.create({
      user: patient2._id,
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      bloodType: 'A+',
      contactInfo: {
        primaryPhone: '+1987654321',
        address: {
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        }
      }
    });
    console.log('Patient users created');

    // Create model versions
    await ModelVersion.create({
      name: 'Breast Cancer Risk Predictor',
      version: 'v1.0',
      category: 'cancer',
      status: 'active',
      accuracy: 0.85,
      precision: 0.87,
      recall: 0.83,
      apiEndpoint: '/api/predict/breast-cancer',
      createdBy: admin._id
    });

    await ModelVersion.create({
      name: 'Lung Cancer Risk Predictor',
      version: 'v1.0',
      category: 'cancer',
      status: 'active',
      accuracy: 0.82,
      precision: 0.84,
      recall: 0.80,
      apiEndpoint: '/api/predict/lung-cancer',
      createdBy: admin._id
    });
    console.log('Model versions created');

    // Create notification templates
    await NotificationTemplate.create([
      {
        name: 'test_result_ready',
        description: 'Notification when test results are available',
        type: 'test_result',
        channels: {
          email: {
            enabled: true,
            subject: 'Your test results are ready',
            template: 'Dear {{patientName}},\n\nYour test results for {{testName}} are now available. Please log in to view them.'
          },
          sms: {
            enabled: true,
            template: 'Your test results for {{testName}} are now available. Please log in to view them.'
          },
          inApp: {
            enabled: true,
            title: 'Test Results Ready',
            template: 'Your test results for {{testName}} are now available.'
          }
        },
        variables: [
          { name: 'patientName', description: 'Patient\'s name' },
          { name: 'testName', description: 'Name of the test' },
          { name: 'testDate', description: 'Date of the test' },
          { name: 'doctorName', description: 'Doctor\'s name' }
        ]
      },
      {
        name: 'appointment_reminder',
        description: 'Reminder for upcoming appointment',
        type: 'appointment',
        channels: {
          email: {
            enabled: true,
            subject: 'Reminder: Your upcoming appointment',
            template: 'Dear {{patientName}},\n\nThis is a reminder about your appointment with Dr. {{doctorName}} on {{appointmentDate}} at {{appointmentTime}}.'
          },
          sms: {
            enabled: true,
            template: 'Reminder: Your appointment with Dr. {{doctorName}} is scheduled for {{appointmentDate}} at {{appointmentTime}}.'
          },
          inApp: {
            enabled: true,
            title: 'Appointment Reminder',
            template: 'You have an appointment with Dr. {{doctorName}} on {{appointmentDate}} at {{appointmentTime}}.'
          }
        },
        variables: [
          { name: 'patientName', description: 'Patient\'s name' },
          { name: 'doctorName', description: 'Doctor\'s name' },
          { name: 'appointmentDate', description: 'Date of appointment' },
          { name: 'appointmentTime', description: 'Time of appointment' }
        ]
      }
    ]);
    console.log('Notification templates created');

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run the seeding
createUsers();
