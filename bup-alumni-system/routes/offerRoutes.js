// routes/offerRoutes.js
const express = require("express");
const db = require("../config/database");
const router = express.Router();

// =============================
// GET ALL MENTORSHIP OFFERS (with optional ?mine=true filter)
// =============================
router.get("/", async (req, res) => {
  try {
    let query = `
      SELECT mo.*, a.name AS alumni_name
      FROM mentorship_offers mo
      JOIN alumni a ON mo.alumni_id = a.alumni_id
    `;
    let params = [];

    if (req.query.mine === "true" && req.query.alumniId) {
      query += " WHERE mo.alumni_id = ?";
      params.push(req.query.alumniId);
    }

    query += " ORDER BY mo.created_at DESC";
    const [offers] = await db.execute(query, params);

    res.json({ success: true, data: offers });
  } catch (err) {
    console.error("Error fetching offers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
// GET SINGLE OFFER
// =============================
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [offers] = await db.execute(
      `SELECT mo.*, a.name AS alumni_name
       FROM mentorship_offers mo
       JOIN alumni a ON mo.alumni_id = a.alumni_id
       WHERE mo.id = ?`,
      [id]
    );

    if (offers.length === 0) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }

    res.json({ success: true, data: offers[0] });
  } catch (err) {
    console.error("Error fetching offer:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
// APPLY TO OFFER (STUDENT OR ALUMNI)
// =============================
router.post("/apply", async (req, res) => {
  try {
    const { offerId, message } = req.body;

    // Universal user detection
    const applicantId = req.headers["x-user-id"] || req.headers["x-student-id"] || req.headers["x-alumni-id"];
    const applicantType = req.headers["x-user-type"]; // "student" or "alumni"

    if (!applicantId || !applicantType || !offerId || !message) {
      return res.json({ success: false, message: "Missing required data" });
    }

    if (!["student", "alumni"].includes(applicantType)) {
      return res.json({ success: false, message: "Invalid user type" });
    }

    // Prevent applying to own offer
    // === PREVENT SELF-APPLICATION — ONLY IF APPLICANT IS ALUMNI ===
if (applicantType === "alumni") {
  const [offerCheck] = await db.execute(
    "SELECT alumni_id FROM mentorship_offers WHERE id = ?",
    [offerId]
  );
  if (offerCheck.length > 0 && offerCheck[0].alumni_id == applicantId) {
    return res.json({ success: false, message: "Cannot apply to your own offer" });
  }
}
// Students can apply to any offer — no restriction
    // Insert application
    await db.execute(
      "INSERT INTO applications (offer_id, student_id, message) VALUES (?, ?, ?)",
      [offerId, applicantId, message]
    );

    // AUTO INCREASE APPLICANT COUNTER
    await db.execute(
      "UPDATE mentorship_offers SET applicants = applicants + 1 WHERE id = ?",
      [offerId]
    );

    res.json({ success: true, message: "Applied successfully!" });
  } catch (err) {
    console.error("Apply error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.json({ success: false, message: "You have already applied to this offer" });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
});

// =============================
// CREATE MENTORSHIP OFFER
// =============================
router.post("/create", async (req, res) => {
  const { title, category, description, max_applicants, schedule, alumniId } = req.body;

  if (!title || !category || !description || !alumniId) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO mentorship_offers 
       (alumni_id, title, category, description, max_applicants, schedule, applicants)
       VALUES (?, ?, ?, ?, ?, ?, 0)`,
      [
        alumniId,
        title,
        category,
        description,
        max_applicants ? parseInt(max_applicants) : null,
        schedule || null
      ]
    );

    res.json({
      success: true,
      message: "Offer created successfully!",
      offerId: result.insertId
    });
  } catch (err) {
    console.error("Create offer error:", err);
    res.status(500).json({ success: false, message: "Failed to create offer" });
  }
});

// =============================
// EDIT MENTORSHIP OFFER
// =============================
router.put("/:id/edit", async (req, res) => {
  const { id } = req.params;
  const { title, category, description, max_applicants, schedule, alumniId } = req.body;

  if (!title || !category || !description || !alumniId) {
    return res.status(400).json({ success: false, message: "All fields required" });
  }

  try {
    const [existing] = await db.execute(
      "SELECT id FROM mentorship_offers WHERE id = ? AND alumni_id = ?",
      [id, alumniId]
    );

    if (existing.length === 0) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await db.execute(
      `UPDATE mentorship_offers SET 
         title = ?, category = ?, description = ?, 
         max_applicants = ?, schedule = ?
       WHERE id = ? AND alumni_id = ?`,
      [
        title, category, description,
        max_applicants ? parseInt(max_applicants) : null,
        schedule || null, id, alumniId
      ]
    );

    res.json({ success: true, message: "Offer updated!" });
  } catch (err) {
    console.error("Edit error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// =============================
// DELETE MENTORSHIP OFFER
// =============================
router.delete("/:id/delete", async (req, res) => {
  const { id } = req.params;
  const { alumniId } = req.body;

  if (!alumniId) {
    return res.status(400).json({ success: false, message: "alumniId required" });
  }

  try {
    const [existing] = await db.execute(
      "SELECT id FROM mentorship_offers WHERE id = ? AND alumni_id = ?",
      [id, alumniId]
    );

    if (existing.length === 0) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await db.execute("DELETE FROM mentorship_offers WHERE id = ? AND alumni_id = ?", [id, alumniId]);
    res.json({ success: true, message: "Offer deleted!" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

module.exports = router;