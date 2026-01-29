const { pool } = require('../config/database');

class User {
    // Get all users
    static async getAll() {
        const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
        return rows;
    }

    // Get user by ID
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    // Get user by email
    static async getByEmail(email) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Login with email and password
    static async login(email, password) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND password = ? AND is_active = TRUE',
            [email, password]
        );
        return rows[0];
    }

    // Get users by role
    static async getByRole(role) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE role = ? ORDER BY name ASC',
            [role]
        );
        return rows;
    }

    // Get active users by role
    static async getActiveByRole(role) {
        const [rows] = await pool.query(
            'SELECT * FROM users WHERE role = ? AND is_active = TRUE ORDER BY name ASC',
            [role]
        );
        return rows;
    }

    // Create new user
    static async create(userData) {
        const { name, email, role, password } = userData;
        // Default password to role + '123' (e.g., student123) if not provided
        const finalPassword = password || (role + '123');

        const [result] = await pool.query(
            'INSERT INTO users (name, email, role, password) VALUES (?, ?, ?, ?)',
            [name, email, role, finalPassword]
        );
        return result.insertId;
    }

    // Update user
    static async update(id, userData) {
        const { name, email } = userData;
        const [result] = await pool.query(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            [name, email, id]
        );
        return result.affectedRows > 0;
    }

    // Toggle user active status
    static async toggleActive(id) {
        const [result] = await pool.query(
            'UPDATE users SET is_active = NOT is_active WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Deactivate user
    static async deactivate(id) {
        const [result] = await pool.query(
            'UPDATE users SET is_active = FALSE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Activate user
    static async activate(id) {
        const [result] = await pool.query(
            'UPDATE users SET is_active = TRUE WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }

    // Delete user (soft delete by deactivating)
    static async delete(id) {
        return await this.deactivate(id);
    }

    // Get user statistics
    static async getStats() {
        const [stats] = await pool.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN role = 'super_admin' THEN 1 ELSE 0 END) as admins,
                SUM(CASE WHEN role = 'staff' THEN 1 ELSE 0 END) as staff,
                SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
                SUM(CASE WHEN is_active = TRUE THEN 1 ELSE 0 END) as active,
                SUM(CASE WHEN is_active = FALSE THEN 1 ELSE 0 END) as inactive
            FROM users
        `);
        return stats[0];
    }

    // Check if email exists
    static async emailExists(email, excludeId = null) {
        let query = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
        let params = [email];

        if (excludeId) {
            query += ' AND id != ?';
            params.push(excludeId);
        }

        const [rows] = await pool.query(query, params);
        return rows[0].count > 0;
    }
}

module.exports = User;
