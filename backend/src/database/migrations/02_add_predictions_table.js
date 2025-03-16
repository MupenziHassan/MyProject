const mongoose = require('mongoose');

module.exports = {
  up: async () => {
    // Create predictions collection
    await mongoose.connection.db.createCollection('predictions', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['patient', 'doctor', 'cancerType', 'status'],
          properties: {
            patient: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            doctor: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            cancerType: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            probability: {
              bsonType: 'double',
              minimum: 0,
              maximum: 1,
              description: 'must be a number between 0 and 1'
            },
            riskLevel: {
              enum: ['low', 'moderate', 'high', 'very high'],
              description: 'must be one of the defined risk levels'
            },
            factors: {
              bsonType: 'array',
              items: {
                bsonType: 'object',
                required: ['name', 'impact'],
                properties: {
                  name: {
                    bsonType: 'string'
                  },
                  impact: {
                    bsonType: 'double',
                    minimum: 0,
                    maximum: 1
                  }
                }
              }
            },
            status: {
              enum: ['pending', 'processing', 'completed', 'failed'],
              description: 'must be one of the defined statuses and is required'
            }
          }
        }
      }
    });
    
    // Create indexes
    await mongoose.connection.db.collection('predictions').createIndex({ patient: 1 });
    await mongoose.connection.db.collection('predictions').createIndex({ doctor: 1 });
    await mongoose.connection.db.collection('predictions').createIndex({ cancerType: 1 });
    await mongoose.connection.db.collection('predictions').createIndex({ createdAt: -1 });
    
    console.log('Predictions collection created successfully');
  },
  
  down: async () => {
    // Drop predictions collection
    await mongoose.connection.db.dropCollection('predictions');
    
    console.log('Predictions collection dropped');
  }
};
