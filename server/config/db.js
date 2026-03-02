const mongoose = require('mongoose');
const logger = require('../utils/logger');

let gfs;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Mongoose 6+ options are handled automatically
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        // Initialize GridFS bucket
        const db = conn.connection.db;
        gfs = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads'
        });

        logger.info('GridFS Bucket initialized');

        return conn;
    } catch (error) {
        logger.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

const getGFS = () => {
    if (!gfs) {
        throw new Error('GridFS not initialized. Call connectDB first.');
    }
    return gfs;
};

module.exports = { connectDB, getGFS };
