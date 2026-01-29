-- Student Feedback Management System - Seed Data
USE feedback_system;

-- ============================================
-- Insert Super Admin
-- Password: admin123
-- ============================================
INSERT INTO users (name, email, password, role, is_active) VALUES
('Admin User', 'admin@system.local', 'admin123', 'super_admin', TRUE);

-- ============================================
-- Insert Staff Members
-- Password for all staff: staff123
-- ============================================
INSERT INTO users (name, email, password, role, is_active) VALUES
('Dr. Sarah Johnson', 'sarah.johnson@staff.local', 'staff123', 'staff', TRUE),
('Prof. Michael Chen', 'michael.chen@staff.local', 'staff123', 'staff', TRUE),
('Dr. Emily Rodriguez', 'emily.rodriguez@staff.local', 'staff123', 'staff', TRUE),
('Prof. David Kumar', 'david.kumar@staff.local', 'staff123', 'staff', TRUE),
('Dr. Lisa Anderson', 'lisa.anderson@staff.local', 'staff123', 'staff', TRUE);

-- ============================================
-- Insert Students
-- Password for all students: student123
-- ============================================
INSERT INTO users (name, email, password, role, is_active) VALUES
('John Smith', 'john.smith@student.local', 'student123', 'student', TRUE),
('Emma Wilson', 'emma.wilson@student.local', 'student123', 'student', TRUE),
('Alex Brown', 'alex.brown@student.local', 'student123', 'student', TRUE),
('Sophia Davis', 'sophia.davis@student.local', 'student123', 'student', TRUE),
('James Miller', 'james.miller@student.local', 'student123', 'student', TRUE),
('Olivia Garcia', 'olivia.garcia@student.local', 'student123', 'student', TRUE),
('William Martinez', 'william.martinez@student.local', 'student123', 'student', TRUE),
('Ava Taylor', 'ava.taylor@student.local', 'student123', 'student', TRUE),
('Ethan Thomas', 'ethan.thomas@student.local', 'student123', 'student', TRUE),
('Isabella Lee', 'isabella.lee@student.local', 'student123', 'student', TRUE),
('Mason White', 'mason.white@student.local', 'student123', 'student', TRUE),
('Mia Harris', 'mia.harris@student.local', 'student123', 'student', TRUE),
('Lucas Clark', 'lucas.clark@student.local', 'student123', 'student', TRUE),
('Charlotte Lewis', 'charlotte.lewis@student.local', 'student123', 'student', TRUE),
('Benjamin Walker', 'benjamin.walker@student.local', 'student123', 'student', TRUE);

-- ============================================
-- Assign Students to Staff
-- Staff 1 (Sarah Johnson) - 3 students
-- Staff 2 (Michael Chen) - 3 students
-- Staff 3 (Emily Rodriguez) - 3 students
-- Staff 4 (David Kumar) - 3 students
-- Staff 5 (Lisa Anderson) - 3 students
-- ============================================
INSERT INTO staff_student_assignments (staff_id, student_id) VALUES
-- Dr. Sarah Johnson's students
(2, 7),   -- John Smith
(2, 8),   -- Emma Wilson
(2, 9),   -- Alex Brown

-- Prof. Michael Chen's students
(3, 10),  -- Sophia Davis
(3, 11),  -- James Miller
(3, 12),  -- Olivia Garcia

-- Dr. Emily Rodriguez's students
(4, 13),  -- William Martinez
(4, 14),  -- Ava Taylor
(4, 15),  -- Ethan Thomas

-- Prof. David Kumar's students
(5, 16),  -- Isabella Lee
(5, 17),  -- Mason White
(5, 18),  -- Mia Harris

-- Dr. Lisa Anderson's students
(6, 19),  -- Lucas Clark
(6, 20),  -- Charlotte Lewis
(6, 21);  -- Benjamin Walker

-- ============================================
-- Insert Sample Feedback
-- ============================================
INSERT INTO feedback (student_id, staff_id, subject, message, status, submitted_at) VALUES
-- Pending feedback
(7, 2, 'Question about Assignment 3', 'Hi Dr. Johnson, I have some questions about the requirements for Assignment 3. Could you please clarify the expected format?', 'pending', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(10, 3, 'Lab Session Timing', 'Prof. Chen, is it possible to reschedule the lab session next week? I have a conflict with another class.', 'pending', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(16, 5, 'Project Topic Approval', 'Prof. Kumar, I would like to get your approval for my project topic. I am interested in working on machine learning applications.', 'pending', DATE_SUB(NOW(), INTERVAL 1 DAY)),

-- Replied feedback
(8, 2, 'Lecture Notes Request', 'Dr. Johnson, I missed the last lecture due to illness. Could you please share the lecture notes?', 'replied', DATE_SUB(NOW(), INTERVAL 3 DAY)),
(11, 3, 'Exam Preparation Guidance', 'Prof. Chen, could you provide some guidance on how to prepare for the upcoming midterm exam?', 'replied', DATE_SUB(NOW(), INTERVAL 5 DAY)),
(13, 4, 'Clarification on Grading', 'Dr. Rodriguez, I noticed my grade for the last quiz seems lower than expected. Could we discuss this?', 'replied', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(19, 6, 'Research Opportunity', 'Dr. Anderson, I am very interested in research opportunities. Do you have any openings in your lab?', 'replied', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(9, 2, 'Extra Credit Options', 'Hi Dr. Johnson, are there any extra credit opportunities available this semester?', 'replied', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(14, 4, 'Recommendation Letter Request', 'Dr. Rodriguez, I am applying for an internship. Would you be willing to write a recommendation letter for me?', 'replied', DATE_SUB(NOW(), INTERVAL 15 DAY)),
(20, 6, 'Office Hours Schedule', 'Dr. Anderson, what are your office hours this week? I would like to discuss my progress.', 'replied', DATE_SUB(NOW(), INTERVAL 18 DAY));

-- ============================================
-- Insert Sample Replies
-- ============================================
INSERT INTO feedback_replies (feedback_id, staff_id, reply_message, replied_at) VALUES
(4, 2, 'Hi Emma, no problem! I have uploaded the lecture notes to the course portal. Feel free to reach out if you have any questions. Hope you are feeling better!', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(5, 3, 'Hello James, focus on chapters 5-8 from the textbook and review all the practice problems we covered in class. I will also post a study guide by tomorrow. Good luck!', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(6, 4, 'Hi William, let us schedule a meeting to review your quiz. Please come to my office hours on Thursday at 2 PM and we can go over it together.', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(7, 6, 'Hello Lucas, yes I do have some research opportunities! Please send me your resume and we can set up a meeting to discuss the details.', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(8, 2, 'Hi Alex, there will be an extra credit assignment posted next week. It will be worth up to 5% of your final grade. Stay tuned!', DATE_SUB(NOW(), INTERVAL 11 DAY)),
(9, 4, 'Hi Ava, I would be happy to write you a recommendation letter. Please send me the details about the internship and your resume. Also, remind me of the deadline.', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(10, 6, 'Hello Charlotte, my office hours this week are Tuesday and Thursday from 2-4 PM. Looking forward to our discussion!', DATE_SUB(NOW(), INTERVAL 17 DAY));

-- ============================================
-- Display Summary
-- ============================================
SELECT 'Seed data inserted successfully!' AS Status;

SELECT 
    'Users Summary' AS Info,
    (SELECT COUNT(*) FROM users WHERE role = 'super_admin') AS SuperAdmins,
    (SELECT COUNT(*) FROM users WHERE role = 'staff') AS Staff,
    (SELECT COUNT(*) FROM users WHERE role = 'student') AS Students,
    (SELECT COUNT(*) FROM users) AS Total;

SELECT 
    'Feedback Summary' AS Info,
    (SELECT COUNT(*) FROM feedback WHERE status = 'pending') AS Pending,
    (SELECT COUNT(*) FROM feedback WHERE status = 'replied') AS Replied,
    (SELECT COUNT(*) FROM feedback) AS Total;
