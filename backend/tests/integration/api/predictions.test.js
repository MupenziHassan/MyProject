const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../../src/app');
const User = require('../../../src/models/User');
const Prediction = require('../../../src/models/Prediction');
const { generateToken } = require('../../helpers/auth');

describe('Predictions API Integration Tests', () => {
  let patientToken;
  let doctorToken;
  let patientId;
  let doctorId;
  
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGO_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create test users
    const patient = await User.create({
      name: 'Test Patient',
      email: 'patient@test.com',
      password: 'password123',
      role: 'patient'
    });
    
    const doctor = await User.create({
      name: 'Test Doctor',
      email: 'doctor@test.com',
      password: 'password123',
      role: 'doctor'
    });
    
    patientId = patient._id;
    doctorId = doctor._id;
    
    // Generate auth tokens
    patientToken = generateToken(patient);
    doctorToken = generateToken(doctor);
  });
  
  afterAll(async () => {
    // Clean up database
    await User.deleteMany({});
    await Prediction.deleteMany({});
    await mongoose.connection.close();
  });
  
  describe('GET /api/v1/predictions', () => {
    beforeEach(async () => {
      await Prediction.deleteMany({});
      
      // Create test predictions
      await Prediction.create([
        {
          patient: patientId,
          doctor: doctorId,
          cancerType: 'breast',
          probability: 0.75,
          riskLevel: 'high',
          status: 'completed'
        },
        {
          patient: patientId,
          doctor: doctorId,
          cancerType: 'lung',
          probability: 0.35,
          riskLevel: 'moderate',
          status: 'completed'
        }
      ]);
    });
    
    it('should return all patient predictions for authenticated patient', async () => {
      const res = await request(app)
        .get('/api/v1/predictions')
        .set('Authorization', `Bearer ${patientToken}`)
        .send();
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
    
    it('should return predictions for doctor', async () => {
      const res = await request(app)
        .get('/api/v1/predictions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send();
      
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
    
    it('should deny access without authentication', async () => {
      const res = await request(app)
        .get('/api/v1/predictions')
        .send();
      
      expect(res.statusCode).toBe(401);
    });
  });
  
  describe('POST /api/v1/predictions', () => {
    it('should create a new prediction', async () => {
      const predictionData = {
        patient: patientId,
        cancerType: 'colorectal',
        data: {
          age: 55,
          gender: 'male',
          familyHistory: true
        }
      };
      
      const res = await request(app)
        .post('/api/v1/predictions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(predictionData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('_id');
      expect(res.body.data.cancerType).toBe('colorectal');
      expect(res.body.data.status).toBe('pending');
    });
    
    it('should validate required fields', async () => {
      // Missing patient
      const invalidData = {
        cancerType: 'breast'
      };
      
      const res = await request(app)
        .post('/api/v1/predictions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(invalidData);
      
      expect(res.statusCode).toBe(400);
    });
  });
});
