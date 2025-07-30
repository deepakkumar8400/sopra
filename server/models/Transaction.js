const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderAccount: { type: String, required: true },
    receiverAccount: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['credit', 'debit', 'transfer'], required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
    transactionDate: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);