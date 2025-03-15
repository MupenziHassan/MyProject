const Appointment = require('../models/Appointment');
const DoctorAvailability = require('../models/DoctorAvailability');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const notificationService = require('../services/NotificationService');

// @desc    Get all appointments for a doctor
// @route   GET /api/v1/appointments/doctor
// @access  Private (Doctor)
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const { status, date, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { doctor: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Execute query with pagination
    const appointments = await Appointment.find(query)
      .populate('patient', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 });
      
    // Get total count for pagination
    const total = await Appointment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all appointments for a patient
// @route   GET /api/v1/appointments/patient
// @access  Private (Patient)
exports.getPatientAppointments = async (req, res, next) => {
  try {
    const { status, date, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { patient: req.user.id };
    
    if (status) {
      query.status = status;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    // Execute query with pagination
    const appointments = await Appointment.find(query)
      .populate('doctor', 'name')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ date: 1 });
      
    // Get total count for pagination
    const total = await Appointment.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      },
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new appointment
// @route   POST /api/v1/appointments
// @access  Private (Patient & Doctor)
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, patientId, date, duration, type, reason, location, meetingLink, relatedTo } = req.body;
    
    // Determine the patient ID based on who's creating the appointment
    let finalPatientId;
    let finalDoctorId;
    
    if (req.user.role === 'patient') {
      finalPatientId = req.user.id;
      finalDoctorId = doctorId;
    } else if (req.user.role === 'doctor') {
      finalPatientId = patientId;
      finalDoctorId = req.user.id;
    } else {
      return res.status(403).json({
        success: false,
        error: 'Only patients and doctors can create appointments'
      });
    }
    
    // Check if doctor exists
    const doctor = await User.findOne({ _id: finalDoctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    // Check if patient exists
    const patient = await User.findOne({ _id: finalPatientId, role: 'patient' });
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Check doctor availability
    const appointmentDate = new Date(date);
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);
    
    // Check if the slot is available
    const availability = await DoctorAvailability.findOne({
      doctor: finalDoctorId,
      date: {
        $lte: appointmentDate
      },
      'availableSlots.start': { $lte: appointmentDate },
      'availableSlots.end': { $gte: endTime },
      'availableSlots.isBooked': false
    });
    
    if (!availability) {
      return res.status(400).json({
        success: false,
        error: 'The requested time slot is not available'
      });
    }
    
    // Create appointment
    const appointment = await Appointment.create({
      patient: finalPatientId,
      doctor: finalDoctorId,
      date: appointmentDate,
      duration,
      type,
      reason,
      location,
      meetingLink,
      relatedTo,
      status: 'scheduled'
    });
    
    // Update doctor availability
    const slot = availability.availableSlots.find(
      slot => slot.start <= appointmentDate && slot.end >= endTime
    );
    
    if (slot) {
      slot.isBooked = true;
      slot.appointmentId = appointment._id;
      await availability.save();
    }
    
    // Send notification to both parties
    await notificationService.sendAppointmentNotification(patient, doctor, appointment);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment status
// @route   PUT /api/v1/appointments/:id/status
// @access  Private (Patient & Doctor)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }
    
    // Get appointment
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // Check permissions
    const isPatient = req.user.id === appointment.patient.toString();
    const isDoctor = req.user.id === appointment.doctor.toString();
    
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this appointment'
      });
    }
    
    // Patients can only cancel appointments, not mark them completed
    if (isPatient && !['cancelled'].includes(status)) {
      return res.status(403).json({
        success: false,
        error: 'Patients can only cancel appointments'
      });
    }
    
    // Update status
    appointment.status = status;
    await appointment.save();
    
    // If cancelled, free up the time slot
    if (status === 'cancelled') {
      await DoctorAvailability.updateOne(
        { 'availableSlots.appointmentId': appointment._id },
        { 
          $set: { 
            'availableSlots.$.isBooked': false,
            'availableSlots.$.appointmentId': null
          }
        }
      );
    }
    
    // Send notification about status change
    const patient = await User.findById(appointment.patient);
    const doctor = await User.findById(appointment.doctor);
    
    await notificationService.sendAppointmentUpdateNotification(
      patient, 
      doctor, 
      appointment,
      req.user.role // Who made the change
    );
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get doctor availability
// @route   GET /api/v1/appointments/availability/:doctorId
// @access  Private
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Validate date range
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(start);
    end.setDate(start.getDate() + 7); // Default to 7 days if endDate not provided
    
    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    // Get availability
    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: 1 });
    
    // Format available slots
    const availableSlots = [];
    availability.forEach(day => {
      day.availableSlots.forEach(slot => {
        if (!slot.isBooked) {
          availableSlots.push({
            date: day.date,
            start: slot.start,
            end: slot.end,
            duration: (slot.end - slot.start) / (60 * 1000) // Duration in minutes
          });
        }
      });
    });
    
    res.status(200).json({
      success: true,
      count: availableSlots.length,
      data: availableSlots
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Set doctor availability
// @route   POST /api/v1/appointments/availability
// @access  Private (Doctor)
exports.setDoctorAvailability = async (req, res, next) => {
  try {
    const { date, workingHours, slotDuration, isRecurring, recurringPattern } = req.body;
    
    // Validate input
    const availabilityDate = new Date(date);
    const dayOfWeek = availabilityDate.getDay(); // 0=Sunday, 1=Monday, etc.
    
    // Create time slots based on working hours
    const [startHour, startMinute] = workingHours.start.split(':').map(Number);
    const [endHour, endMinute] = workingHours.end.split(':').map(Number);
    
    const startTime = new Date(availabilityDate);
    startTime.setHours(startHour, startMinute, 0, 0);
    
    const endTime = new Date(availabilityDate);
    endTime.setHours(endHour, endMinute, 0, 0);
    
    // Create slots
    const availableSlots = [];
    let currentSlotStart = new Date(startTime);
    
    while (currentSlotStart < endTime) {
      const slotEnd = new Date(currentSlotStart.getTime() + slotDuration * 60000);
      
      if (slotEnd <= endTime) {
        availableSlots.push({
          start: currentSlotStart,
          end: slotEnd,
          isBooked: false
        });
      }
      
      currentSlotStart = new Date(slotEnd);
    }
    
    // Check if availability already exists for this date
    let availability = await DoctorAvailability.findOne({
      doctor: req.user.id,
      date: {
        $gte: new Date(availabilityDate.setHours(0, 0, 0, 0)),
        $lt: new Date(availabilityDate.setHours(23, 59, 59, 999))
      }
    });
    
    if (availability) {
      // Update existing availability
      availability.workingHours = {
        start: workingHours.start,
        end: workingHours.end
      };
      availability.slotDuration = slotDuration;
      availability.isRecurring = isRecurring;
      availability.recurringPattern = recurringPattern;
      availability.availableSlots = availableSlots;
    } else {
      // Create new availability
      availability = await DoctorAvailability.create({
        doctor: req.user.id,
        date: availabilityDate,
        dayOfWeek,
        workingHours: {
          start: workingHours.start,
          end: workingHours.end
        },
        slotDuration,
        availableSlots,
        isRecurring,
        recurringPattern
      });
    }
    
    // If recurring, create availability for future dates
    if (isRecurring && recurringPattern) {
      const recurringDates = [];
      const futureDate = new Date(availabilityDate);
      
      // Create recurring slots for the next 8 weeks
      for (let i = 1; i <= 8; i++) {
        let daysToAdd;
        
        switch (recurringPattern) {
          case 'weekly':
            daysToAdd = 7;
            break;
          case 'biweekly':
            daysToAdd = 14;
            break;
          case 'monthly':
            daysToAdd = 28; // Approximately 4 weeks
            break;
          default:
            daysToAdd = 7;
        }
        
        futureDate.setDate(futureDate.getDate() + daysToAdd);
        recurringDates.push(new Date(futureDate));
      }
      
      // Create availability for future dates (async, don't await)
      recurringDates.forEach(async (recDate) => {
        try {
          // Check if already exists
          const exists = await DoctorAvailability.findOne({
            doctor: req.user.id,
            date: {
              $gte: new Date(recDate.setHours(0, 0, 0, 0)),
              $lt: new Date(recDate.setHours(23, 59, 59, 999))
            }
          });
          
          if (!exists) {
            const recSlots = availableSlots.map(slot => {
              const start = new Date(recDate);
              start.setHours(
                new Date(slot.start).getHours(),
                new Date(slot.start).getMinutes(),
                0, 0
              );
              
              const end = new Date(recDate);
              end.setHours(
                new Date(slot.end).getHours(),
                new Date(slot.end).getMinutes(),
                0, 0
              );
              
              return {
                start,
                end,
                isBooked: false
              };
            });
            
            await DoctorAvailability.create({
              doctor: req.user.id,
              date: recDate,
              dayOfWeek: recDate.getDay(),
              workingHours: {
                start: workingHours.start,
                end: workingHours.end
              },
              slotDuration,
              availableSlots: recSlots,
              isRecurring: true,
              recurringPattern
            });
          }
        } catch (err) {
          console.error(`Error creating recurring availability for ${recDate}:`, err);
        }
      });
    }
    
    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (err) {
    next(err);
  }
};
