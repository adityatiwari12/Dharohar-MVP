const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Use statusCode from the error object if set (custom service errors), then res.statusCode, then 500
    const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);

    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;
