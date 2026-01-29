const { pool } = require('../config/database');

class FeedbackReply {
    // Get all replies for a feedback
    static async getByFeedbackId(feedbackId) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                staff.name as staff_name,
                staff.email as staff_email
            FROM feedback_replies r
            JOIN users staff ON r.staff_id = staff.id
            WHERE r.feedback_id = ?
            ORDER BY r.replied_at ASC
        `, [feedbackId]);
        return rows;
    }

    // Get reply by ID
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                staff.name as staff_name,
                staff.email as staff_email
            FROM feedback_replies r
            JOIN users staff ON r.staff_id = staff.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    }

    // Get all replies by staff ID
    static async getByStaffId(staffId) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                f.subject as feedback_subject,
                student.name as student_name
            FROM feedback_replies r
            JOIN feedback f ON r.feedback_id = f.id
            JOIN users student ON f.student_id = student.id
            WHERE r.staff_id = ?
            ORDER BY r.replied_at DESC
        `, [staffId]);
        return rows;
    }

    // Create new reply
    static async create(replyData) {
        const { feedback_id, staff_id, reply_message } = replyData;

        // Start transaction
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Insert reply
            const [result] = await connection.query(
                'INSERT INTO feedback_replies (feedback_id, staff_id, reply_message) VALUES (?, ?, ?)',
                [feedback_id, staff_id, reply_message]
            );

            // Update feedback status to 'replied'
            await connection.query(
                'UPDATE feedback SET status = ? WHERE id = ?',
                ['replied', feedback_id]
            );

            await connection.commit();
            return result.insertId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Update reply
    static async update(id, replyMessage) {
        const [result] = await pool.query(
            'UPDATE feedback_replies SET reply_message = ? WHERE id = ?',
            [replyMessage, id]
        );
        return result.affectedRows > 0;
    }

    // Delete reply
    static async delete(id) {
        // Get feedback_id before deleting
        const reply = await this.getById(id);
        if (!reply) return false;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Delete reply
            await connection.query('DELETE FROM feedback_replies WHERE id = ?', [id]);

            // Check if there are any remaining replies
            const [remaining] = await connection.query(
                'SELECT COUNT(*) as count FROM feedback_replies WHERE feedback_id = ?',
                [reply.feedback_id]
            );

            // If no replies left, update feedback status to pending
            if (remaining[0].count === 0) {
                await connection.query(
                    'UPDATE feedback SET status = ? WHERE id = ?',
                    ['pending', reply.feedback_id]
                );
            }

            await connection.commit();
            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Get reply count for a feedback
    static async getCountByFeedbackId(feedbackId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM feedback_replies WHERE feedback_id = ?',
            [feedbackId]
        );
        return rows[0].count;
    }

    // Get latest reply for a feedback
    static async getLatestByFeedbackId(feedbackId) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                staff.name as staff_name,
                staff.email as staff_email
            FROM feedback_replies r
            JOIN users staff ON r.staff_id = staff.id
            WHERE r.feedback_id = ?
            ORDER BY r.replied_at DESC
            LIMIT 1
        `, [feedbackId]);
        return rows[0];
    }

    // Get total reply count by staff
    static async getCountByStaffId(staffId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM feedback_replies WHERE staff_id = ?',
            [staffId]
        );
        return rows[0].count;
    }

    // Get recent replies by staff
    static async getRecentByStaffId(staffId, limit = 5) {
        const [rows] = await pool.query(`
            SELECT 
                r.*,
                f.subject as feedback_subject,
                student.name as student_name
            FROM feedback_replies r
            JOIN feedback f ON r.feedback_id = f.id
            JOIN users student ON f.student_id = student.id
            WHERE r.staff_id = ?
            ORDER BY r.replied_at DESC
            LIMIT ?
        `, [staffId, limit]);
        return rows;
    }

    // Check if staff has replied to feedback
    static async hasStaffReplied(feedbackId, staffId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM feedback_replies WHERE feedback_id = ? AND staff_id = ?',
            [feedbackId, staffId]
        );
        return rows[0].count > 0;
    }
}

module.exports = FeedbackReply;
