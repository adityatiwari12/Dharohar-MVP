const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.status(200).json(result);
    } catch (error) {
        // If invalid credentials, make sure it's 401
        if (error.message === 'Invalid credentials') {
            res.status(401);
        }
        next(error);
    }
};

module.exports = { register, login };
