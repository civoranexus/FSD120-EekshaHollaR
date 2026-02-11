const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const tempSecret = 'temp_secret_key_123'; // Fallback if env var is missing, for dev only

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

const comparePassword = async (enteredPassword, storedPassword) => {
    return await bcrypt.compare(enteredPassword, storedPassword);
};

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || tempSecret, {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

module.exports = {
    hashPassword,
    comparePassword,
    generateToken,
};
