const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zwiggato');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@zwiggato.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@zwiggato.com');
      console.log('Password: password123');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@zwiggato.com',
      phone: '9999999999',
      password: 'password123',
      role: 'admin'
    });

    console.log('\n✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Credentials:');
    console.log('Email: admin@zwiggato.com');
    console.log('Password: password123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\nYou can now login with these credentials to access the admin panel.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdmin();

