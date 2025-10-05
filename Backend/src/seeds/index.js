const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const database = require('../config/database');
const User = require('../models/User');
const University = require('../models/University');
const logger = require('../config/logger');

// Sample data
const seedUsers = [];

const seedUniversities = [];

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
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`  - ${user.email} (${user.role})`);
      });
    } else {
      console.log('  - No users seeded');
    }
    
    console.log(`\nUniversities created: ${universities.length}`);
    if (universities.length > 0) {
      universities.forEach(university => {
        console.log(`  - ${university.name} (${university.type})`);
      });
    } else {
      console.log('  - No universities seeded');
    }
    
    console.log('\n========================================');
    if (users.length > 0) {
      console.log('Login Credentials:');
      console.log('Admin: admin@university.com / Admin123!');
      console.log('Viewer: viewer@university.com / Viewer123!');
    } else {
      console.log('No sample credentials available.');
      console.log('Create users through the signup page.');
    }
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