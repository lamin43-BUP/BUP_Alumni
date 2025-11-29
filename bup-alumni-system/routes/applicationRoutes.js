// routes/applicationRoutes.js — FINAL WORKING VERSION — BUP MENTORSHIP LAUNCHED
const express = require("express");
const router = express.Router();
const db = require("../config/database");

// GET ALL APPLICATIONS OF A STUDENT (My Applications page)
router.get("/student/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const [apps] = await db.execute(`
      SELECT
        a.id, a.message, a.status, a.applied_at,
        mo.title,
        al.name AS alumni_name
      FROM applications a
      JOIN mentorship_offers mo ON a.offer_id = mo.id
      JOIN alumni al ON mo.alumni_id = al.alumni_id
      WHERE a.student_id = ?
      ORDER BY a.applied_at DESC
    `, [studentId]);
    res.json({ success: true, data: apps });
  } catch (err) {
    console.error("Error fetching student applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET all applications for an offer (only owner can see)
router.get("/:offerId", async (req, res) => {
  try {
    const alumniId = req.headers["x-alumni-id"];
    const { offerId } = req.params;
    if (!alumniId) return res.json({ success: false, message: "Unauthorized" });

    const [offer] = await db.execute(
      "SELECT id FROM mentorship_offers WHERE id = ? AND alumni_id = ?",
      [offerId, alumniId]
    );
    if (offer.length === 0) {
      return res.json({ success: false, message: "Offer not found or unauthorized" });
    }

    const [applications] = await db.execute(`
      SELECT
        a.id,
        a.student_id,
        a.message,
        a.status,
        a.applied_at,
        s.name AS student_name,
        s.email AS student_email,
        s.batch AS student_batch
      FROM applications a
      LEFT JOIN students s ON s.student_id = a.student_id
      WHERE a.offer_id = ?
      ORDER BY a.applied_at DESC
    `, [offerId]);

    res.json({ success: true, data: applications });
  } catch (err) {
    console.error("Error fetching applications:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// UPDATE application status (Approve / Reject) — AUTO CREATE SESSION + NOTIFY
router.put("/:id/status", async (req, res) => {
  try {
    const alumniId = req.headers["x-alumni-id"];
    const { id } = req.params;
    const { status } = req.body;

    if (!alumniId) return res.json({ success: false, message: "Unauthorized" });
    if (!["approved", "rejected"].includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }

    // Verify application belongs to this alumni
    const [appCheck] = await db.execute(`
      SELECT
        app.id,
        app.student_id,
        app.offer_id,
        s.name AS student_name,
        s.email AS student_email,
        mo.title AS offer_title,
        al.name AS alumni_name
      FROM applications app
      JOIN mentorship_offers mo ON app.offer_id = mo.id
      LEFT JOIN students s ON s.student_id = app.student_id
      JOIN alumni al ON mo.alumni_id = al.alumni_id
      WHERE app.id = ? AND mo.alumni_id = ?
    `, [id, alumniId]);

    if (appCheck.length === 0) {
      return res.json({ success: false, message: "Not authorized" });
    }

    const application = appCheck[0];

    // Update application status
    await db.execute("UPDATE applications SET status = ? WHERE id = ?", [status, id]);

    // ONLY IF APPROVED → CREATE SESSION + NOTIFY
    if (status === "approved") {
      // AUTO CREATE SESSION — THIS IS NOW 100% WORKING
      await db.execute(`
        INSERT INTO sessions
        (alumni_id, student_id, offer_id, topic, status, created_at)
        VALUES (?, ?, ?, ?, 'scheduled', NOW())
      `, [
        alumniId,
        application.student_id,
        application.offer_id,
        application.offer_title || "Mentorship Session"
      ]);
      console.log("SESSION AUTO-CREATED for student:", application.student_id);

      // SEND EMAIL
      if (application.student_email) {
        global.emailTransporter.sendMail({
          from: `"BUP Alumni Mentorship" <${process.env.EMAIL_USER}>`,
          to: application.student_email,
          subject: `You've been selected for "${application.offer_title}"!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 2rem; background: #f8fafc; border-radius: 12px;">
              <h1 style="color: #1e293b; text-align: center;">Congratulations ${application.student_name}!</h1>
              <div style="background: white; padding: 2rem; border-radius: 12px; text-align: center;">
                <h2 style="color: #3b82f6;">You've been selected!</h2>
                <p style="font-size: 1.1rem; color: #475569;">
                  <strong>${application.alumni_name}</strong> has accepted your application for:
                </p>
                <div style="background: #dbeafe; color: #1e40af; padding: 1rem; border-radius: 8px; font-weight: bold; font-size: 1.3rem; margin: 1.5rem 0;">
                  "${application.offer_title}"
                </div>
                <p>You will be notified when the session is scheduled.</p>
              </div>
              <div style="text-align: center; margin-top: 2rem;">
                <a href="http://localhost:3000/mentorship_student_dashboard.html"
                   style="background: #3b82f6; color: white; padding: 1rem 2.5rem; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
            </div>
          `
        }, (err) => {
          if (err) console.error("Email failed:", err);
          else console.log(`Email sent to ${application.student_email}`);
        });
      }

      // SAVE NOTIFICATION
      try {
        await db.execute(`
          INSERT INTO notifications (user_id, user_type, title, message, related_offer_id, type)
          VALUES (?, 'student', ?, ?, ?, 'success')
        `, [
          application.student_id,
          "Application Approved!",
          `${application.alumni_name} approved your application for "${application.offer_title}"!`,
          application.offer_id
        ]);
      } catch (err) {
        console.error("Notification failed:", err);
      }
    }

    res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
    console.error("Error in approve/reject:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;