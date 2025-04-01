// src/config/db.js
import mongoose from 'mongoose';
import config from './index.js';
const log = console;

class Database {
  constructor() {
    this.MONGO_URI = config.db.uri
    if (!this.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Log connection events
    mongoose.connection.on('connected', () => {
      log.info('MongoDB connected successfully');
    });
    mongoose.connection.on('error', (err) => {
      log.error('MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      log.info('MongoDB disconnected');
    });
  }

  async connect() {
    // If already connected, return the connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }
    try {
      await mongoose.connect(this.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      return mongoose.connection;
    } catch (error) {
      log.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      log.info('Database disconnected successfully');
    } catch (error) {
      log.error('Error disconnecting from database:', error);
      throw error;
    }
  }
}

export default new Database();
