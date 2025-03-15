const axios = require('axios');

class FhirService {
  constructor() {
    this.baseUrl = process.env.FHIR_SERVER_URL;
    this.headers = {
      'Content-Type': 'application/fhir+json',
      'Authorization': `Bearer ${process.env.FHIR_API_KEY}`
    };
  }

  // Convert patient data to FHIR Patient resource
  convertPatientToFhir(patient, userData) {
    return {
      resourceType: 'Patient',
      id: patient._id.toString(),
      active: true,
      name: [{
        use: 'official',
        family: userData.name.split(' ').slice(-1)[0],
        given: userData.name.split(' ').slice(0, -1)
      }],
      gender: patient.gender,
      birthDate: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : undefined,
      // Additional mappings would be implemented here
    };
  }

  // Convert prediction to FHIR RiskAssessment resource
  convertPredictionToFhir(prediction) {
    return {
      resourceType: 'RiskAssessment',
      status: 'final',
      subject: {
        reference: `Patient/${prediction.patient}`
      },
      occurrenceDateTime: new Date(prediction.createdAt).toISOString(),
      condition: {
        display: prediction.condition
      },
      prediction: [{
        outcome: {
          text: prediction.condition
        },
        qualitativeRisk: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/risk-probability',
            code: prediction.riskLevel,
            display: prediction.riskLevel.charAt(0).toUpperCase() + prediction.riskLevel.slice(1)
          }]
        },
        probabilityDecimal: prediction.probability
      }]
    };
  }

  // More FHIR conversion and integration methods
  // ...existing code...
}

module.exports = new FhirService();
