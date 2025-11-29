// frontend/js/my_offers.js — FINAL CLEAN VERSION (NO APPLY AS MENTEE, NO NOTIFICATIONS) — NOV 20, 2025 09:15 PM
const API_BASE = "http://localhost:3000/api/offers";
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const user = currentUser.user || {};

if (!user.id) {
  alert("Please login as alumni first!");
  window.location.href = "/frontend/alumni_login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  loadMyOffersAndStats();
});

// ==================== LOAD MY OFFERS + STATS ====================
async function loadMyOffersAndStats() {
  try {
    const res = await fetch(`${API_BASE}?mine=true&alumniId=${user.id}`);
    const data = await res.json();
    if (!data.success) throw new Error("Failed to load your offers");

    const offers = data.data || [];
    const total = offers.length;
    const active = offers.filter(o => o.status === "active").length;
    const applicants = offers.reduce((sum, o) => sum + (o.applicants || 0), 0);

    document.getElementById("totalOffers").textContent = total;
    document.getElementById("activeOffers").textContent = active;
    document.getElementById("closedOffers").textContent = total - active;
    document.getElementById("totalApplicants").textContent = applicants;

    const grid = document.getElementById("my-offers-grid");

    if (offers.length === 0) {
      grid.innerHTML = `
        <p style="grid-column:1/-1; text-align:center; color:#94a3b8; padding:5rem; font-size:1.3rem;">
          You haven't created any offers yet.<br><br>
          <a href="create_offer.html" style="color:#3b82f6; font-weight:600; text-decoration:underline;">Create your first one!</a>
        </p>`;
      return;
    }

    grid.innerHTML = offers.map(o => `
      <div class="offer-card">
        <div class="offer-header">
          <h3 class="offer-title">${escape(o.title)}</h3>
          <span class="offer-status ${o.status}">${o.status}</span>
        </div>
        <p class="offer-category">${escape(o.category)}</p>
        <p class="offer-description">${escape(o.description).substring(0,120)}...</p>
        <div class="offer-meta">
          <span class="applicants">Applicants: ${o.applicants || 0}</span>
          <span class="date">Created: ${formatDate(o.created_at)}</span>
        </div>
        <div class="offer-actions">
          <a href="applications.html?offerId=${o.id}" class="btn-secondary">View Applicants</a>
          <button class="btn-primary edit-btn" onclick="openEditModal(${o.id})">Edit Offer</button>
          <button class="btn-delete delete-btn" onclick="deleteOffer(${o.id})">Delete Offer</button>
        </div>
      </div>
    `).join("");

  } catch (err) {
    console.error(err);
  }
}

// ==================== EDIT OFFER ====================
async function openEditModal(offerId) {
  try {
    const res = await fetch(`${API_BASE}/${offerId}`);
    const data = await res.json();
    if (!data.success) throw new Error("Offer not found");
    const o = data.data;
    if (o.alumni_id !== user.id) return alert("Not authorized");
    document.getElementById("editOfferId").value = o.id;
    document.getElementById("editTitle").value = o.title;
    document.getElementById("editCategory").value = o.category;
    document.getElementById("editStatus").value = o.status;
    document.getElementById("editDescription").value = o.description;
    document.getElementById("editModal").style.display = "flex";
  } catch (err) {
    alert("Error loading offer");
  }
}

document.getElementById("editOfferForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editOfferId").value;
  const payload = {
    title: document.getElementById("editTitle").value,
    category: document.getElementById("editCategory").value,
    description: document.getElementById("editDescription").value,
    status: document.getElementById("editStatus").value,
    alumniId: user.id
  };
  try {
    const res = await fetch(`${API_BASE}/${id}/edit`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    if (result.success) {
      alert("Offer updated!");
      document.getElementById("editModal").style.display = "none";
      loadMyOffersAndStats();
    } else {
      alert("Update failed");
    }
  } catch (err) {
    alert("Update failed");
  }
});

// ==================== DELETE OFFER ====================
async function deleteOffer(offerId) {
  if (!confirm("Delete this offer permanently?")) return;
  try {
    const res = await fetch(`${API_BASE}/${offerId}/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alumniId: user.id })
    });
    const result = await res.json();
    if (result.success) {
      alert("Offer deleted");
      loadMyOffersAndStats();
    } else {
      alert("Delete failed");
    }
  } catch (err) {
    alert("Delete failed");
  }
}

// ==================== UTILITIES ====================
function escape(t) {
  const d = document.createElement("div");
  d.textContent = t || "";
  return d.innerHTML;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// Close modal
document.querySelector(".close-modal")?.addEventListener("click", () => {
  document.getElementById("editModal").style.display = "none";
});
window.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    document.getElementById("editModal").style.display = "none";
  }
});