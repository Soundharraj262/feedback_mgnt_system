const express = require('express');
const router = express.Router();
const { requireStudent } = require('../middleware/roleCheck');
const StudentController = require('../controllers/studentController');

// Apply student middleware to all routes
router.use(requireStudent);

// Dashboard
router.get('/dashboard', StudentController.dashboard);

// Submit Feedback
router.get('/submit', StudentController.submitFeedbackForm);
router.post('/submit', StudentController.submitFeedback);

// Feedback List
router.get('/feedback', StudentController.feedbackList);
router.get('/feedback/:id', StudentController.feedbackDetail);

module.exports = router;
