import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/userModel.js';

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await connectDB();

    const email = 'aryan.admin@example.com';
    const adminExists = await User.findOne({ email });
    
    if (adminExists) {
      console.log(`User (${email}) already exists. Upgrading to Super Admin...`);
      adminExists.isAdmin = true;
      adminExists.role = 'super-admin';
      adminExists.password = 'adminpassword123'; // Resets the password just in case
      await adminExists.save();
      
      console.log('\n✅ Account successfully upgraded to Super Admin!');
      console.log(`📧 Login Email: ${email}`);
      console.log(`🔑 Login Password: Aryan@1\n`);
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'Aryan Admin',
      email,
      password: 'Aryan@1', // Your userModel will automatically hash this upon saving!
      isAdmin: true,
      role: 'super-admin',
      isEmailVerified: true
    });

    console.log('\n✅ Super Admin created successfully!');
    console.log(`📧 Login Email: ${adminUser.email}`);
    console.log(`🔑 Login Password: adminpassword123\n`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error creating admin: ${error.message}`);
    process.exit(1);
  }
};

createSuperAdmin();