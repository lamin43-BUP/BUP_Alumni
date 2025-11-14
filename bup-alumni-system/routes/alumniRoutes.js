const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const router = express.Router();

// Get alumni directory data (with all fields)
router.get('/directory', async (req, res) => {
    try {
        console.log('📋 Fetching alumni directory data...');
        
        const [alumni] = await db.execute(`
            SELECT 
                alumni_id,
                name,
                email,
                profession,
                department,
                batch,
                graduation_year,
                address,
                religion,
                blood_group,
                gender,
                bup_id,
                current_workplace,
                facebook,
                linkedin,
                phone,
                alumni_status,
                created_at
            FROM alumni 
            ORDER BY name ASC
        `);

        console.log(`✅ Found ${alumni.length} alumni records for directory`);

        res.json({
            success: true,
            data: alumni,
            count: alumni.length
        });
    } catch (error) {
        console.error('❌ Error fetching alumni directory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alumni data',
            error: error.message
        });
    }
});
// Alumni registration
router.post('/register', async (req, res) => {
    console.log('📥 Received alumni registration request:', req.body);
    
    const { 
        name, email, studentId, department, batch, graduationYear, alumniStatus,
        address, religion, blood_group, gender, currentWorkplace, profession,
        facebook, linkedin, phone, password 
    } = req.body;

    // Validate required fields
    if (!name || !email || !studentId || !department || !batch || !graduationYear || !alumniStatus || !phone || !password) {
        return res.status(400).json({
            success: false,
            message: 'All required fields must be filled'
        });
    }

    try {
        // Check if alumni already exists
        const [existingAlumni] = await db.execute(
            'SELECT * FROM alumni WHERE email = ? OR bup_id = ?',
            [email, studentId]
        );

        if (existingAlumni.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Alumni with this email or BUP ID already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Insert alumni into database
        const query = `
            INSERT INTO alumni (
                name, email, password, profession, department, batch, graduation_year,
                address, religion, blood_group, gender, bup_id, current_workplace,
                facebook, linkedin, phone, alumni_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        console.log('📝 Executing alumni query with data:', {
            name, email, studentId, department, batch, graduationYear, alumniStatus
        });

        const [result] = await db.execute(query, [
            name, email, hashedPassword, profession, department, batch, graduationYear,
            address, religion, blood_group, gender, studentId, currentWorkplace,
            facebook, linkedin, phone, alumniStatus
        ]);

        console.log('✅ Alumni registration successful, ID:', result.insertId);

        res.json({
            success: true,
            message: 'Alumni registration completed successfully',
            alumniId: result.insertId
        });

    } catch (error) {
        console.error('❌ Error during alumni registration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Alumni login
router.post('/login', async (req, res) => {
    console.log('📥 Received alumni login request:', req.body);
    
    const { studentId, password } = req.body;

    // Validate required fields
    if (!studentId || !password) {
        return res.status(400).json({
            success: false,
            message: 'Student ID and password are required'
        });
    }

    try {
        // Find alumni by BUP ID
        const [alumni] = await db.execute(
            'SELECT * FROM alumni WHERE bup_id = ?',
            [studentId]
        );

        if (alumni.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Student ID or password'
            });
        }

        const alumniUser = alumni[0];

        // Check password
        const isPasswordValid = await bcrypt.compare(password, alumniUser.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid Student ID or password'
            });
        }

        // Return success with user data (excluding password)
        console.log('✅ Alumni login successful for:', alumniUser.name);
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: alumniUser.alumni_id,
                name: alumniUser.name,
                email: alumniUser.email,
                studentId: alumniUser.bup_id,
                department: alumniUser.department,
                batch: alumniUser.batch,
                graduationYear: alumniUser.graduation_year,
                alumniStatus: alumniUser.alumni_status,
                profession: alumniUser.profession,
                currentWorkplace: alumniUser.current_workplace,
                phone: alumniUser.phone,
                role: 'alumni'
            }
        });

    } catch (error) {
        console.error('❌ Alumni login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get alumni by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [alumni] = await db.execute(
            'SELECT * FROM alumni WHERE alumni_id = ?',
            [id]
        );

        if (alumni.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Alumni not found'
            });
        }

        res.json({
            success: true,
            data: alumni[0]
        });
    } catch (error) {
        console.error('Error fetching alumni:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch alumni data'
        });
    }
});

// Get all alumni (for testing)
router.get('/', async (req, res) => {
    try {
        const [alumni] = await db.execute('SELECT alumni_id, name, email, department, batch, graduation_year FROM alumni');
        res.json({
            success: true,
            data: alumni
        });
    } catch (error) {
        console.error('Error fetching alumni:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;