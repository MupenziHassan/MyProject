const mongoose = require('mongoose');

module.exports = {
  up: async () => {
    // Create initial collections and indexes
    
    // User collection
    await mongoose.connection.db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            email: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            password: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            role: {
              enum: ['patient', 'doctor', 'admin'],
              description: 'must be one of the defined roles and is required'
            }
          }
        }
      }
    });
    
    // Create indexes
    await mongoose.connection.db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    // Patient collection
    await mongoose.connection.db.createCollection('patients', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['user'],
          properties: {
            user: {
              bsonType: 'objectId',
              description: 'must be an objectId and is required'
            },
            dateOfBirth: {
              bsonType: 'date',
              description: 'must be a date'
            },
            gender: {
              enum: ['male', 'female', 'other'],
              description: 'must be one of the defined genders'
            }
          }
        }
      }
    });
    
    // Create indexes
    await mongoose.connection.db.collection('patients').createIndex({ user: 1 }, { unique: true });
    
    // Additional collections
    // ...existing code...
    
    console.log('Initial schema created successfully');
  },
  
  down: async () => {
    // Drop collections in reverse order
    await mongoose.connection.db.dropCollection('predictions');
    await mongoose.connection.db.dropCollection('tests');
    await mongoose.connection.db.dropCollection('appointments');
    await mongoose.connection.db.dropCollection('doctors');
    await mongoose.connection.db.dropCollection('patients');
    await mongoose.connection.db.dropCollection('users');
    
    console.log('Schema rollback completed');
  }
};
