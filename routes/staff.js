const express = require('express');
const router = express.Router();
const { requireStaff } = require('../middleware/roleCheck');
const StaffController = require('../controllers/staffController');

// Apply staff middleware to all routes
router.use(requireStaff);

// Dashboard
router.get('/dashboard', StaffController.dashboard);

// Students
router.get('/students', StaffController.students);

// Feedback
router.get('/feedback', StaffController.feedbackInbox);
router.get('/feedback/:id', StaffController.feedbackDetail);
router.post('/feedback/:id/reply', StaffController.feedbackReply);

module.exports = router;
