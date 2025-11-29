// frontend/js/applications.js → FINAL CLEAN VERSION — NO NOTIFICATIONS — FLAWLESS
const urlParams = new URLSearchParams(window.location.search);
const offerId = urlParams.get('offerId');

if (!offerId) {
  alert("No offer selected");
  window.location.href = "my_offers.html";
}

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const alumniId = currentUser.alumni_id || currentUser.id || currentUser?.user?.id;

if (!alumniId) {
  alert("Please login as alumni first");
  window.location.href = "../alumni_login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadOfferAndApplications();

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterTable);
  }
});

async function loadOfferAndApplications() {
  try {
    // Load offer details
    const offerRes = await fetch(`http://localhost:3000/api/offers/${offerId}`);
    const offerData = await offerRes.json();

    if (!offerData.success || offerData.data.alumni_id !== alumniId) {
      alert("Unauthorized access or offer not found");
      window.location.href = "my_offers.html";
      return;
    }

    document.getElementById("offer-title").textContent = offerData.data.title;

    // Load applications
    const res = await fetch(`http://localhost:3000/api/applications/${offerId}`, {
      headers: { "x-alumni-id": alumniId }
    });
    const data = await res.json();

    const tbody = document.getElementById("applicationsBody");
    const noApps = document.getElementById("noApplicants");

    if (!data.success || !data.data || data.data.length === 0) {
      noApps.style.display = "block";
      tbody.innerHTML = "";
      return;
    }

    noApps.style.display = "none";
    renderApplications(data.data);

  } catch (err) {
    console.error("Load error:", err);
    alert("Failed to load applications. Please try again.");
  }
}

function renderApplications(apps) {
  const tbody = document.getElementById("applicationsBody");
  tbody.innerHTML = apps.map(app => `
    <tr>
      <td style="padding: 1rem;">
        <div>
          <strong style="color: #ffffff; font-size: 1.1rem;">
            ${escape(app.student_name || "Student")}
          </strong>
          ${app.student_batch 
            ? `<br><small style="color: #94a3b8;">Batch: ${escape(app.student_batch)}</small>`
            : ''
          }
        </div>
      </td>
      <td style="max-width: 400px; word-wrap: break-word; color: #e2e8f0; line-height: 1.6;">
        ${escape(app.message || "No message").replace(/\n/g, "<br>")}
      </td>
      <td style="color: #94a3b8; white-space: nowrap;">
        ${formatDate(app.applied_at)}
      </td>
      <td>
        <span class="status-badge status-${app.status || 'pending'}">
          ${(app.status || 'pending').charAt(0).toUpperCase() + (app.status || 'pending').slice(1)}
        </span>
      </td>
      <td>
        ${app.status === "pending" ? `
          <button class="btn-primary action-btn" onclick="updateStatus(${app.id}, 'approved')">
            Approve
          </button>
          <button class="btn-delete action-btn" onclick="updateStatus(${app.id}, 'rejected')">
            Reject
          </button>
        ` : `
          <button class="btn-secondary action-btn" disabled>
            ${app.status === "approved" ? "Approved" : "Rejected"}
          </button>
        `}
      </td>
    </tr>
  `).join("");
}

async function updateStatus(appId, newStatus) {
  const action = newStatus === "approved" ? "approve" : "reject";
  if (!confirm(`Are you sure you want to ${action} this application?`)) return;

  try {
    const res = await fetch(`http://localhost:3000/api/applications/${appId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-alumni-id": alumniId
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();

    if (data.success) {
      alert(`Application ${newStatus === "approved" ? "Approved" : "Rejected"} successfully!`);
      loadOfferAndApplications();
    } else {
      alert(data.message || "Action failed. Please try again.");
    }
  } catch (err) {
    console.error("Update failed:", err);
    alert("Network error. Please check your connection.");
  }
}

function filterTable() {
  const term = (document.getElementById("searchInput")?.value || "").toLowerCase();
  document.querySelectorAll("#applicationsBody tr").forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(term) ? "" : "none";
  });
}

function escape(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}