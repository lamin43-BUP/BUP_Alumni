// js/upcoming_sessions.js — FINAL WITH WORKING SCHEDULE MODAL
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const alumniId = currentUser.user?.id;

if (!alumniId) {
  alert("Please login as alumni!");
  window.location.href = "../alumni_login.html";
}

let currentSessionId = null;

async function loadSessions() {
  try {
    const res = await fetch(`http://localhost:3000/api/sessions?alumniId=${alumniId}`);
    const json = await res.json();
    console.log("Sessions:", json);

    const tbody = document.getElementById("sessionsBody");
    if (!json.success || json.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:4rem;color:#94a3b8;">
        No approved students yet.<br><br>When you approve an application, they will appear here.
      </td></tr>`;
      document.getElementById("totalSessions").textContent = "0";
      return;
    }

    document.getElementById("totalSessions").textContent = json.data.length;
    document.getElementById("pendingSessions").textContent = json.data.filter(s => !s.datetime).length;

    tbody.innerHTML = json.data.map(s => `
      <tr>
        <td><strong>${s.student_name || "Student ID: " + s.student_id}</strong><br>
            <small style="color:#94a3b8;">${s.student_batch || "N/A"}</small></td>
        <td>${s.datetime ? new Date(s.datetime).toLocaleDateString('en-GB') : '<span style="color:#f59e0b;">Not scheduled yet</span>'}</td>
        <td>${s.datetime ? new Date(s.datetime).toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'}) : '—'}</td>
        <td>${s.topic || "Mentorship Session"}</td>
        <td><span class="status-badge status-${s.status || 'scheduled'}">Scheduled</span></td>
        <td>
          <button class="btn-primary action-btn" onclick="openScheduleModal(${s.id}, '${s.student_name || s.student_id}', '${s.topic || 'Mentorship Session'}')">
            ${s.datetime ? 'Reschedule' : 'Schedule'}
          </button>
        </td>
      </tr>
    `).join("");
  } catch (err) { console.error(err); }
}

function openScheduleModal(sessionId, studentName, topic) {
  currentSessionId = sessionId;
  document.getElementById("modalStudentName").textContent = studentName;
  document.getElementById("modalTopic").value = topic;
  document.getElementById("scheduleModal").style.display = "flex";
}

function closeScheduleModal() {
  document.getElementById("scheduleModal").style.display = "none";
}

async function saveSchedule() {
  const date = document.getElementById("sessionDate").value;
  const time = document.getElementById("sessionTime").value;
  const topic = document.getElementById("modalTopic").value;
  const meetLink = document.getElementById("meetLink").value.trim() || "https://meet.google.com/new";

  if (!date || !time) {
    alert("Please select date and time!");
    return;
  }

  const datetime = `${date}T${time}:00`;

  try {
    const res = await fetch(`http://localhost:3000/api/sessions/${currentSessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-alumni-id": alumniId },
      body: JSON.stringify({ datetime, topic, meeting_link: meetLink, status: "scheduled" })
    });
    const json = await res.json();
    if (json.success) {
      alert("Session scheduled successfully!");
      closeScheduleModal();
      loadSessions();
    } else {
      alert("Error: " + json.message);
    }
  } catch (err) {
    alert("Network error");
  }
}

// Close modal when clicking outside
window.onclick = e => {
  if (e.target === document.getElementById("scheduleModal")) closeScheduleModal();
};

loadSessions();