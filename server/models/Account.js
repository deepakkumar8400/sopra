const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: String, required: true, unique: true },
    accountType: { type: String, enum: ['savings', 'checking'], default: 'savings' },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }, // Or 'USD', 'EUR', etc.
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);