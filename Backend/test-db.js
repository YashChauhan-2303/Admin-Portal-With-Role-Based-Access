const mongoose = require('mongoose');
const database = require('./src/config/database');
const User = require('./src/models/User');
const University = require('./src/models/University');

async function test() {
  try {
    await database.connect();
    console.log('Connected to database');
    
    // Clear existing data
    await User.deleteMany({});
    await University.deleteMany({});
    console.log('Cleared existing data');
    
    // Test simple user creation first
    const user = new User({
      email: 'test@test.com',
      password: 'password123',
      name: 'Test User',
      role: 'admin'
    });
    
    await user.save();
    console.log('User created successfully');
    
    // Test university creation with accreditation
    const university = new University({
      name: 'Test University',
      type: 'public',
      location: {
        city: 'Test City',
        state: 'Test State',
        country: 'United States'
      },
      enrollment: {
        undergraduate: 1000,
        graduate: 500
      },
      founded: 2000,
      accreditation: {
        status: 'accredited',
        agencies: [
          {
            name: 'Test Accreditation Agency',
            type: 'regional',
            validUntil: new Date('2025-12-31')
          }
        ]
      },
      createdBy: user._id
    });
    
    console.log('About to save university with accreditation...');
    await university.save();
    console.log('University with accreditation created successfully');
    
    await database.disconnect();
    console.log('Test completed');
  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    process.exit(1);
  }
}

test();