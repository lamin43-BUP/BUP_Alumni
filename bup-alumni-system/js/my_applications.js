// js/my_applications.js
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const studentId = currentUser.studentId || currentUser?.user?.student_id || currentUser?.student_id;

document.addEventListener("DOMContentLoaded", async () => {
  if (!studentId) {
    alert("Please login as student");
    window.location.href = "../student_login.html";
    return;
  }

  await loadMyApplications();
});

async function loadMyApplications() {
  try {
    const res = await fetch(`/api/applications/student/${studentId}`);
    const result = await res.json();

    const applications = result?.data || [];

    const tbody = document.getElementById("applications-body");
    const noApps = document.getElementById("no-applications");

    if (applications.length === 0) {
      noApps.style.display = "block";
      tbody.innerHTML = "";
      return;
    }

    noApps.style.display = "none";

    tbody.innerHTML = applications.map(app => {
      const date = new Date(app.applied_at || app.created_at).toLocaleDateString("en-GB");
      const statusClass = 
        app.status === "approved" ? "approved" :
        app.status === "rejected" ? "rejected" : "pending";

      const statusText = 
        app.status === "approved" ? "Approved" :
        app.status === "rejected" ? "Rejected" : "Pending";

      return `
        <tr>
          <td>${escapeHtml(app.title || "Untitled Offer")}</td>
          <td>${escapeHtml(app.alumni_name || "Unknown Mentor")}</td>
          <td style="max-width:300px; word-wrap:break-word;">${escapeHtml(app.message).replace(/\n/g, "<br>")}</td>
          <td><span class="status ${statusClass}">${statusText}</span></td>
          <td>${date}</td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error("Load applications error:", err);
    document.getElementById("no-applications").innerHTML = "<p>Failed to load applications.</p>";
    document.getElementById("no-applications").style.display = "block";
  }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}