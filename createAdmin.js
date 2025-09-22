import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js'; // Make sure the path is correct

// Load environment variables
dotenv.config();

// Get arguments from command line
const name = process.argv[2];
const email = process.argv[3];
const password = process.argv[4];

if (!name || !email || !password) {
  console.error('❌ Please provide name, email, and password.');
  console.log('Usage: node createAdmin.js "Your Name" "email@example.com" "yourpassword"');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email });
    if (adminExists) {
      console.error('❌ Error: An admin with this email already exists.');
      await mongoose.disconnect();
      return;
    }

    // Create new admin user
    const admin = new User({
      name,
      email,
      password, // The password will be automatically hashed by the pre-save hook in your User model
      role: 'admin', // Explicitly set the role
    });

    await admin.save();
    console.log('🎉 Admin user created successfully!');
    
  } catch (error) {
    console.error(`❌ Error creating admin: ${error.message}`);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('🔌 MongoDB Disconnected.');
  }
};

createAdmin();