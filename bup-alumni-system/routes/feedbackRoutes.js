// routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/database');

// POST /api/feedback  → saves to database
router.post('/feedback', async (req, res) => {
    const { name, email, feedback_message, student_id, alumni_id } = req.body;

    try {
        await db.query(
            `INSERT INTO feedbacks (student_id, alumni_id, name, email, feedback_message)
             VALUES (?, ?, ?, ?, ?)`,
            [student_id || null, alumni_id || null, name, email, feedback_message]
        );

        res.json({ success: true, message: "Thank you! Your feedback was sent." });
    } catch (error) {
        console.error("Feedback save error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;