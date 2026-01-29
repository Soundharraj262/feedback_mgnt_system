const Assignment = require('../models/Assignment');
const Feedback = require('../models/Feedback');
const FeedbackReply = require('../models/FeedbackReply');
const User = require('../models/User');

class StaffController {
    // Dashboard
    static async dashboard(req, res) {
        try {
            const staffId = req.userId;

            // Get assigned students
            const assignedStudents = await Assignment.getActiveStudentsByStaffId(staffId);

            // Get feedback statistics
            const feedbackStats = await Feedback.getStatsByStaffId(staffId);

            // Get recent feedback
            const recentFeedback = await Feedback.getByStaffId(staffId);
            const recent = recentFeedback.slice(0, 5);

            // Get pending feedback count
            const pendingFeedback = await Feedback.getPendingByStaffId(staffId);

            res.render('staff/dashboard', {
                title: 'Staff Dashboard',
                assignedStudentsCount: assignedStudents.length,
                feedbackStats,
                recentFeedback: recent,
                pendingCount: pendingFeedback.length
            });
        } catch (error) {
            console.error('Staff dashboard error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load dashboard'
            });
        }
    }

    // View assigned students
    static async students(req, res) {
        try {
            const staffId = req.userId;
            const students = await Assignment.getActiveStudentsByStaffId(staffId);

            // Get feedback count for each student
            const studentsWithFeedback = await Promise.all(
                students.map(async (student) => {
                    const feedbackList = await Feedback.getByStudentId(student.id);
                    const staffFeedback = feedbackList.filter(f => f.staff_id == staffId);
                    return {
                        ...student,
                        feedback_count: staffFeedback.length,
                        pending_count: staffFeedback.filter(f => f.status === 'pending').length
                    };
                })
            );

            res.render('staff/students', {
                title: 'My Students',
                students: studentsWithFeedback
            });
        } catch (error) {
            console.error('Staff students error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load students'
            });
        }
    }

    // Feedback inbox
    static async feedbackInbox(req, res) {
        try {
            const staffId = req.userId;
            const filter = req.query.filter || 'all'; // all, pending, replied
            const studentId = req.query.student;

            let feedback;
            if (filter === 'pending') {
                feedback = await Feedback.getPendingByStaffId(staffId);
            } else if (filter === 'replied') {
                feedback = await Feedback.getRepliedByStaffId(staffId);
            } else {
                feedback = await Feedback.getByStaffId(staffId);
            }

            let currentStudent = null;
            if (studentId) {
                // Filter by student
                feedback = feedback.filter(f => f.student_id == studentId);

                // Get student info
                if (studentId.trim() !== '') {
                    currentStudent = await User.getById(studentId);
                }
            }

            res.render('staff/feedback-inbox', {
                title: 'Feedback Inbox',
                feedback,
                filter,
                currentStudent,
                studentId
            });
        } catch (error) {
            console.error('Staff feedback inbox error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback'
            });
        }
    }

    // View feedback detail
    static async feedbackDetail(req, res) {
        try {
            const staffId = req.userId;
            const feedbackId = req.params.id;

            // Get feedback
            const feedback = await Feedback.getById(feedbackId);

            if (!feedback) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Feedback not found'
                });
            }

            // Check if staff can view this feedback
            if (feedback.staff_id != staffId) {
                return res.status(403).render('error', {
                    title: 'Access Denied',
                    message: 'You do not have permission to view this feedback'
                });
            }

            // Get replies
            const replies = await FeedbackReply.getByFeedbackId(feedbackId);

            res.render('staff/feedback-detail', {
                title: 'Feedback Detail',
                feedback,
                replies
            });
        } catch (error) {
            console.error('Staff feedback detail error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback details'
            });
        }
    }

    // Reply to feedback (POST)
    static async feedbackReply(req, res) {
        try {
            const staffId = req.userId;
            const feedbackId = req.params.id;
            const { reply_message } = req.body;

            // Validate input
            if (!reply_message || reply_message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Reply message is required'
                });
            }

            // Check if staff can reply to this feedback
            const canView = await Feedback.canStaffView(feedbackId, staffId);
            if (!canView) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to reply to this feedback'
                });
            }

            // Create reply
            await FeedbackReply.create({
                feedback_id: feedbackId,
                staff_id: staffId,
                reply_message: reply_message.trim()
            });

            res.json({
                success: true,
                message: 'Reply sent successfully'
            });
        } catch (error) {
            console.error('Staff feedback reply error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send reply'
            });
        }
    }
}

module.exports = StaffController;
