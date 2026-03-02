require('dotenv').config();
const { connectDB } = require('./config/db');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and Start Server
connectDB().then(() => {
    app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
}).catch(err => {
    logger.error('Failed to start server due to connection error');
    process.exit(1);
});
