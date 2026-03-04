const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
    // Log the error
    logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`, {
        stack: err.stack,
        user: req.user ? req.user.id : 'Guest'
    });

    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

    const response = {
        message: err.message || 'Internal Server Error',
        status: 'error'
    };

    if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
    }

    res.status(statusCode).json(response);
};

module.exports = errorHandler;
