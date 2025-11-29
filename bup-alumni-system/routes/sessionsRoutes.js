// routes/sessionRoutes.js — FINAL VERSION — NOVEMBER 20, 2025 10:45 AM — BUP MENTORSHIP LAUNCHED
const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET all sessions for alumni
router.get("/", async (req, res) => {
  try {
    const alumniId = req.query.alumniId || req.headers["x-alumni-id"];
    if (!alumniId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const [sessions] = await db.execute(`
      SELECT
        s.*,
        st.name AS student_name,
        st.batch AS student_batch,
        mo.title AS offer_title
      FROM sessions s
      LEFT JOIN students st ON st.student_id = s.student_id
      LEFT JOIN mentorship_offers mo ON mo.id = s.offer_id
      WHERE s.alumni_id = ?
      ORDER BY s.created_at DESC
    `, [alumniId]);

    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("Error fetching sessions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CREATE session when approving application
router.post("/", async (req, res) => {
  try {
    const { alumniId, student_id, offer_id, topic = "Mentorship Session" } = req.body;
    if (!alumniId || !student_id) {
      return res.json({ success: false, message: "Missing alumniId or student_id" });
    }

    const [result] = await db.execute(`
      INSERT INTO sessions
      (alumni_id, student_id, offer_id, topic, datetime, status, created_at)
      VALUES (?, ?, ?, ?, NULL, 'scheduled', NOW())
    `, [alumniId, student_id, offer_id || null, topic]);

    console.log(`Session created: ID ${result.insertId} for student ${student_id}`);
    res.json({ success: true, sessionId: result.insertId });
  } catch (err) {
    console.error("Error creating session:", err.message);
    res.status(500).json({ success: false, message: "Failed to create session" });
  }
});

// UPDATE session (SCHEDULE / RESCHEDULE) — THIS IS THE ONE YOU NEEDED
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const alumniId = req.headers["x-alumni-id"];
    const { datetime, topic, meeting_link, status = "scheduled" } = req.body;

    if (!alumniId) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    const [result] = await db.execute(`
      UPDATE sessions
      SET 
        datetime = ?,
        topic = ?,
        meeting_link = ?,
        status = ?
      WHERE id = ? AND alumni_id = ?
    `, [datetime || null, topic || "Mentorship Session", meeting_link || null, status, id, alumniId]);

    if (result.affectedRows === 0) {
      return res.json({ success: false, message: "Session not found or unauthorized" });
    }

    console.log(`Session ${id} scheduled successfully`);
    res.json({ success: true, message: "Session scheduled successfully!" });
  } catch (err) {
    console.error("Error updating session:", err);
    res.status(500).json({ success: false, message: "Failed to schedule session" });
  }
});
// GET sessions for a student
router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const [sessions] = await db.execute(`
      SELECT 
        s.*,
        mo.title AS offer_title,
        al.name AS alumni_name
      FROM sessions s
      LEFT JOIN mentorship_offers mo ON mo.id = s.offer_id
      LEFT JOIN alumni al ON al.alumni_id = s.alumni_id
      WHERE s.student_id = ?
      ORDER BY s.datetime DESC, s.created_at DESC
    `, [studentId]);

    res.json({ success: true, data: sessions });
  } catch (err) {
    console.error("Error fetching student sessions:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;