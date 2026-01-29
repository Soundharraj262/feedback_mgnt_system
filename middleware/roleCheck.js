// Middleware to check if user has selected a role
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        const userRole = req.session.userRole;
        const userId = req.session.userId;

        // Check if role is set
        if (!userRole || !userId) {
            return res.redirect('/');
        }

        // Check if user has permission
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).render('error', {
                title: 'Access Denied',
                message: 'You do not have permission to access this page',
                role: userRole
            });
        }

        // Attach role and user info to request
        req.userRole = userRole;
        req.userId = userId;
        req.userName = req.session.userName;
        req.userEmail = req.session.userEmail;

        next();
    };
}

// Middleware to check if user is Super Admin
function requireAdmin(req, res, next) {
    return requireRole('super_admin')(req, res, next);
}

// Middleware to check if user is Staff
function requireStaff(req, res, next) {
    return requireRole('staff')(req, res, next);
}

// Middleware to check if user is Student
function requireStudent(req, res, next) {
    return requireRole('student')(req, res, next);
}

// Middleware to check if user is Staff or Admin
function requireStaffOrAdmin(req, res, next) {
    return requireRole('staff', 'super_admin')(req, res, next);
}

module.exports = {
    requireRole,
    requireAdmin,
    requireStaff,
    requireStudent,
    requireStaffOrAdmin
};
