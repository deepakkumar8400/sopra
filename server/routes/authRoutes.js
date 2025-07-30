const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Account = require('../models/Account'); // To create account on registration
const { protect } = require('../middleware/authMiddleware');

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// @route   POST /api/auth/register
// @desc    Register user & get token
// @access  Public
// server/routes/authRoutes.js (ONLY update the /register route)

// ... (existing imports and generateToken function) ...

// @route   POST /api/auth/register
// @desc    Register user & get token
// @access  Public
router.post('/register', [
    body('username', 'Username is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(error => error.msg).join(', ') }); // Join multiple validation errors
    }

    const { username, email, password } = req.body;

    try {
        // --- UPDATED DUPLICATE CHECK ---
        let userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        // --- END UPDATED DUPLICATE CHECK ---

        const user = new User({ username, email, password });
        await user.save();

        // Create a default account for the new user
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Simple auto-generation
        const account = new Account({
            userId: user._id,
            accountNumber,
            accountType: 'savings',
            balance: 0
        });
        await account.save();

        const token = generateToken(user._id);
        res.status(201).json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });

    } catch (err) {
        console.error(err.message);
        // This catch block is mostly for unexpected server errors or MongoDB connection issues
        // The duplicate key errors will now be caught by the findOne checks above for specific messages.
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        if (user.isFrozen) {
            return res.status(403).json({ message: 'Your account has been frozen. Please contact support.' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);
        res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const account = await Account.findOne({ userId: req.user.id });
        if (!user || !account) {
            return res.status(404).json({ message: 'User or account not found' });
        }
        res.json({ user, account });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;