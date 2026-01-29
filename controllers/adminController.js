const User = require('../models/User');
const Assignment = require('../models/Assignment');
const Feedback = require('../models/Feedback');

class AdminController {
    // Dashboard
    static async dashboard(req, res) {
        try {
            const userStats = await User.getStats();
            const feedbackStats = await Feedback.getStats();
            const assignmentStats = await Assignment.getStats();
            const recentFeedback = await Feedback.getRecent(5);

            res.render('admin/dashboard', {
                title: 'Admin Dashboard',
                userStats,
                feedbackStats,
                assignmentStats,
                recentFeedback
            });
        } catch (error) {
            console.error('Dashboard error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load dashboard'
            });
        }
    }

    // Staff Management - List
    static async staffList(req, res) {
        try {
            const staff = await User.getByRole('staff');
            const assignmentCounts = await Assignment.getStaffAssignmentCounts();

            // Merge assignment counts with staff data
            const staffWithCounts = staff.map(s => {
                const count = assignmentCounts.find(ac => ac.id === s.id);
                return {
                    ...s,
                    student_count: count ? count.student_count : 0
                };
            });

            res.render('admin/staff-list', {
                title: 'Staff Management',
                staff: staffWithCounts
            });
        } catch (error) {
            console.error('Staff list error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load staff list'
            });
        }
    }

    // Staff Management - Add (GET)
    static async staffAddForm(req, res) {
        res.render('admin/staff-form', {
            title: 'Add Staff',
            staff: null,
            action: 'add'
        });
    }

    // Staff Management - Add (POST)
    static async staffAdd(req, res) {
        try {
            let { name, email, password } = req.body;
            name = name ? name.trim() : '';
            email = email ? email.trim() : '';
            password = password ? password.trim() : '';

            // Validate input
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }

            // Check if email exists
            const emailExists = await User.emailExists(email);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Create staff
            const staffId = await User.create({ name, email, role: 'staff', password });

            res.json({
                success: true,
                message: 'Staff member added successfully',
                staffId
            });
        } catch (error) {
            console.error('Staff add error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add staff'
            });
        }
    }

    // Staff Management - Edit (GET)
    static async staffEditForm(req, res) {
        try {
            const staff = await User.getById(req.params.id);

            if (!staff || staff.role !== 'staff') {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Staff member not found'
                });
            }

            res.render('admin/staff-form', {
                title: 'Edit Staff',
                staff,
                action: 'edit'
            });
        } catch (error) {
            console.error('Staff edit form error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load staff details'
            });
        }
    }

    // Staff Management - Edit (POST)
    static async staffEdit(req, res) {
        try {
            let { name, email } = req.body;
            name = name ? name.trim() : '';
            email = email ? email.trim() : '';
            const staffId = req.params.id;

            // Validate input
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required'
                });
            }

            // Check if email exists (excluding current staff)
            const emailExists = await User.emailExists(email, staffId);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Update staff
            await User.update(staffId, { name, email });

            res.json({
                success: true,
                message: 'Staff updated successfully'
            });
        } catch (error) {
            console.error('Staff edit error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update staff'
            });
        }
    }

    // Staff Management - Toggle Active
    static async staffToggleActive(req, res) {
        try {
            await User.toggleActive(req.params.id);
            res.json({
                success: true,
                message: 'Staff status updated'
            });
        } catch (error) {
            console.error('Staff toggle error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update status'
            });
        }
    }

    // Student Management - List
    static async studentList(req, res) {
        try {
            const students = await User.getByRole('student');

            // Get assignment info for each student
            const studentsWithAssignments = await Promise.all(
                students.map(async (student) => {
                    const assignment = await Assignment.getByStudentId(student.id);
                    return {
                        ...student,
                        assigned_staff: assignment ? assignment.staff_name : null,
                        staff_id: assignment ? assignment.staff_id : null
                    };
                })
            );

            res.render('admin/student-list', {
                title: 'Student Management',
                students: studentsWithAssignments
            });
        } catch (error) {
            console.error('Student list error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load student list'
            });
        }
    }

    // Student Management - Add (GET)
    static async studentAddForm(req, res) {
        res.render('admin/student-form', {
            title: 'Add Student',
            student: null,
            action: 'add'
        });
    }

    // Student Management - Add (POST)
    static async studentAdd(req, res) {
        try {
            let { name, email, password } = req.body;
            name = name ? name.trim() : '';
            email = email ? email.trim() : '';
            password = password ? password.trim() : '';

            // Validate input
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Name, email, and password are required'
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters'
                });
            }

            // Check if email exists
            const emailExists = await User.emailExists(email);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Create student
            const studentId = await User.create({ name, email, role: 'student', password });

            res.json({
                success: true,
                message: 'Student added successfully',
                studentId
            });
        } catch (error) {
            console.error('Student add error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to add student'
            });
        }
    }

    // Student Management - Edit (GET)
    static async studentEditForm(req, res) {
        try {
            const student = await User.getById(req.params.id);

            if (!student || student.role !== 'student') {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Student not found'
                });
            }

            res.render('admin/student-form', {
                title: 'Edit Student',
                student,
                action: 'edit'
            });
        } catch (error) {
            console.error('Student edit form error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load student details'
            });
        }
    }

    // Student Management - Edit (POST)
    static async studentEdit(req, res) {
        try {
            let { name, email } = req.body;
            name = name ? name.trim() : '';
            email = email ? email.trim() : '';
            const studentId = req.params.id;

            // Validate input
            if (!name || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and email are required'
                });
            }

            // Check if email exists (excluding current student)
            const emailExists = await User.emailExists(email, studentId);
            if (emailExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Update student
            await User.update(studentId, { name, email });

            res.json({
                success: true,
                message: 'Student updated successfully'
            });
        } catch (error) {
            console.error('Student edit error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update student'
            });
        }
    }

    // Student Management - Toggle Active
    static async studentToggleActive(req, res) {
        try {
            await User.toggleActive(req.params.id);
            res.json({
                success: true,
                message: 'Student status updated'
            });
        } catch (error) {
            console.error('Student toggle error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update status'
            });
        }
    }

    // Assignment Management
    static async assignments(req, res) {
        try {
            const staff = await User.getActiveByRole('staff');
            const students = await User.getActiveByRole('student');
            const assignments = await Assignment.getAll();
            const unassignedStudents = await Assignment.getUnassignedStudents();

            res.render('admin/assignments', {
                title: 'Assignment Management',
                staff,
                students,
                assignments,
                unassignedStudents
            });
        } catch (error) {
            console.error('Assignments error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load assignments'
            });
        }
    }

    // Assignment - Create
    static async assignmentCreate(req, res) {
        try {
            let { staff_id, student_ids } = req.body;

            // Ensure student_ids is an array
            if (student_ids && !Array.isArray(student_ids)) {
                student_ids = [student_ids];
            }

            if (!staff_id || !student_ids || student_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff and at least one student are required'
                });
            }

            // Create assignments
            const count = await Assignment.createBulk(staff_id, student_ids);

            res.json({
                success: true,
                message: `${count} student(s) assigned successfully`
            });
        } catch (error) {
            console.error('Assignment create error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create assignment'
            });
        }
    }

    // Assignment - Delete
    static async assignmentDelete(req, res) {
        try {
            await Assignment.delete(req.params.id);
            res.json({
                success: true,
                message: 'Assignment removed successfully'
            });
        } catch (error) {
            console.error('Assignment delete error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove assignment'
            });
        }
    }

    // Feedback Overview
    static async feedbackOverview(req, res) {
        try {
            const allFeedback = await Feedback.getAll();
            const stats = await Feedback.getStats();

            res.render('admin/feedback-overview', {
                title: 'Feedback Overview',
                feedback: allFeedback,
                stats
            });
        } catch (error) {
            console.error('Feedback overview error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback'
            });
        }
    }

    // Feedback Detail
    static async feedbackDetail(req, res) {
        try {
            const FeedbackReply = require('../models/FeedbackReply');
            const feedback = await Feedback.getById(req.params.id);

            if (!feedback) {
                return res.status(404).render('error', {
                    title: 'Not Found',
                    message: 'Feedback not found'
                });
            }

            const replies = await FeedbackReply.getByFeedbackId(feedback.id);

            res.render('admin/feedback-detail', {
                title: 'Feedback Detail',
                feedback,
                replies
            });
        } catch (error) {
            console.error('Feedback detail error:', error);
            res.status(500).render('error', {
                title: 'Error',
                message: 'Failed to load feedback details'
            });
        }
    }
}

module.exports = AdminController;
