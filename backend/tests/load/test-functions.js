const _ = require('lodash');

// Test users
const users = [
  { email: 'patient1@example.com', password: 'password123', role: 'patient' },
  { email: 'patient2@example.com', password: 'password123', role: 'patient' },
  { email: 'patient3@example.com', password: 'password123', role: 'patient' }
];

const doctors = [
  { email: 'doctor1@example.com', password: 'password123', role: 'doctor' },
  { email: 'doctor2@example.com', password: 'password123', role: 'doctor' }
];

const patientIds = [
  '60b9b0f84f6a9a001f3e9c01',
  '60b9b0f84f6a9a001f3e9c02',
  '60b9b0f84f6a9a001f3e9c03'
];

const cancerTypes = ['breast', 'lung', 'colorectal', 'skin', 'prostate'];

// Generate test data
function generateRandomUser(userContext, events, done) {
  const user = _.sample(users);
  userContext.vars.email = user.email;
  userContext.vars.password = user.password;
  return done();
}

function generateDoctorUser(userContext, events, done) {
  const doctor = _.sample(doctors);
  userContext.vars.email = doctor.email;
  userContext.vars.password = doctor.password;
  return done();
}

function getRandomPatientId(userContext, events, done) {
  userContext.vars.patientId = _.sample(patientIds);
  userContext.vars.cancerType = _.sample(cancerTypes);
  
  // Generate random prediction data based on cancer type
  const predictionData = {
    age: _.random(30, 80),
    gender: _.sample(['male', 'female']),
    familyHistory: _.sample([true, false]),
    smoking: _.sample([true, false]),
    geneticMarkers: _.sample([[], ['BRCA1'], ['BRCA2'], ['EGFR']])
  };
  
  userContext.vars.predictionData = predictionData;
  return done();
}

module.exports = {
  generateRandomUser,
  generateDoctorUser,
  getRandomPatientId
};
