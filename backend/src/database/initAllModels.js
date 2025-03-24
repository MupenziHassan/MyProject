const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Import all models
const {
  User,
  Patient,
  Doctor,
  MedicalRecord,
  Test,
  VitalRecord,
  Medication,
  TreatmentPlan,
  HealthAssessment,
  Appointment,
  Message,
  Notification,
  Prediction,
  ModelVersion,
  EducationMaterial
} = require('../models');

// Load environment variables
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
    envLoaded = true;
    break;
  }
}

if (!envLoaded) {
  console.warn('No .env file found. Using default settings.');
  // Set default MONGO_URI if no .env file is found
  process.env.MONGO_URI = 'mongodb://localhost:27017/health-prediction-dev';
}

// Initialize database with all models
async function initAllModels() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);

    // Check existing collections
    console.log('Checking collections...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log('Available collections:', collectionNames.join(', ') || 'none');

    // Create test users if the users collection is empty
    const usersCount = await User.countDocuments();
    if (usersCount === 0) {
      console.log('Users collection is empty. Creating test users...');
      
      // Create admin user
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = await User.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created');
      
      // Create doctor user
      const doctorPassword = await bcrypt.hash('doctor123', 10);
      const doctor = await User.create({
        name: 'Dr. Sarah Johnson',
        email: 'doctor@example.com',
        password: doctorPassword,
        role: 'doctor',
        isVerified: true
      });
      
      // Create doctor profile
      await Doctor.create({
        user: doctor._id,
        specialty: 'Oncology',
        subSpecialties: ['Breast Cancer', 'Lung Cancer'],
        licenseNumber: 'MED123456',
        yearsOfExperience: 10,
        education: [{
          degree: 'MD',
          institution: 'Harvard Medical School',
          year: 2010
        }],
        workSchedule: {
          monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
          friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' }
        }
      });
      console.log('Doctor user and profile created');
      
      // Create patient user
      const patientPassword = await bcrypt.hash('patient123', 10);
      const patient = await User.create({
        name: 'John Smith',
        email: 'patient@example.com',
        password: patientPassword,
        role: 'patient',
        isVerified: true
      });
      
      // Create patient profile
      await Patient.create({
        user: patient._id,
        dateOfBirth: new Date('1985-05-15'),
        gender: 'male',
        bloodType: 'O+',
        weight: { value: 80, unit: 'kg', updatedAt: new Date() },
        height: { value: 178, unit: 'cm', updatedAt: new Date() },
        contactInfo: {
          primaryPhone: '+1234567890',
          emergencyContact: {
            name: 'Jane Smith',
            relationship: 'Spouse',
            phone: '+1098765432'
          },
          address: {
            street: '123 Health St',
            city: 'Boston',
            state: 'MA',
            zipCode: '02115',
            country: 'USA'
          }
        },
        medicalHistory: [{
          condition: 'Hypertension',
          diagnosedDate: new Date('2019-03-15'),
          status: 'managed'
        }]
      });
      console.log('Patient user and profile created');
      
      // Create sample appointment
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const appointment = await Appointment.create({
        patient: patient._id,
        doctor: doctor._id,
        dateTime: nextWeek,
        duration: 30,
        endTime: new Date(nextWeek.getTime() + 30 * 60000),
        type: 'initial_consultation',
        status: 'scheduled',
        reason: 'Annual checkup and cancer risk assessment',
        location: {
          type: 'in-person',
          address: {
            facilityName: 'Health Prediction Medical Center',
            roomNumber: '303'
          }
        },
        createdBy: doctor._id
      });
      console.log('Sample appointment created');
      
      // Create sample vital records
      await VitalRecord.create({
        patient: patient._id,
        recordedBy: doctor._id,
        type: 'blood_pressure',
        value: '120/80',
        components: {
          systolic: 120,
          diastolic: 80
        },
        unit: 'mmHg'
      });
      
      await VitalRecord.create({
        patient: patient._id,
        recordedBy: doctor._id,
        type: 'heart_rate',
        value: 72,
        unit: 'bpm'
      });
      
      await VitalRecord.create({
        patient: patient._id,
        recordedBy: doctor._id,
        type: 'temperature',
        value: 36.8,
        unit: '°C'
      });
      console.log('Sample vital records created');
      
      // Create sample medication
      await Medication.create({
        patient: patient._id,
        prescribedBy: doctor._id,
        name: 'Lisinopril',
        genericName: 'Lisinopril',
        brandName: 'Prinivil',
        classification: 'antihypertensive',
        dosage: {
          value: 10,
          unit: 'mg',
          route: 'oral',
          form: 'tablet',
          instructions: 'Take once daily with water'
        },
        frequency: {
          timesPerDay: 1,
          specificTimes: ['08:00'],
          schedule: 'daily',
          asNeeded: false
        },
        prescription: {
          isActive: true,
          prescriptionDate: new Date(),
          expirationDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
          refillsTotal: 3,
          refillsRemaining: 3,
          quantity: 30,
          daysSupply: 30
        },
        reason: 'Treatment for hypertension'
      });
      console.log('Sample medication created');
      
      // Create sample model version
      const modelVersion = await ModelVersion.create({
        name: 'Breast Cancer Risk Assessment',
        version: '1.0.0',
        predictionType: 'cancer_risk',
        description: 'This model predicts breast cancer risk based on patient demographics and risk factors',
        status: 'active',
        metrics: {
          accuracy: 0.87,
          precision: 0.89,
          recall: 0.85,
          f1Score: 0.87,
          auc: 0.91
        },
        technical: {
          algorithm: 'Random Forest',
          framework: 'scikit-learn',
          featureCount: 15,
          trainingDataSize: 25000,
          validationMethod: 'cross-validation',
          trainingDate: new Date('2023-01-15')
        },
        features: [
          { name: 'age', description: 'Patient age', importance: 0.15, type: 'numerical', required: true },
          { name: 'family_history', description: 'Family history of breast cancer', importance: 0.25, type: 'binary', required: true },
          { name: 'genetic_markers', description: 'Relevant genetic markers', importance: 0.30, type: 'categorical', required: false }
        ],
        createdBy: admin._id
      });
      console.log('Sample model version created');
      
      // Create sample health assessment
      await HealthAssessment.create({
        patient: patient._id,
        assessmentType: 'cancer_risk',
        title: 'Breast Cancer Risk Assessment',
        administrator: doctor._id,
        questions: [
          {
            questionId: 'age',
            questionText: 'What is your age?',
            questionType: 'numeric',
            response: 38,
            responseDate: new Date()
          },
          {
            questionId: 'family_history',
            questionText: 'Do you have a family history of breast cancer?',
            questionType: 'yes_no',
            response: true,
            responseDate: new Date()
          },
          {
            questionId: 'smoking',
            questionText: 'Do you smoke?',
            questionType: 'yes_no',
            response: false,
            responseDate: new Date()
          }
        ],
        results: {
          score: 35,
          maxPossibleScore: 100,
          riskLevel: 'moderate',
          interpretation: 'Moderate risk of developing breast cancer based on family history'
        },
        completionStatus: 'completed'
      });
      console.log('Sample health assessment created');
      
      // Create sample education material
      await EducationMaterial.create({
        title: 'Understanding Breast Cancer Risk Factors',
        description: 'A comprehensive guide to breast cancer risk factors and prevention strategies',
        content: 'Breast cancer is one of the most common cancers among women worldwide...',
        type: 'article',
        topics: ['cancer', 'women_health', 'preventive_care'],
        targetAudience: {
          ageGroups: ['young_adults', 'adults', 'seniors'],
          forPatients: true,
          forCaregivers: true,
          languages: ['English']
        },
        media: {
          primaryImageUrl: 'https://example.com/images/breast-cancer-awareness.jpg'
        },
        author: {
          name: 'Dr. Sarah Johnson',
          credentials: 'MD, Oncology',
          organization: 'Health Prediction Medical Center'
        },
        publication: {
          publishedDate: new Date(),
          version: '1.0'
        },
        status: 'published',
        createdBy: doctor._id
      });
      console.log('Sample education material created');
      
      console.log('All sample data created successfully');
    } else {
      console.log(`Users collection already has ${usersCount} documents`);
    }

    // Create indexes for collections for better performance
    console.log('Creating indexes for collections...');
    
    console.log('Database initialization completed successfully');
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing database:', error);
    return { success: false, error: error.message };
  } finally {
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initAllModels()
    .then(result => {
      console.log('Initialization result:', result);
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unhandled error during initialization:', error);
      process.exit(1);
    });
} else {
  // Export for use in other modules
  module.exports = initAllModels;
}
