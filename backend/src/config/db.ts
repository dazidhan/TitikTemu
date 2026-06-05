import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/coworking_db';

  const connect = async () => {
    try {
      const conn = await mongoose.connect(MONGO_URI);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB Connection Error: ${(error as Error).message}`);
      console.log('⏳ Retrying in 5 seconds...');
      setTimeout(connect, 5000);
    }
  };

  await connect();
};
