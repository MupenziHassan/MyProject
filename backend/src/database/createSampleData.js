const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log(`Loading environment from: ${envPath}`);
} else {
  console.warn('No .env file found, using default settings');
}

// Import models
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

/**
 * Create sample data for all collections
 * @param {boolean} clearExisting - Whether to clear existing data before creating new samples
 * @returns {Promise<Object>} - Results of the operation
 */
async function createSampleData(clearExisting = false) {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/health-prediction-dev';
    await mongoose.connect(mongoURI);
    console.log(`Connected to MongoDB: ${mongoose.connection.host}`);
    
    // Result tracking
    const results = {
      created: {},
      errors: []
    };
    
    // Clear existing data if requested
    if (clearExisting) {
      if (await confirmClearData()) {
        console.log('Clearing existing data...');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        for (const collection of collections) {
          await mongoose.connection.db.collection(collection.name).deleteMany({});
          console.log(`Cleared collection: ${collection.name}`);
        }
      } else {
        console.log('Data clearing cancelled');
      }
    }
    
    // Create Users
    console.log('\nCreating users...');
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: passwordHash,
      role: 'admin',
      isVerified: true
    });
    results.created.admin = 1;
    
    const doctor1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@example.com',
      password: passwordHash,
      role: 'doctor',
      isVerified: true
    });
    
    const doctor2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'michael.chen@example.com',
      password: passwordHash,
      role: 'doctor',
      isVerified: true
    });
    results.created.doctors = 2;
    
    const patient1 = await User.create({
      name: 'John Smith',
      email: 'john.smith@example.com',
      password: passwordHash,
      role: 'patient',
      isVerified: true
    });
    
    const patient2 = await User.create({
      name: 'Alice Johnson',
      email: 'alice.johnson@example.com',
      password: passwordHash,
      role: 'patient',
      isVerified: true
    });
    results.created.patients = 2;
    
    console.log('Created users successfully');
    
    // Create Doctor profiles
    console.log('\nCreating doctor profiles...');
    await Doctor.create({
      user: doctor1._id,
      specialty: 'Oncology',
      subSpecialties: ['Breast Cancer', 'Lung Cancer'],
      licenseNumber: 'MED12345',
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
    
    await Doctor.create({
      user: doctor2._id,
      specialty: 'Cardiology',
      licenseNumber: 'MED67890',
      yearsOfExperience: 15,
      education: [{
        degree: 'MD',
        institution: 'Stanford University',
        year: 2005
      }]
    });
    results.created.doctorProfiles = 2;
    console.log('Created doctor profiles successfully');
    
    // Create Patient profiles
    console.log('\nCreating patient profiles...');
    await Patient.create({
      user: patient1._id,
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
    
    await Patient.create({
      user: patient2._id,
      dateOfBirth: new Date('1990-08-22'),
      gender: 'female',
      bloodType: 'A+',
      weight: { value: 65, unit: 'kg', updatedAt: new Date() },
      height: { value: 165, unit: 'cm', updatedAt: new Date() },
      contactInfo: {
        primaryPhone: '+1987654321',
        address: {
          city: 'Boston',
          state: 'MA',
          country: 'USA'
        }
      }
    });
    results.created.patientProfiles = 2;
    console.log('Created patient profiles successfully');
    
    // Create Medical Records
    console.log('\nCreating medical records...');
    await MedicalRecord.create({
      patient: patient1._id,
      doctor: doctor1._id,
      visitDate: new Date('2023-06-15'),
      recordType: 'general_checkup',
      chiefComplaint: 'Annual physical examination',
      vitalSigns: {
        temperature: {
          value: 36.8,
          unit: 'celsius'
        },
        bloodPressure: {
          systolic: 122,
          diastolic: 78,
          unit: 'mmHg'
        },
        heartRate: {
          value: 72,
          unit: 'bpm'
        }
      },
      diagnosis: [{
        name: 'Essential hypertension',
        icd10Code: 'I10',
        type: 'primary'
      }],
      assessment: 'Patient has well-controlled hypertension',
      plan: 'Continue current medication, follow up in 6 months'
    });
    
    await MedicalRecord.create({
      patient: patient2._id,
      doctor: doctor2._id,
      visitDate: new Date('2023-07-20'),
      recordType: 'specialist_visit',
      chiefComplaint: 'Chest pain',
      vitalSigns: {
        bloodPressure: {
          systolic: 135,
          diastolic: 85,
          unit: 'mmHg'
        },
        heartRate: {
          value: 88,
          unit: 'bpm'
        }
      },
      diagnosis: [{
        name: 'Angina pectoris',
        icd10Code: 'I20.9',
        type: 'primary'
      }],
      assessment: 'Stable angina, likely due to coronary artery disease',
      plan: 'Stress test, start on nitroglycerin PRN'
    });
    results.created.medicalRecords = 2;
    console.log('Created medical records successfully');
    
    // Create Vital Records
    console.log('\nCreating vital records...');
    await VitalRecord.create({
      patient: patient1._id,
      recordedBy: doctor1._id,
      type: 'blood_pressure',
      value: '120/80',
      components: {
        systolic: 120,
        diastolic: 80
      },
      unit: 'mmHg'
    });
    
    await VitalRecord.create({
      patient: patient1._id,
      recordedBy: doctor1._id,
      type: 'heart_rate',
      value: 72,
      unit: 'bpm'
    });
    
    await VitalRecord.create({
      patient: patient2._id,
      recordedBy: doctor2._id,
      type: 'blood_pressure',
      value: '135/85',
      components: {
        systolic: 135,
        diastolic: 85
      },
      unit: 'mmHg'
    });
    results.created.vitalRecords = 3;
    console.log('Created vital records successfully');
    
    // Create Medications
    console.log('\nCreating medications...');
    await Medication.create({
      patient: patient1._id,
      prescribedBy: doctor1._id,
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
    
    await Medication.create({
      patient: patient2._id,
      prescribedBy: doctor2._id,
      name: 'Nitroglycerin',
      genericName: 'Nitroglycerin',
      brandName: 'Nitrostat',
      classification: 'antianginal',
      dosage: {
        value: '0.4',
        unit: 'mg',
        route: 'sublingual',
        form: 'tablet',
        instructions: 'Place under tongue as needed for chest pain'
      },
      frequency: {
        asNeeded: true,
        schedule: 'as_needed'
      },
      prescription: {
        isActive: true,
        prescriptionDate: new Date(),
        refillsTotal: 1,
        refillsRemaining: 1,
        quantity: 25
      },
      reason: 'For angina pain'
    });
    results.created.medications = a;
    console.log('Created medications successfully');
    
    // Create Appointments
    console.log('\nCreating appointments...');
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    await Appointment.create({
      patient: patient1._id,
      doctor: doctor1._id,
      dateTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 30 * 60000),
      duration: 30,
      type: 'follow_up',
      status: 'scheduled',
      reason: 'Follow up for hypertension',
      location: {
        type: 'in-person',
        address: {
          facilityName: 'Health Center',
          roomNumber: '305'
        }
      },
      createdBy: doctor1._id
    });
    
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    await Appointment.create({
      patient: patient2._id,
      doctor: doctor2._id,
      dateTime: nextMonth,
      endTime: new Date(nextMonth.getTime() + 45 * 60000),
      duration: 45,
      type: 'follow_up',
      status: 'scheduled',
      reason: 'Stress test results review',
      location: {
        type: 'in-person',
        address: {
          facilityName: 'Cardiology Center',
          roomNumber: '210'
        }
      },
      createdBy: doctor2._id
    });
    results.created.appointments = 2;
    console.log('Created appointments successfully');
    
    // Create Model Versions
    console.log('\nCreating model versions...');
    await ModelVersion.create({
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
        validationMethod: 'cross-validation'
      },
      features: [
        { name: 'age', description: 'Patient age', importance: 0.15, type: 'numerical', required: true },
        { name: 'family_history', description: 'Family history of breast cancer', importance: 0.25, type: 'binary', required: true }
      ],
      createdBy: adminUser._id
    });
    
    await ModelVersion.create({
      name: 'Heart Disease Risk Predictor',
      version: '1.0.0',
      predictionType: 'heart_disease_risk',
      description: 'This model predicts heart disease risk based on patient health data',
      status: 'active',
      metrics: {
        accuracy: 0.85,
        precision: 0.83,
        recall: 0.88,
        f1Score: 0.85,
        auc: 0.89
      },
      createdBy: adminUser._id
    });
    results.created.modelVersions = 2;
    console.log('Created model versions successfully');
    
    // Create Health Assessments
    console.log('\nCreating health assessments...');
    await HealthAssessment.create({
      patient: patient1._id,
      assessmentType: 'heart_disease_risk',
      title: 'Heart Disease Risk Assessment',
      administrator: doctor1._id,
      questions: [
        {
          questionId: 'age',
          questionText: 'What is your age?',
          questionType: 'numeric',
          response: 38,
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
        score: 25,
        maxPossibleScore: 100,
        riskLevel: 'low',
        interpretation: 'Low risk of developing heart disease based on current factors'
      },
      completionStatus: 'completed'
    });
    results.created.healthAssessments = 1;
    console.log('Created health assessments successfully');
    
    // Create Education Materials
    console.log('\nCreating education materials...');
    await EducationMaterial.create({
      title: 'Understanding Heart Disease Risk Factors',
      description: 'Learn about the key risk factors for heart disease and how to mitigate them',
      content: 'Heart disease is the leading cause of death globally. Risk factors include...',
      type: 'article',
      topics: ['heart_disease', 'preventive_care'],
      targetAudience: {
        ageGroups: ['adults', 'seniors'],
        forPatients: true,
        languages: ['English']
      },
      author: {
        name: 'Dr. Michael Chen',
        credentials: 'MD, Cardiology',
        organization: 'Health Center'
      },
      publication: {
        publishedDate: new Date(),
        version: '1.0'
      },
      status: 'published',
      createdBy: doctor2._id
    });
    results.created.educationMaterials = 1;
    console.log('Created education materials successfully');
    
    // Print summary
    console.log('\nSample Data Creation Summary:');
    for (const [key, value] of Object.entries(results.created)) {
      console.log(`- ${key}: ${value}`);
    }
    
    return {
      success: true,
      results
    };
    
  } catch (error) {
    console.error('Error creating sample data:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Helper function to confirm data clearing
async function confirmClearData() {
  return new Promise((resolve) => {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('⚠️ WARNING: This will delete ALL existing data. Continue? (y/N): ', (answer) => {
      readline.close();
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Run the function if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const clearExisting = args.includes('--clear');
  
  createSampleData(clearExisting)
    .then((result) => {
      if (result.success) {
        console.log('Sample data creation completed successfully');
      } else {
        console.error('Sample data creation failed:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Unhandled error during sample data creation:', error);
      process.exit(1);
    });
}

module.exports = createSampleData;
