const Patient = require('../models/Patient');
const User = require('../models/User');
const HealthRecord = require('../models/HealthRecord');
const Prediction = require('../models/Prediction');
const Appointment = require('../models/Appointment');
const TestResult = require('../models/TestResult');

// Get health dashboard data for a patient
exports.getHealthDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`[DB] Fetching health dashboard for user: ${userId}`);
    
    // Get the latest health metrics
    const latestGeneralRecord = await HealthRecord.findOne({ 
      patientId: userId,
      type: 'general'
    }).sort({ date: -1 });
    
    console.log(`[DB] Found latest health record: ${latestGeneralRecord ? 'yes' : 'no'}`);
    
    // Get predictions for patient
    const predictions = await Prediction.find({ patientId: userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'doctorId',
        select: 'userId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      });
    
    // Get upcoming appointments
    const now = new Date();
    const appointments = await Appointment.find({
      patientId: userId,
      date: { $gt: now },
      status: { $in: ['scheduled', 'confirmed'] }
    })
    .sort({ date: 1 })
    .populate({
      path: 'doctorId',
      select: 'userId specialization',
      populate: {
        path: 'userId',
        select: 'name'
      }
    })
    .limit(5);
    
    // Get recent test results
    const tests = await TestResult.find({ patientId: userId })
      .sort({ date: -1 })
      .limit(5);
    
    // Calculate risk factors based on health records and predictions
    let riskFactors = [];
    if (latestGeneralRecord) {
      // Blood pressure risk
      if (latestGeneralRecord.bloodPressureSystolic > 140 || latestGeneralRecord.bloodPressureDiastolic > 90) {
        const level = (latestGeneralRecord.bloodPressureSystolic - 120) / 80;
        riskFactors.push({
          name: 'Blood Pressure',
          level: Math.min(Math.max(level, 0.1), 1),
          severity: latestGeneralRecord.bloodPressureSystolic > 160 ? 'High' : 'Moderate'
        });
      }
      
      // BMI risk
      if (latestGeneralRecord.height && latestGeneralRecord.weight) {
        const heightInMeters = latestGeneralRecord.height / 100;
        const bmi = latestGeneralRecord.weight / (heightInMeters * heightInMeters);
        
        if (bmi > 25 || bmi < 18.5) {
          const level = Math.abs(bmi - 22) / 15;
          riskFactors.push({
            name: 'BMI',
            level: Math.min(Math.max(level, 0.1), 1),
            severity: bmi > 30 ? 'High' : 'Moderate'
          });
        }
      }
    }
    
    // Add risk factors from predictions
    predictions.forEach(prediction => {
      if (prediction.factors && prediction.factors.length > 0) {
        prediction.factors.forEach(factor => {
          if (!riskFactors.some(rf => rf.name === factor.name)) {
            riskFactors.push({
              name: factor.name,
              level: factor.weight,
              severity: factor.weight > 0.7 ? 'High' : factor.weight > 0.4 ? 'Moderate' : 'Low'
            });
          }
        });
      }
    });
    
    // Format data for frontend
    let recentMetrics = null;
    if (latestGeneralRecord) {
      recentMetrics = {
        bloodPressure: {
          systolic: latestGeneralRecord.bloodPressureSystolic,
          diastolic: latestGeneralRecord.bloodPressureDiastolic
        },
        bloodSugar: { value: latestGeneralRecord.bloodSugar },
        heartRate: { value: latestGeneralRecord.heartRate },
        weight: { value: latestGeneralRecord.weight }
      };
    }
    
    // Format other data for frontend
    const formattedPredictions = predictions.map(p => ({
      _id: p._id,
      condition: p.condition,
      riskLevel: p.riskLevel,
      probability: p.probability,
      createdAt: p.createdAt,
      doctor: p.doctorId ? {
        name: p.doctorId.userId ? p.doctorId.userId.name : 'Unknown'
      } : null
    }));
    
    const formattedAppointments = appointments.map(a => ({
      _id: a._id,
      date: a.date,
      doctor: a.doctorId ? {
        name: a.doctorId.userId ? a.doctorId.userId.name : 'Unknown',
        specialization: a.doctorId.specialization
      } : null,
      type: a.type,
      location: a.location,
      reason: a.reason,
      status: a.status
    }));
    
    console.log(`[DB] Returning dashboard with ${predictions.length} predictions, ${appointments.length} appointments`);
    
    return res.status(200).json({
      success: true,
      data: {
        recentMetrics,
        predictions: formattedPredictions,
        appointments: formattedAppointments,
        tests,
        riskFactors
      }
    });
  } catch (error) {
    console.error('[DB] Error fetching health dashboard:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching health dashboard'
    });
  }
};
