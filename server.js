const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'feedback-system-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make session data available to all views
app.use((req, res, next) => {
    res.locals.userRole = req.session.userRole || null;
    res.locals.userId = req.session.userId || null;
    res.locals.userName = req.session.userName || null;
    res.locals.userEmail = req.session.userEmail || null;
    next();
});

// Import routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const staffRoutes = require('./routes/staff');
const studentRoutes = require('./routes/student');

// Use routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/staff', staffRoutes);
app.use('/student', studentRoutes);

// 404 Error handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: 'Page Not Found',
        message: 'The page you are looking for does not exist',
        role: req.session.userRole
    });
});

// General error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('error', {
        title: 'Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        role: req.session.userRole
    });
});

// Start server
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();

        if (!dbConnected) {
            console.error('❌ Failed to connect to database. Please check your configuration.');
            process.exit(1);
        }

        // Start listening
        app.listen(PORT, () => {
            console.log('');
            console.log('='.repeat(60));
            console.log('  🎓 Student Feedback Management System');
            console.log('='.repeat(60));
            console.log('');
            console.log(`  ✅ Server running on: http://localhost:${PORT}`);
            console.log(`  ✅ Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`  ✅ Database: ${process.env.DB_NAME}`);
            console.log('');
            console.log('  📱 Access the application:');
            console.log(`     → http://localhost:${PORT}`);
            console.log('');
            console.log('  Press Ctrl+C to stop the server');
            console.log('');
            console.log('='.repeat(60));
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\n👋 SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT signal received: closing HTTP server');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app;
