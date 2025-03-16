const MLService = require('../../../src/services/MachineLearningService');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('Machine Learning Service Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getCancerPrediction', () => {
    it('should return prediction when API call is successful', async () => {
      // Setup
      const patientData = {
        age: 45,
        gender: 'female',
        medicalHistory: ['hypertension'],
        geneticMarkers: ['BRCA1']
      };
      
      const mockResponse = {
        data: {
          probability: 0.75,
          riskLevel: 'high',
          factors: [{
            name: 'Age',
            impact: 0.3
          }, {
            name: 'Genetic',
            impact: 0.45
          }],
          confidenceInterval: [0.7, 0.8]
        }
      };
      
      axios.post.mockResolvedValue(mockResponse);
      
      // Execute
      const result = await MLService.getCancerPrediction(patientData, 'breast');
      
      // Assert
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          modelVersion: expect.any(String),
          patientData: expect.any(Object)
        }),
        expect.any(Object)
      );
      expect(result).toHaveProperty('prediction');
      expect(result.prediction).toEqual(mockResponse.data);
    });
    
    it('should handle API errors gracefully', async () => {
      // Setup
      const patientData = { /* test data */ };
      axios.post.mockRejectedValue(new Error('API failure'));
      
      // Execute & Assert
      await expect(MLService.getCancerPrediction(patientData, 'breast'))
        .rejects.toThrow('Cancer prediction failed: API failure');
    });
  });
  
  // More tests for other service methods
});
