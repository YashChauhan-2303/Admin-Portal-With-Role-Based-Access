const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const User = require('../models/User');
const University = require('../models/University');
const logger = require('../config/logger');

// Sample data
const seedUsers = [
  {
    email: 'admin@university.com',
    password: 'Admin123!',
    name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'viewer@university.com',
    password: 'Viewer123!',
    name: 'John Viewer',
    role: 'viewer'
  }
];

const seedUniversities = [
  {
    name: 'Stanford University',
    type: 'private',
    location: {
      city: 'Stanford',
      state: 'California',
      country: 'United States',
      zipCode: '94305',
      address: '450 Serra Mall',
      coordinates: [-122.1430, 37.4419] // [longitude, latitude]
    },
    contact: {
      phone: '+1-650-723-2300',
      email: 'info@stanford.edu',
      website: 'https://www.stanford.edu'
    },
    enrollment: {
      undergraduate: 7087,
      graduate: 9390
    },
    founded: 1885,
    accreditation: {
      status: 'accredited',
      agencies: [
        {
          name: 'WASC Senior College and University Commission',
          type: 'regional',
          validUntil: new Date('2024-12-31T00:00:00.000Z')
        }
      ]
    },
    rankings: {
      national: { rank: 6, source: 'US News', year: 2024 },
      global: { rank: 3, source: 'QS World Rankings', year: 2024 }
    },
    tuition: {
      inState: { undergraduate: 56169, graduate: 54315 },
      outOfState: { undergraduate: 56169, graduate: 54315 },
      international: { undergraduate: 56169, graduate: 54315 },
      academicYear: '2023-2024'
    },
    programs: [
      { name: 'Computer Science', level: 'bachelor', department: 'Engineering', duration: '4 years', credits: 180 },
      { name: 'Business Administration', level: 'master', department: 'Business', duration: '2 years', credits: 60 },
      { name: 'Medicine', level: 'doctoral', department: 'Medicine', duration: '4 years', credits: 240 }
    ],
    facilities: {
      libraries: 20,
      laboratories: 85,
      dormitories: 80,
      sportsComplexes: 5,
      researchCenters: 18
    },
    demographics: {
      studentToFacultyRatio: '5:1',
      internationalStudentPercentage: 22.2,
      graduationRate: 95.4,
      employmentRate: 94.0
    },
    description: 'Stanford University is a private research university in Stanford, California. The campus occupies 8,180 acres, among the largest in the United States, and enrolls over 17,000 students.',
    tags: ['research', 'technology', 'innovation', 'private', 'california']
  },
  {
    name: 'University of California, Berkeley',
    type: 'public',
    location: {
      city: 'Berkeley',
      state: 'California',
      country: 'United States',
      zipCode: '94720',
      address: '200 California Hall',
      coordinates: [-122.2585, 37.8719] // [longitude, latitude]
    },
    contact: {
      phone: '+1-510-642-6000',
      email: 'info@berkeley.edu',
      website: 'https://www.berkeley.edu'
    },
    enrollment: {
      undergraduate: 31780,
      graduate: 13209
    },
    founded: 1868,
    accreditation: {
      status: 'accredited',
      agencies: [
        {
          name: 'WASC Senior College and University Commission',
          type: 'regional',
          validUntil: new Date('2025-06-30T00:00:00.000Z')
        }
      ]
    },
    rankings: {
      national: { rank: 22, source: 'US News', year: 2024 },
      global: { rank: 10, source: 'QS World Rankings', year: 2024 }
    },
    tuition: {
      inState: { undergraduate: 14253, graduate: 14184 },
      outOfState: { undergraduate: 44007, graduate: 14184 },
      international: { undergraduate: 44007, graduate: 29184 },
      academicYear: '2023-2024'
    },
    programs: [
      { name: 'Engineering', level: 'bachelor', department: 'Engineering', duration: '4 years', credits: 120 },
      { name: 'Business Administration', level: 'master', department: 'Haas School of Business', duration: '2 years', credits: 60 },
      { name: 'Computer Science', level: 'master', department: 'EECS', duration: '2 years', credits: 48 }
    ],
    facilities: {
      libraries: 20,
      laboratories: 150,
      dormitories: 20,
      sportsComplexes: 3,
      researchCenters: 130
    },
    demographics: {
      studentToFacultyRatio: '19:1',
      internationalStudentPercentage: 16.8,
      graduationRate: 91.9,
      employmentRate: 89.2
    },
    description: 'The University of California, Berkeley is a public land-grant research university in Berkeley, California. Established in 1868 as the University of California, it is the state\'s first land-grant university.',
    tags: ['public', 'research', 'california', 'uc-system', 'land-grant']
  },
  {
    name: 'Massachusetts Institute of Technology',
    type: 'private',
    location: {
      city: 'Cambridge',
      state: 'Massachusetts',
      country: 'United States',
      zipCode: '02139',
      address: '77 Massachusetts Avenue',
      coordinates: [-71.0942, 42.3601] // [longitude, latitude]
    },
    contact: {
      phone: '+1-617-253-1000',
      email: 'info@mit.edu',
      website: 'https://www.mit.edu'
    },
    enrollment: {
      undergraduate: 4657,
      graduate: 7239
    },
    founded: 1861,
    accreditation: {
      status: 'accredited',
      agencies: [
        {
          name: 'New England Commission of Higher Education',
          type: 'regional',
          validUntil: new Date('2025-12-31T00:00:00.000Z')
        }
      ]
    },
    rankings: {
      national: { rank: 2, source: 'US News', year: 2024 },
      global: { rank: 1, source: 'QS World Rankings', year: 2024 }
    },
    tuition: {
      inState: { undergraduate: 57986, graduate: 57986 },
      outOfState: { undergraduate: 57986, graduate: 57986 },
      international: { undergraduate: 57986, graduate: 57986 },
      academicYear: '2023-2024'
    },
    programs: [
      { name: 'Computer Science and Engineering', level: 'bachelor', department: 'EECS', duration: '4 years', credits: 180 },
      { name: 'Electrical Engineering', level: 'master', department: 'EECS', duration: '2 years', credits: 66 },
      { name: 'Management', level: 'master', department: 'Sloan School', duration: '2 years', credits: 60 }
    ],
    facilities: {
      libraries: 5,
      laboratories: 200,
      dormitories: 11,
      sportsComplexes: 2,
      researchCenters: 50
    },
    demographics: {
      studentToFacultyRatio: '3:1',
      internationalStudentPercentage: 33.8,
      graduationRate: 96.1,
      employmentRate: 95.5
    },
    description: 'The Massachusetts Institute of Technology is a private land-grant research university in Cambridge, Massachusetts. Established in 1861, MIT has since then been at the forefront of the development of modern technology and science.',
    tags: ['technology', 'engineering', 'research', 'private', 'massachusetts']
  }
];

class DatabaseSeeder {
  constructor() {
    this.db = database;
  }

  async seed() {
    try {
      logger.info('Starting database seeding...');
      
      // Connect to database
      await this.db.connect();
      
      // Clear existing data
      await this.clearDatabase();
      
      // Seed users
      const users = await this.seedUsers();
      logger.info(`Seeded ${users.length} users`);
      
      // Seed universities (using admin user as creator)
      const adminUser = users.find(user => user.role === 'admin');
      const universities = await this.seedUniversities(adminUser._id);
      logger.info(`Seeded ${universities.length} universities`);
      
      logger.info('Database seeding completed successfully!');
      
      // Display summary
      this.displaySummary(users, universities);
      
    } catch (error) {
      logger.error('Database seeding failed:', error);
      throw error;
    } finally {
      await this.db.disconnect();
    }
  }

  async clearDatabase() {
    logger.info('Clearing existing data...');
    
    await User.deleteMany({});
    await University.deleteMany({});
    
    logger.info('Database cleared');
  }

  async seedUsers() {
    logger.info('Seeding users...');
    
    const users = [];
    
    for (const userData of seedUsers) {
      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        isActive: true,
        lastLogin: null
      });
      
      await user.save();
      users.push(user);
      
      logger.info(`Created user: ${user.email} (${user.role})`);
    }
    
    return users;
  }

  async seedUniversities(createdBy) {
    logger.info('Seeding universities...');
    
    const universities = [];
    
    for (const universityData of seedUniversities) {
      const university = new University({
        ...universityData,
        createdBy,
        status: 'active'
      });
      
      await university.save();
      universities.push(university);
      
      logger.info(`Created university: ${university.name}`);
    }
    
    return universities;
  }

  displaySummary(users, universities) {
    console.log('\n========================================');
    console.log('         SEEDING SUMMARY');
    console.log('========================================');
    console.log(`Users created: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
    console.log(`\nUniversities created: ${universities.length}`);
    universities.forEach(university => {
      console.log(`  - ${university.name} (${university.type})`);
    });
    
    console.log('\n========================================');
    console.log('Login Credentials:');
    console.log('Admin: admin@university.com / Admin123!');
    console.log('Viewer: viewer@university.com / Viewer123!');
    console.log('========================================\n');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  const seeder = new DatabaseSeeder();
  seeder.seed()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = DatabaseSeeder;