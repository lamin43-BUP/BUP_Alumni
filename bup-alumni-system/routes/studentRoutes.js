const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const router = express.Router();

// Student registration
router.post('/register', async (req, res) => {
    console.log('📥 Received student registration request:', req.body);
    
    const { 
        name, email, studentId, department, batch, currentYear, address, religion, 
        bloodgroup, gender, facebook, linkedin, phone, password 
    } = req.body;

    // Validate required fields
    if (!name || !email || !studentId || !department || !batch || !currentYear || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be filled'
        });
    }

    try {
        // Check if student already exists
        const [existingStudent] = await db.execute(
            'SELECT * FROM students WHERE email = ? OR bup_id = ?',
            [email, studentId]
        );

        if (existingStudent.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Student with this email or BUP ID already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert student into database
        const query = `
            INSERT INTO students (
                name, email, password, department, batch, current_year, address, religion, 
                bloodgroup, gender, bup_id, facebook, linkedin, phone
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log('📝 Executing query with data:', {
            name, email, studentId, department, batch, currentYear
        });

        const [result] = await db.execute(query, [
            name, email, hashedPassword, department, batch, currentYear, address, religion,
            bloodgroup, gender, studentId, facebook, linkedin, phone
        ]);

        console.log('✅ Student registration successful, ID:', result.insertId);

        res.json({
            success: true,
            message: 'Student registration completed successfully',
            studentId: result.insertId
        });

    } catch (error) {
        console.error('❌ Error during student registration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Student login
router.post('/login', async (req, res) => {
    console.log('📥 Received student login request:', req.body);
    
    const { studentId, password } = req.body;

    // Validate required fields
    if (!studentId || !password) {
        return res.status(400).json({
            success: false,
            message: 'Student ID and password are required'
        });
    }

    try {
        // Find student by BUP ID
        const [students] = await db.execute(
            'SELECT * FROM students WHERE bup_id = ?',
            [studentId]
        );

        if (students.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Student ID or password'
            });
        }

        const student = students[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, student.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Student ID or password'
            });
        }

        // Return success with user data (excluding password)
        console.log('✅ Student login successful for:', student.name);
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: student.student_id,
                name: student.name,
                email: student.email,
                studentId: student.bup_id,
                department: student.department,
                batch: student.batch,
                currentYear: student.current_year,
                phone: student.phone,
                role: 'student'
            }
        });

    } catch (error) {
        console.error('❌ Student login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get all students (for testing)
router.get('/', async (req, res) => {
    try {
        const [students] = await db.execute('SELECT student_id, name, email, department, batch FROM students');
        res.json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;