const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const licenseRoutes = require('./routes/licenseRoutes');
const storageRoutes = require('./routes/storageRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging via Winston
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Routes
app.use('/auth', authRoutes);
app.use('/assets', assetRoutes);
app.use('/licenses', licenseRoutes);
app.use('/storage', storageRoutes);

// 404 Handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
