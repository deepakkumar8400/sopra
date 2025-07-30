const express = require('express');
const router = express.Router();
const multer = require('multer'); // npm install multer
const path = require('path');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/kyc/'); // Files will be saved in 'uploads/kyc' folder
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// Filter for image and PDF files
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPEG, PNG, or PDF is allowed!'), false);
    }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// @route   POST /api/upload/kyc
// @desc    Upload KYC documents
// @access  Private
router.post('/kyc', protect, upload.array('kycDocuments', 5), async (req, res) => { // 'kycDocuments' is the field name, max 5 files
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const uploadedDocs = req.files.map(file => ({
            fileName: file.filename,
            filePath: `/uploads/kyc/${file.filename}` // Store path for retrieval
        }));

        user.kycDocuments.push(...uploadedDocs);
        user.kycStatus = 'pending'; // Set KYC status to pending review
        await user.save();

        res.status(200).json({ message: 'KYC documents uploaded successfully, awaiting review.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message || 'Server Error');
    }
});

module.exports = router;