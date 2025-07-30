const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isFrozen: { type: Boolean, default: false }, // For admin to freeze accounts
    kycStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    kycDocuments: [{
        fileName: String,
        filePath: String,
        uploadedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);