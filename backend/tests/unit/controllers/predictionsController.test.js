const { getPredictions, createPrediction } = require('../../../src/controllers/predictions');
const Prediction = require('../../../src/models/Prediction');
const httpMocks = require('node-mocks-http');
const mockData = require('../../mockData/predictions');

// Mock the Prediction model
jest.mock('../../../src/models/Prediction');

describe('Prediction Controller Tests', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getPredictions', () => {
    it('should return 200 and user predictions for patient role', async () => {
      // Setup
      req.user = { id: '123', role: 'patient' };
      Prediction.find.mockResolvedValue(mockData.patientPredictions);
      
      // Execute
      await getPredictions(req, res, next);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toHaveProperty('data');
      expect(Prediction.find).toHaveBeenCalledWith({ patient: '123' });
    });
    
    it('should return all predictions assigned to doctor for doctor role', async () => {
      // Setup
      req.user = { id: '456', role: 'doctor' };
      Prediction.find.mockResolvedValue(mockData.doctorPredictions);
      
      // Execute
      await getPredictions(req, res, next);
      
      // Assert
      expect(res.statusCode).toBe(200);
      expect(Prediction.find).toHaveBeenCalledWith({ doctor: '456' });
    });
    
    it('should handle errors', async () => {
      // Setup
      req.user = { id: '123', role: 'patient' };
      const errorMessage = 'Database error';
      Prediction.find.mockRejectedValue(new Error(errorMessage));
      
      // Execute
      await getPredictions(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0]).toBeInstanceOf(Error);
    });
  });
  
  describe('createPrediction', () => {
    it('should create a new prediction and return 201', async () => {
      // Setup
      req.user = { id: '456', role: 'doctor' };
      req.body = {
        patient: '123',
        cancerType: 'breast',
        data: { /* test prediction data */ }
      };
      
      Prediction.create.mockResolvedValue(mockData.newPrediction);
      
      // Execute
      await createPrediction(req, res, next);
      
      // Assert
      expect(res.statusCode).toBe(201);
      expect(JSON.parse(res._getData())).toHaveProperty('data');
      expect(Prediction.create).toHaveBeenCalledWith({
        patient: '123',
        doctor: '456',
        cancerType: 'breast',
        data: req.body.data,
        status: 'pending'
      });
    });
    
    // Additional tests for validation, authorization, etc.
  });
});
