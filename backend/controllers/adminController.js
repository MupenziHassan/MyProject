const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const faker = require('faker');
const bcrypt = require('bcryptjs');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Generate bulk users
exports.generateBulkUsers = async (req, res) => {
  try {
    const { userType, count } = req.body;
    
    // Validate input
    if (!userType || !count || count < 1 || count > 100) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid userType and count (1-100)'
      });
    }
    
    // List to hold created users
    const createdUsers = [];
    
    // Generate users
    for (let i = 0; i < count; i++) {
      const gender = faker.random.arrayElement(['male', 'female']);
      const name = faker.name.findName(null, null, gender);
      const email = faker.internet.email(name.split(' ')[0], name.split(' ')[1], 'healthsystem.com').toLowerCase();
      const password = await bcrypt.hash('password123', 10);
      
      // Create user
      const user = new User({
        name,
        email,
        password,
        phone: faker.phone.phoneNumber('+250 7## ### ###'),
        gender,
        dob: faker.date.between('1960-01-01', '2002-01-01'),
        role: userType,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      
      // Create role-specific profile
      if (userType === 'patient') {
        const patient = new Patient({
          userId: savedUser._id,
          address: {
            street: faker.address.streetAddress(),
            city: faker.address.city(),
            state: faker.address.state(),
            country: 'Rwanda',
            postalCode: faker.address.zipCode()
          },
          emergencyContact: {
            name: faker.name.findName(),
            relationship: faker.random.arrayElement(['Spouse', 'Parent', 'Sibling', 'Child', 'Friend']),
            phone: faker.phone.phoneNumber('+250 7## ### ###')
          },
          bloodType: faker.random.arrayElement(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
          allergies: faker.random.arrayElements(['Penicillin', 'Peanuts', 'Lactose', 'Pollen', 'Dust', 'None'], faker.datatype.number({ min: 0, max: 3 })),
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await patient.save();
      } else if (userType === 'doctor') {
        const specializations = [
          'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 'Orthopedics', 
          'Neurology', 'Psychiatry', 'Oncology', 'Gynecology', 'Family Medicine'
        ];
        
        const doctor = new Doctor({
          userId: savedUser._id,
          specialization: faker.random.arrayElement(specializations),
          licenseNumber: `MD${faker.datatype.number({ min: 10000, max: 99999 })}`,
          education: [
            {
              institution: faker.company.companyName() + ' Medical School',
              degree: faker.random.arrayElement(['MBBS', 'MD', 'DO']),
              year: faker.date.past(10).getFullYear()
            }
          ],
          experience: faker.datatype.number({ min: 1, max: 30 }),
          languages: ['English', faker.random.arrayElement(['French', 'Kinyarwanda', 'Swahili'])],
          availability: {
            monday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            tuesday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            wednesday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            thursday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            friday: { available: true, slots: ['09:00-12:00', '14:00-17:00'] },
            saturday: { available: faker.random.boolean(), slots: ['10:00-14:00'] },
            sunday: { available: false, slots: [] }
          }
        });
        
        await doctor.save();
      }
    }
    
    return res.status(201).json({
      success: true,
      count: createdUsers.length,
      message: `Successfully created ${createdUsers.length} ${userType} accounts`
    });
  } catch (error) {
    console.error('Bulk user generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error during bulk user generation'
    });
  }
};

// Delete a user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Delete associated profile
    if (user.role === 'patient') {
      await Patient.findOneAndDelete({ userId: user._id });
    } else if (user.role === 'doctor') {
      await Doctor.findOneAndDelete({ userId: user._id });
    }
    
    // Delete the user
    await user.remove();
    
    return res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};
