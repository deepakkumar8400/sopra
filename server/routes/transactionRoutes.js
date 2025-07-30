const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');
const sendEmail = require('../utils/sendEmail'); // Ensure this utility is correctly implemented
const User = require('../models/User'); // Import User model

// @route   POST /api/transactions/transfer
// @desc    Transfer funds between accounts
// @access  Private
router.post('/transfer', protect, async (req, res) => {
    const { receiverAccountNumber, amount, description } = req.body;

    if (amount <= 0) {
        return res.status(400).json({ message: 'Transfer amount must be positive' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const senderAccount = await Account.findOne({ userId: req.user.id }).session(session);
        if (!senderAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Sender account not found' });
        }

        if (senderAccount.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const receiverAccount = await Account.findOne({ accountNumber: receiverAccountNumber }).session(session);
        if (!receiverAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: 'Receiver account not found' });
        }

        if (senderAccount.accountNumber === receiverAccount.accountNumber) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'Cannot transfer to the same account' });
        }

        // Apply transaction limit (example: 10,000 per day)
        // This would require fetching daily transaction sum for the user.
        // For simplicity, we'll skip the full implementation here, but you'd:
        // 1. Get all transactions for req.user.id for the current day.
        // 2. Sum up their amounts.
        // 3. Check if current transfer + sum exceeds limit.

        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        await senderAccount.save({ session });
        await receiverAccount.save({ session });

        const transaction = new Transaction({
            sender: req.user.id,
            receiver: receiverAccount.userId,
            senderAccount: senderAccount.accountNumber,
            receiverAccount: receiverAccount.accountNumber,
            amount,
            type: 'transfer',
            description,
            status: 'completed'
        });
        await transaction.save({ session });

        await session.commitTransaction();
        session.endSession();

        // --- Email Notification Logic (Moved inside the try block after successful transaction) ---
        const senderUser = await User.findById(req.user.id);
        const receiverUser = await User.findById(receiverAccount.userId);

        if (senderUser && sendEmail) { // Check if sendEmail utility is available
            await sendEmail({
                email: senderUser.email,
                subject: 'Funds Transfer Alert - Debit',
                message: `Dear ${senderUser.username},<br><br>
                          ₹${amount.toFixed(2)} has been debited from your account (${senderAccount.accountNumber}) for a transfer to ${receiverAccount.accountNumber}.<br>
                          Your new balance is ₹${senderAccount.balance.toFixed(2)}.<br><br>
                          Description: ${description || 'N/A'}<br>
                          Transaction ID: ${transaction._id}<br><br>
                          Thank you for banking with us.`,
            }).catch(emailErr => console.error("Error sending sender email:", emailErr)); // Catch email errors without failing transaction
        }

        if (receiverUser && sendEmail) {
            await sendEmail({
                email: receiverUser.email,
                subject: 'Funds Transfer Alert - Credit',
                message: `Dear ${receiverUser.username},<br><br>
                          ₹${amount.toFixed(2)} has been credited to your account (${receiverAccount.accountNumber}) from ${senderAccount.accountNumber}.<br>
                          Your new balance is ₹${receiverAccount.balance.toFixed(2)}.<br><br>
                          Description: ${description || 'N/A'}<br>
                          Transaction ID: ${transaction._id}<br><br>
                          Thank you for banking with us.`,
            }).catch(emailErr => console.error("Error sending receiver email:", emailErr)); // Catch email errors without failing transaction
        }
        // --- End Email Notification Logic ---

        res.status(200).json({ message: 'Transfer successful', newBalance: senderAccount.balance });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/transactions/history
// @desc    Get transaction history for logged in user
// @access  Private
router.get('/history', protect, async (req, res) => {
    const { page = 1, limit = 10, type, startDate, endDate } = req.query;

    const query = {
        $or: [{ sender: req.user.id }, { receiver: req.user.id }]
    };

    if (type) {
        query.type = type;
    }
    if (startDate && endDate) {
        query.transactionDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    } else if (startDate) {
        query.transactionDate = { $gte: new Date(startDate) };
    } else if (endDate) {
        query.transactionDate = { $lte: new Date(endDate) };
    }

    try {
        const transactions = await Transaction.find(query)
            .sort({ transactionDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalTransactions = await Transaction.countDocuments(query);

        res.json({
            transactions,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalTransactions / parseInt(limit)),
            totalTransactions
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/transactions/export-pdf
// @desc    Export transaction history as PDF
// @access  Private
router.get('/export-pdf', protect, async (req, res) => {
    // This is a complex feature. You'll need a library like `pdfkit` or `html-pdf`.
    // Here's a conceptual outline:

    // const PDFDocument = require('pdfkit'); // npm install pdfkit
    // const doc = new PDFDocument();
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename="transactions.pdf"');
    // doc.pipe(res);

    try {
        const transactions = await Transaction.find({ $or: [{ sender: req.user.id }, { receiver: req.user.id }] })
            .sort({ transactionDate: -1 });

        // Build PDF content based on 'transactions' data
        // For example:
        // doc.text('Bank Statement');
        // transactions.forEach(t => {
        //     doc.text(`Date: ${t.transactionDate.toDateString()}, Type: ${t.type}, Amount: ${t.amount}, Desc: ${t.description}`);
        // });
        // doc.end();

        // For now, sending a placeholder response. Implement actual PDF generation.
        res.status(200).json({ message: 'PDF export initiated (implementation pending)' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;