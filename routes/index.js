const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Landing page - Role selection
router.get('/', (req, res) => {
    res.render('index', {
        title: 'Student Feedback Management System'
    });
});

// Login with email and password
router.post('/login', async (req, res) => {
    try {
        let { email, password, role } = req.body;
        if (email) email = email.trim();
        if (password) password = password.trim();

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and role are required'
            });
        }

        // Validate role
        if (!['super_admin', 'staff', 'student'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role selected'
            });
        }

        // Match user by email first
        const user = await User.getByEmail(email);

        if (!user) {
            console.log(`Login failed: Email '${email}' not found.`);
            return res.status(401).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Check if user role matches selected role
        if (user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `This account is registered as ${user.role}, but you selected ${role}`
            });
        }

        // Check if user is active
        if (!user.is_active) {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive. Please contact administrator.'
            });
        }

        // Store in session
        req.session.userRole = user.role;
        req.session.userId = user.id;
        req.session.userName = user.name;
        req.session.userEmail = user.email;

        // Redirect based on role
        let redirectUrl;
        switch (user.role) {
            case 'super_admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'staff':
                redirectUrl = '/staff/dashboard';
                break;
            case 'student':
                redirectUrl = '/student/dashboard';
                break;
            default:
                redirectUrl = '/';
        }

        res.json({
            success: true,
            message: 'Login successful',
            redirectUrl
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
});

// Get users by role (for role selection dropdown)
router.get('/api/users/:role', async (req, res) => {
    try {
        const role = req.params.role;

        if (!['super_admin', 'staff', 'student'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role'
            });
        }

        const users = await User.getActiveByRole(role);

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;
