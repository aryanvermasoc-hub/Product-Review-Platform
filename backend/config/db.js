import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Attempt to connect using the URI from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure if it cannot connect
    process.exit(1); 
  }
};

export default connectDB;