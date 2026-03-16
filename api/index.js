const mongoose = require('mongoose');
const app = require('../backend/src/app');
require('dotenv').config();

let isConnected = false;

/**
 * Ensures MongoDB is connected before handling the request.
 * Useful for serverless functions where connections may be reused.
 */
const connectDB = async () => {
    if (isConnected || mongoose.connection.readyState === 1) {
        return;
    }

    try {
        if (!process.env.MONGODB_URI) {
            console.error('--- ⚠️ Warning: MONGODB_URI is not defined in environment variables ---');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        isConnected = true;
        console.log('--- 🍃 MongoDB Atlas Connected Successfully ---');
    } catch (error) {
        console.error('--- ❌ MongoDB Connection Error:', error.message);
        // We don't exit process in serverless, just throw error to return 500
        throw error;
    }
};

/**
 * Vercel Entry Point
 */
module.exports = async (req, res) => {
    try {
        await connectDB();
        // Forward the request to our Express app
        return app(req, res);
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Database Connection Failed'
        });
    }
};
