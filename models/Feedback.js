const { pool } = require('../config/database');

class Feedback {
    // Get all feedback
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                student.email as student_email,
                staff.name as staff_name,
                staff.email as staff_email,
                (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id) as reply_count
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            JOIN users staff ON f.staff_id = staff.id
            ORDER BY f.submitted_at DESC
        `);
        return rows;
    }

    // Get feedback by ID with full details
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                student.email as student_email,
                staff.name as staff_name,
                staff.email as staff_email
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            JOIN users staff ON f.staff_id = staff.id
            WHERE f.id = ?
        `, [id]);
        return rows[0];
    }

    // Get feedback by student ID
    static async getByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                staff.name as staff_name,
                staff.email as staff_email,
                (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id) as reply_count
            FROM feedback f
            JOIN users staff ON f.staff_id = staff.id
            WHERE f.student_id = ?
            ORDER BY f.submitted_at DESC
        `, [studentId]);
        return rows;
    }

    // Get feedback by staff ID (from assigned students only)
    static async getByStaffId(staffId) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                student.email as student_email,
                (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id) as reply_count
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            WHERE f.staff_id = ?
            ORDER BY f.submitted_at DESC
        `, [staffId]);
        return rows;
    }

    // Get pending feedback by staff ID
    static async getPendingByStaffId(staffId) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                student.email as student_email
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            WHERE f.staff_id = ? AND f.status = 'pending'
            ORDER BY f.submitted_at DESC
        `, [staffId]);
        return rows;
    }

    // Get replied feedback by staff ID
    static async getRepliedByStaffId(staffId) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                student.email as student_email,
                (SELECT COUNT(*) FROM feedback_replies WHERE feedback_id = f.id) as reply_count
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            WHERE f.staff_id = ? AND f.status = 'replied'
            ORDER BY f.updated_at DESC
        `, [staffId]);
        return rows;
    }

    // Create new feedback
    static async create(feedbackData) {
        const { student_id, staff_id, subject, message } = feedbackData;
        const [result] = await pool.query(
            'INSERT INTO feedback (student_id, staff_id, subject, message) VALUES (?, ?, ?, ?)',
            [student_id, staff_id, subject, message]
        );
        return result.insertId;
    }

    // Update feedback status
    static async updateStatus(id, status) {
        const [result] = await pool.query(
            'UPDATE feedback SET status = ? WHERE id = ?',
            [status, id]
        );
        return result.affectedRows > 0;
    }

    // Mark feedback as replied
    static async markAsReplied(id) {
        return await this.updateStatus(id, 'replied');
    }

    // Delete feedback
    static async delete(id) {
        const [result] = await pool.query('DELETE FROM feedback WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Get feedback statistics
    static async getStats() {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
            FROM feedback
        `);
        return stats[0];
    }

    // Get feedback statistics by staff ID
    static async getStatsByStaffId(staffId) {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
            FROM feedback
            WHERE staff_id = ?
        `, [staffId]);
        return stats[0];
    }

    // Get feedback statistics by student ID
    static async getStatsByStudentId(studentId) {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied
            FROM feedback
            WHERE student_id = ?
        `, [studentId]);
        return stats[0];
    }

    // Get recent feedback (last N items)
    static async getRecent(limit = 10) {
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                staff.name as staff_name
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            JOIN users staff ON f.staff_id = staff.id
            ORDER BY f.submitted_at DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }

    // Search feedback
    static async search(searchTerm) {
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await pool.query(`
            SELECT 
                f.*,
                student.name as student_name,
                student.email as student_email,
                staff.name as staff_name,
                staff.email as staff_email
            FROM feedback f
            JOIN users student ON f.student_id = student.id
            JOIN users staff ON f.staff_id = staff.id
            WHERE f.subject LIKE ? OR f.message LIKE ?
            ORDER BY f.submitted_at DESC
        `, [searchPattern, searchPattern]);
        return rows;
    }

    // Check if student can submit feedback (has assigned staff)
    static async canStudentSubmit(studentId) {
        const [rows] = await pool.query(`
            SELECT COUNT(*) as count
            FROM staff_student_assignments
            WHERE student_id = ?
        `, [studentId]);
        return rows[0].count > 0;
    }

    // Check if staff can view feedback
    static async canStaffView(feedbackId, staffId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM feedback WHERE id = ? AND staff_id = ?',
            [feedbackId, staffId]
        );
        return rows[0].count > 0;
    }

    // Check if student can view feedback
    static async canStudentView(feedbackId, studentId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM feedback WHERE id = ? AND student_id = ?',
            [feedbackId, studentId]
        );
        return rows[0].count > 0;
    }
}

module.exports = Feedback;
