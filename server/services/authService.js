const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Assuming bcryptjs is used
const jwt = require('jsonwebtoken');

const register = async (userData) => {
    // Check if user exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    const user = new User({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        communityName: userData.communityName
    });

    await user.save();
    return { id: user._id, email: user.email, role: user.role };
};

const login = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { id: user._id, role: user.role, communityName: user.communityName },
        process.env.JWT_SECRET || 'fallback_secret_key',
        { expiresIn: '1d' }
    );

    return { token, user: { id: user._id, role: user.role, name: user.name } };
};

module.exports = { register, login };
