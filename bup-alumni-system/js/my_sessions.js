// js/my_sessions.js — FINAL 100% WORKING VERSION — NOVEMBER 20, 2025 10:50 AM
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

// CORRECT WAY — YOUR LOGIN SAVES student_id INSIDE "user" OBJECT
const studentId = currentUser.studentId || currentUser?.user?.student_id;

console.log("Full currentUser:", currentUser);
console.log("Student ID:", studentId);

if (!studentId) {
  alert("Please login as student!");
  window.location.href = "../student_login.html";
}

async function loadMySessions() {
  try {
    const res = await fetch(`http://localhost:3000/api/sessions/student/${studentId}`);
    const result = await res.json();
    console.log("Student sessions data:", result);

    const tbody = document.getElementById("sessions-body");

    if (!result.success || !result.data || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:4rem; color:#94a3b8; font-size:1.1rem;">
        <strong>No sessions yet</strong><br><br>
        When your mentor schedules a session, it will appear here with a Join button.
      </td></tr>`;
      return;
    }

    tbody.innerHTML = result.data.map(s => `
      <tr>
        <td><strong>${escape(s.offer_title || "Mentorship Session")}</strong></td>
        <td>${escape(s.alumni_name || "Your Mentor")}</td>
        <td>${s.datetime ? new Date(s.datetime).toLocaleDateString('en-GB') : '<span style="color:#f59e0b;">Not scheduled yet</span>'}</td>
        <td>${s.datetime ? new Date(s.datetime).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
        <td>
          ${s.meeting_link 
            ? `<a href="${s.meeting_link}" target="_blank" class="btn-primary" style="padding:0.5rem 1rem; border-radius:8px; text-decoration:none;">Join Session</a>` 
            : '<span style="color:#94a3b8;">Link not set</span>'
          }
        </td>
        <td><span class="status-badge status-${s.status || 'scheduled'}">
          ${s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Scheduled'}
        </span></td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Error loading sessions:", err);
    document.getElementById("sessions-body").innerHTML = `<tr><td colspan="6">Error loading sessions</td></tr>`;
  }
}

function escape(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

// Load sessions when page opens
loadMySessions();