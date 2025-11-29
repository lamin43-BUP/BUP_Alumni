const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET: Fetch student profile — we get student_id from frontend
router.get('/', async (req, res) => {
    try {
        // We will get the student_id from query parameter (e.g. ?id=7)
        // Later frontend will add it automatically
        const studentId = req.query.id;

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Missing student ID' });
        }

        const [rows] = await db.execute(
            'SELECT * FROM students WHERE student_id = ?',
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT: Update student profile — frontend sends student_id + new data
router.put('/', async (req, res) => {
    try {
        const studentId = req.body.student_id;  // frontend will send this
        if (!studentId) {
            return res.status(400).json({ success: false, message: 'Missing student ID' });
        }

        const { name, email, phone, department, batch, current_year, address, religion, bloodgroup, gender, facebook, linkedin } = req.body;

        await db.execute(
            `UPDATE students SET 
                name = ?, email = ?, phone = ?, department = ?, batch = ?, 
                current_year = ?, address = ?, religion = ?, bloodgroup = ?, 
                gender = ?, facebook = ?, linkedin = ?
             WHERE student_id = ?`,
            [name, email, phone, department, batch, current_year, address, religion, bloodgroup, gender, facebook, linkedin, studentId]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

module.exports = router;