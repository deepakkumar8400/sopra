const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/users/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.deleteOne(); // Use deleteOne()
        await Account.deleteOne({ userId: req.params.id }); // Also delete associated account
        await Transaction.deleteMany({ $or: [{ sender: req.params.id }, { receiver: req.params.id }] }); // Delete related transactions
        res.json({ message: 'User and associated data removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/admin/accounts/freeze/:id
// @desc    Freeze/Unfreeze an account (Admin only)
// @access  Private (Admin)
router.put('/accounts/freeze/:id', protect, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isFrozen = !user.isFrozen; // Toggle freeze status
        await user.save();
        res.json({ message: `User account ${user.username} is now ${user.isFrozen ? 'frozen' : 'unfrozen'}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/admin/kyc-approve/:id
// @desc    Approve/Reject KYC (Admin only)
// @access  Private (Admin)
router.post('/kyc-status/:id', protect, authorizeRoles('admin'), async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid KYC status' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.kycStatus = status;
        await user.save();

        res.json({ message: `User ${user.username} KYC status updated to ${status}` });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


module.exports = router;