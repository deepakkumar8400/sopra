const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/accounts/balance
// @desc    Get account balance for logged in user
// @access  Private
router.get('/balance', protect, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.user.id });
        if (!account) {
            return res.status(404).json({ message: 'Account not found for this user' });
        }
        res.json({ balance: account.balance, accountNumber: account.accountNumber, currency: account.currency });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/accounts/:accountNumber
// @desc    Get account details by account number (for transfers, potentially admin)
// @access  Private
router.get('/:accountNumber', protect, async (req, res) => {
    try {
        const account = await Account.findOne({ accountNumber: req.params.accountNumber }).select('accountNumber userId'); // Only return necessary info
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json(account);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;