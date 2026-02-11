const User = require('../models/userModel');
const { hashPassword, comparePassword, generateToken } = require('../utils/security');
const { validationResult } = require('express-validator');
const { logAudit, AUDIT_ACTIONS } = require('../utils/auditLogger');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (for now, or Admin only later)
const registerUser = async (req, res) => {
    // Input validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, first_name, last_name, email, password, role, phone_number } = req.body;

    try {
        // Check if user exists
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user - allow either full_name or first+last
        const newUser = await User.create({
            full_name,
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role, // Optional: name of role, will be resolved to role_id
            phone_number
        });

        if (newUser) {
            // Fetch units for the new user
            const units = await Unit.findUnitsByUser(newUser.id);

            // Log audit
            await logAudit(newUser.id, AUDIT_ACTIONS.USER_CREATED, 'users', newUser.id, { email: newUser.email }, req);

            res.status(201).json({
                success: true,
                token: generateToken(newUser.id, newUser.role),
                user: {
                    id: newUser.id,
                    full_name: newUser.full_name,
                    first_name: newUser.first_name,
                    last_name: newUser.last_name,
                    email: newUser.email,
                    role: newUser.role,
                    phone_number: newUser.phone_number,
                    created_at: newUser.created_at,
                    units
                },
                message: 'Registration successful'
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await User.findByEmail(email);

        if (user && (await comparePassword(password, user.password_hash))) {
            const token = generateToken(user.id, user.role);

            // Fetch units for the user
            const units = await Unit.findUnitsByUser(user.id);

            // Log audit
            await logAudit(user.id, AUDIT_ACTIONS.USER_LOGIN, 'users', user.id, { email: user.email }, req);

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    phone_number: user.phone_number,
                    created_at: user.created_at,
                    units
                },
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const Unit = require('../models/unitModel');

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    console.log(`[getMe] Fetching profile for user: ${req.user?.id}`);
    if (req.user) {
        try {
            const units = await Unit.findUnitsByUser(req.user.id);
            console.log(`[getMe] Found ${units?.length || 0} units for user`);

            const userResponse = {
                success: true,
                user: {
                    ...req.user,
                    units
                }
            };
            res.json(userResponse);
        } catch (error) {
            console.error('[getMe] Error fetching user units:', error);
            res.status(500).json({ success: false, message: 'Server error fetching user details' });
        }
    } else {
        console.warn('[getMe] No user found in request');
        res.status(404).json({ success: false, message: 'User not found' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getMe,
};
