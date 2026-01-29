const Assignment = require('../models/Assignment');
const Feedback = require('../models/Feedback');
const FeedbackReply = require('../models/FeedbackReply');
const User = require('../models/User');

class StudentController {
    // Dashboard
    static async dashboard(req, res) {
        try {
            const studentId = req.userId;

            // Get assigned staff
            const assignment = await Assignment.getByStudentId(studentId);

            // Get feedback statistics
            const feedbackStats = await Feedback.getStatsByStudentId(studentId);

            // Get recent feedback
            const allFeedback = await Feedback.getByStudentId(studentId);
            const recentFeedback = allFeedback.slice(0, 5);

            res.render('student/dashboard', {
                title: 'Student Dashboard',
                assignedStaff: assignment || null,
                feedbackStats,
                recentFeedback,
                canSubmit: assignment !== null && assignment !== undefined
            });
        } catch (error) {
            console.error('Student dashboard error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load dashboard'
            });
        }
    }

    // Submit feedback form (GET)
    static async submitFeedbackForm(req, res) {
        try {
            const studentId = req.userId;

            // Get assigned staff
            const assignment = await Assignment.getByStudentId(studentId);

            if (!assignment) {
                return res.render('error', {
                    title: 'No Staff Assigned',
                    message: 'You have not been assigned to any staff member yet. Please contact the administrator.'
                });
            }

            res.render('student/submit-feedback', {
                title: 'Submit Feedback',
                assignedStaff: assignment
            });
        } catch (error) {
            console.error('Student submit form error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback form'
            });
        }
    }

    // Submit feedback (POST)
    static async submitFeedback(req, res) {
        try {
            const studentId = req.userId;
            const { subject, message } = req.body;

            // Validate input
            if (!subject || !message) {
                return res.status(400).json({
                    success: false,
                    message: 'Subject and message are required'
                });
            }

            if (subject.trim() === '' || message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Subject and message cannot be empty'
                });
            }

            // Get assigned staff
            const assignment = await Assignment.getByStudentId(studentId);

            if (!assignment) {
                return res.status(400).json({
                    success: false,
                    message: 'You are not assigned to any staff member'
                });
            }

            // Create feedback
            const feedbackId = await Feedback.create({
                student_id: studentId,
                staff_id: assignment.staff_id,
                subject: subject.trim(),
                message: message.trim()
            });

            res.json({
                success: true,
                message: 'Feedback submitted successfully',
                feedbackId
            });
        } catch (error) {
            console.error('Student submit feedback error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to submit feedback'
            });
        }
    }

    // View feedback list
    static async feedbackList(req, res) {
        try {
            const studentId = req.userId;
            const filter = req.query.filter || 'all'; // all, pending, replied

            let feedback = await Feedback.getByStudentId(studentId);

            // Apply filter
            if (filter === 'pending') {
                feedback = feedback.filter(f => f.status === 'pending');
            } else if (filter === 'replied') {
                feedback = feedback.filter(f => f.status === 'replied');
            }

            res.render('student/feedback-list', {
                title: 'My Feedback',
                feedback,
                filter
            });
        } catch (error) {
            console.error('Student feedback list error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback'
            });
        }
    }

    // View feedback detail
    static async feedbackDetail(req, res) {
        try {
            const studentId = req.userId;
            const feedbackId = req.params.id;

            // Get feedback
            const feedback = await Feedback.getById(feedbackId);

            if (!feedback) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Feedback not found'
                });
            }

            // Check if student can view this feedback
            if (feedback.student_id != studentId) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You do not have permission to view this feedback'
                });
            }

            // Get replies
            const replies = await FeedbackReply.getByFeedbackId(feedbackId);

            res.render('student/feedback-detail', {
                title: 'Feedback Detail',
                feedback,
                replies
            });
        } catch (error) {
            console.error('Student feedback detail error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback details'
            });
        }
    }
}

module.exports = StudentController;
