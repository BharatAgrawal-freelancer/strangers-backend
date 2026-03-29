import mongoose from "mongoose"
import dotenv from "dotenv";
dotenv.config();
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    })
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`)
    return conn
  } catch (error) {
    console.error(`[DB] Connection failed: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB
