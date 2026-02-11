try {
    require('dotenv').config();
} catch (err) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('dotenv module not found, please run npm install');
    }
}


const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    console.error(err.stack);

    if (process.env.NODE_ENV !== 'development') {
        // Exit in production
        server.close(() => process.exit(1));
    }
});
