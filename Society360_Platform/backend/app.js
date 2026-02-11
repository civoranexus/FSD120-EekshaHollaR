const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Routes
const authRoutes = require('./routes/authRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const communicationRoutes = require('./routes/communicationRoutes');

const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const app = express();

// Security Middleware
app.use(helmet()); // Sets various security headers
app.use(hpp()); // Prevent HTTP Parameter Pollution attacks

// CORS configuration - be specific in production
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://society360-platform-5khg.vercel.app',
    'https://society360-platform-1.onrender.com',
    'https://society360-platform-5khg-6eiixzwu2-eekshahollars-projects.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'http://localhost:5173', // Vite default
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        } else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rate limiting to prevent brute-force/DDoS
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Very high limit for dev
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10kb' })); // Body parser with limit to prevent large payload attacks

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/communication', communicationRoutes);
app.use('/api/units', require('./routes/unitRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));


// Base route
app.get('/', (req, res) => {
    res.send('Society360 API is running...');
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server Error' });
});

module.exports = app;
