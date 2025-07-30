require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS

// Define Routes (we'll create these later)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes')); // For admin functionalities

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));