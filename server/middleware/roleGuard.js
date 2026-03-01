const roleGuard = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ error: 'Access denied: User role not found' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: `Access denied: Requires one of [${allowedRoles.join(', ')}]` });
        }

        next();
    };
};

module.exports = roleGuard;
