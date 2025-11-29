// routes/alumniProfileRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET: Fetch alumni profile
router.get('/', async (req, res) => {
    try {
        const alumniId = req.query.id;

        if (!alumniId) {
            return res.status(400).json({ success: false, message: 'Missing alumni ID' });
        }

        const [rows] = await db.execute(
            'SELECT * FROM alumni WHERE alumni_id = ?',
            [alumniId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Alumni not found' });
        }

        res.json({ success: true, data: rows[0] });
    } catch (error) {
        console.error('Error fetching alumni profile:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// PUT: Update alumni profile
router.put('/', async (req, res) => {
    try {
        const alumniId = req.body.alumni_id;
        if (!alumniId) {
            return res.status(400).json({ success: false, message: 'Missing alumni ID' });
        }

        const { 
            name, email, phone, department, batch, graduation_year, 
            alumni_status, current_workplace, profession, address, 
            religion, blood_group, gender, facebook, linkedin 
        } = req.body;

        await db.execute(
            `UPDATE alumni SET 
                name = ?, email = ?, phone = ?, department = ?, batch = ?, 
                graduation_year = ?, alumni_status = ?, current_workplace = ?, 
                profession = ?, address = ?, religion = ?, blood_group = ?, 
                gender = ?, facebook = ?, linkedin = ?
             WHERE alumni_id = ?`,
            [
                name, email, phone, department, batch, graduation_year,
                alumni_status, current_workplace, profession, address,
                religion, blood_group, gender, facebook, linkedin, alumniId
            ]
        );

        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating alumni profile:', error);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

module.exports = router;