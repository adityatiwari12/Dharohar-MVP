require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;

// Start Express server directly — no MongoDB connection needed.
// Database operations now go through AWS DynamoDB via dynamodb.config.js.
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    logger.info(`AWS Region: ${process.env.AWS_REGION || 'ap-south-1'}`);
    logger.info('Database: AWS DynamoDB');
    logger.info('Storage: AWS S3');
    logger.info('Auth: AWS Cognito');
});
