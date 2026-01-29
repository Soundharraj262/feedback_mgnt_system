const { pool } = require('../config/database');

class Assignment {
    // Get all assignments
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                staff.name as staff_name,
                staff.email as staff_email,
                student.name as student_name,
                student.email as student_email
            FROM staff_student_assignments a
            JOIN users staff ON a.staff_id = staff.id
            JOIN users student ON a.student_id = student.id
            ORDER BY a.assigned_at DESC
        `);
        return rows;
    }

    // Get assignments by staff ID
    static async getByStaffId(staffId) {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                student.name as student_name,
                student.email as student_email,
                student.is_active as student_active
            FROM staff_student_assignments a
            JOIN users student ON a.student_id = student.id
            WHERE a.staff_id = ?
            ORDER BY student.name ASC
        `, [staffId]);
        return rows;
    }

    // Get active students assigned to staff
    static async getActiveStudentsByStaffId(staffId) {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                student.id,
                student.name,
                student.email,
                student.is_active
            FROM staff_student_assignments a
            JOIN users student ON a.student_id = student.id
            WHERE a.staff_id = ? AND student.is_active = TRUE
            ORDER BY student.name ASC
        `, [staffId]);
        return rows;
    }

    // Get assignment by student ID
    static async getByStudentId(studentId) {
        const [rows] = await pool.query(`
            SELECT 
                a.*,
                staff.name as staff_name,
                staff.email as staff_email,
                staff.is_active as staff_active
            FROM staff_student_assignments a
            JOIN users staff ON a.staff_id = staff.id
            WHERE a.student_id = ?
        `, [studentId]);
        return rows[0];
    }

    // Create new assignment
    static async create(staffId, studentId) {
        try {
            const [result] = await pool.query(
                'INSERT INTO staff_student_assignments (staff_id, student_id) VALUES (?, ?)',
                [staffId, studentId]
            );
            return result.insertId;
        } catch (error) {
            // Handle duplicate assignment
            if (error.code === 'ER_DUP_ENTRY') {
                throw new Error('Student is already assigned to this staff member');
            }
            throw error;
        }
    }

    // Create multiple assignments (bulk assign)
    static async createBulk(staffId, studentIds) {
        const values = studentIds.map(studentId => [staffId, studentId]);
        const [result] = await pool.query(
            'INSERT IGNORE INTO staff_student_assignments (staff_id, student_id) VALUES ?',
            [values]
        );
        return result.affectedRows;
    }

    // Delete assignment
    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM staff_student_assignments WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Delete assignment by staff and student
    static async deleteByStaffAndStudent(staffId, studentId) {
        const [result] = await pool.query(
            'DELETE FROM staff_student_assignments WHERE staff_id = ? AND student_id = ?',
            [staffId, studentId]
        );
        return result.affectedRows > 0;
    }

    // Delete all assignments for a staff member
    static async deleteByStaffId(staffId) {
        const [result] = await pool.query(
            'DELETE FROM staff_student_assignments WHERE staff_id = ?',
            [staffId]
        );
        return result.affectedRows;
    }

    // Delete all assignments for a student
    static async deleteByStudentId(studentId) {
        const [result] = await pool.query(
            'DELETE FROM staff_student_assignments WHERE student_id = ?',
            [studentId]
        );
        return result.affectedRows;
    }

    // Check if assignment exists
    static async exists(staffId, studentId) {
        const [rows] = await pool.query(
            'SELECT COUNT(*) as count FROM staff_student_assignments WHERE staff_id = ? AND student_id = ?',
            [staffId, studentId]
        );
        return rows[0].count > 0;
    }

    // Get unassigned students
    static async getUnassignedStudents() {
        const [rows] = await pool.query(`
            SELECT u.*
            FROM users u
            WHERE u.role = 'student' 
            AND u.is_active = TRUE
            AND u.id NOT IN (SELECT student_id FROM staff_student_assignments)
            ORDER BY u.name ASC
        `);
        return rows;
    }

    // Get students not assigned to a specific staff
    static async getStudentsNotAssignedToStaff(staffId) {
        const [rows] = await pool.query(`
            SELECT u.*
            FROM users u
            WHERE u.role = 'student' 
            AND u.is_active = TRUE
            AND u.id NOT IN (
                SELECT student_id 
                FROM staff_student_assignments 
                WHERE staff_id = ?
            )
            ORDER BY u.name ASC
        `, [staffId]);
        return rows;
    }

    // Get assignment statistics
    static async getStats() {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total_assignments,
                COUNT(DISTINCT staff_id) as staff_with_assignments,
                COUNT(DISTINCT student_id) as students_assigned
            FROM staff_student_assignments
        `);
        return stats[0];
    }

    // Get staff assignment counts
    static async getStaffAssignmentCounts() {
        const [rows] = await pool.query(`
            SELECT 
                staff.id,
                staff.name,
                staff.email,
                COUNT(a.student_id) as student_count
            FROM users staff
            LEFT JOIN staff_student_assignments a ON staff.id = a.staff_id
            WHERE staff.role = 'staff' AND staff.is_active = TRUE
            GROUP BY staff.id, staff.name, staff.email
            ORDER BY student_count DESC, staff.name ASC
        `);
        return rows;
    }
}

module.exports = Assignment;
