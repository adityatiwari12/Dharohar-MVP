const jwt = require('jsonwebtoken');
const roleGuard = require('./roleGuard');

const protect = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authorization token missing or invalid format' });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');

        // Attach user to request payload
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token verification failed or expired' });
    }
};

module.exports = { protect, roleGuard };
