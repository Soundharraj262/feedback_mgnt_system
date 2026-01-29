const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/roleCheck');
const AdminController = require('../controllers/adminController');

// Apply admin middleware to all routes
router.use(requireAdmin);

// Dashboard
router.get('/dashboard', AdminController.dashboard);

// Staff Management
router.get('/staff', AdminController.staffList);
router.get('/staff/add', AdminController.staffAddForm);
router.post('/staff/add', AdminController.staffAdd);
router.get('/staff/edit/:id', AdminController.staffEditForm);
router.post('/staff/edit/:id', AdminController.staffEdit);
router.post('/staff/toggle/:id', AdminController.staffToggleActive);

// Student Management
router.get('/students', AdminController.studentList);
router.get('/students/add', AdminController.studentAddForm);
router.post('/students/add', AdminController.studentAdd);
router.get('/students/edit/:id', AdminController.studentEditForm);
router.post('/students/edit/:id', AdminController.studentEdit);
router.post('/students/toggle/:id', AdminController.studentToggleActive);

// Assignment Management
router.get('/assignments', AdminController.assignments);
router.post('/assignments/create', AdminController.assignmentCreate);
router.post('/assignments/delete/:id', AdminController.assignmentDelete);

// Feedback Overview
router.get('/feedback', AdminController.feedbackOverview);
router.get('/feedback/:id', AdminController.feedbackDetail);

module.exports = router;
