// frontend/js/browse_offers.js
// Updated: always show Register button (if offer not full), but check login on click.

const API_BASE = "/api/offers"; // relative path — works in production too

const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
// Try the common shapes where student id might live:
const studentId = currentUser.studentId || currentUser?.user?.student_id || currentUser?.student_id;

console.log("browse_offers: currentUser =", currentUser);
console.log("browse_offers: studentId =", studentId);

document.addEventListener("DOMContentLoaded", async () => {
  await loadActiveOffers();
});

async function loadActiveOffers() {
  try {
    const res = await fetch(API_BASE);
    const result = await res.json();

    // if result.success is present, prefer that structure; otherwise try array directly
    const offers = result?.data ?? (Array.isArray(result) ? result : []);

    if (!offers || offers.length === 0) {
      document.getElementById("noOffers").style.display = "block";
      return;
    }

    // Only show non-closed offers
    const activeOffers = offers.filter(o => o.status !== "closed");
    if (activeOffers.length === 0) {
      document.getElementById("noOffers").style.display = "block";
      return;
    }

    renderOffers(activeOffers);
  } catch (err) {
    console.error("Error loading offers:", err);
    document.getElementById("noOffers").innerHTML = "<p>Failed to load offers.</p>";
    document.getElementById("noOffers").style.display = "block";
  }
}

function renderOffers(offers) {
  const container = document.getElementById("offers-section");
  container.innerHTML = offers.map(offer => {
    const maxField = offer.max_applicants ?? offer.max ?? offer.maxApplicants ?? null;
    const applicantsCount = offer.applicants ?? 0;
    const isFull = maxField && applicantsCount >= maxField;

    // Use standardized ids returned by your API; try several fallbacks for flexibility:
    const offerId = offer.id ?? offer.offer_id ?? offer.offerId ?? offer.ID;

    // Escape values for safety
    const safeTitle = escapeHtml(offer.title || "");
    const safeAlumni = escapeHtml(offer.alumni_name || offer.mentor_name || offer.name || "Mentor");
    const safeCategory = escapeHtml(offer.category || "");
    const slotsText = `${applicantsCount} / ${maxField || "Unlimited"}`;

    // Always render Register button (unless full). If user not logged, clicking will redirect.
    return `
      <div class="offer-card">
        <h3>${safeTitle}</h3>
        <p><strong>Mentor:</strong> ${safeAlumni}</p>
        <p><strong>Category:</strong> ${safeCategory}</p>
        <p><strong>Slots:</strong> ${slotsText}</p>

        <div style="margin-top: 1rem; display: flex; gap: 8px;">
          <button class="view-btn" onclick="openOfferDetails(${offerId})">
            View Details ${isFull ? "(Full)" : ""}
          </button>

          ${isFull ? `
            <button class="view-btn register-btn" disabled title="Offer full">Register</button>
          ` : `
            <button class="view-btn register-btn" onclick="event.stopPropagation(); handleRegisterClick(${offerId}, '${safeTitle.replace(/'/g, "\\'")}','${safeAlumni.replace(/'/g, "\\'")}')">
              Register
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Single handler for Register clicks
window.handleRegisterClick = function(offerId, title, alumniName) {
  // If user not logged in as student -> redirect to student login and show message
  if (!studentId) {
    alert("You must be logged in as a student to register. Redirecting to login page...");
    // store a return-to url if you want the user to come back after login:
    try {
      localStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);
    } catch (e) {
      // ignore
    }
    window.location.href = "../student_login.html";
    return;
  }

  // open registration modal (uses existing function)
  openRegisterModal(offerId, title, alumniName);
};

// Open full details modal (unchanged)
function openOfferDetails(offerId) {
  fetch(`${API_BASE}/${offerId}`)
    .then(r => r.json())
    .then(res => {
      // adapt to the response structure
      const ok = (res && (res.success === undefined || res.success === true));
      if (!ok) throw new Error("Offer fetch failed");
      const o = res.data ?? res; // handle either { success:true, data: {...} } or bare object
      const modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.innerHTML = `
        <div class="modal">
          <button class="close-btn" onclick="this.closest('.modal-overlay').remove()">×</button>
          <h2>${escapeHtml(o.title || "")}</h2>
          <p><strong>Mentor:</strong> ${escapeHtml(o.alumni_name || o.mentor_name || o.name || "")}</p>
          <p><strong>Category:</strong> ${escapeHtml(o.category || "")}</p>
          <p><strong>Description:</strong><br>${escapeHtml(o.description || "").replace(/\n/g, "<br>")}</p>
        </div>
      `;
      document.body.appendChild(modal);
      modal.style.display = "flex";
    })
    .catch(err => {
      console.error("openOfferDetails error:", err);
      alert("Offer not found");
    });
}

// Register Modal Functions (unchanged from your existing code)
let currentOfferId = null;

window.openRegisterModal = function(offerId, title, alumniName) {
  currentOfferId = offerId;
  document.getElementById("modalTitle").textContent = title;
  document.getElementById("modalAlumni").textContent = alumniName;
  document.getElementById("registerModal").classList.add("active");
};

window.closeRegisterModal = function() {
  document.getElementById("registerModal").classList.remove("active");
  document.getElementById("registerMessage").value = "";
};

// Submit Registration
document.getElementById("submitRegister").addEventListener("click", async () => {
  const message = document.getElementById("registerMessage").value.trim();
  if (!message) return alert("Please write your message");

  const btn = document.getElementById("submitRegister");
  btn.disabled = true;
  btn.textContent = "Submitting...";

  try {
    const res = await fetch("/api/offers/apply", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-student-id": studentId,
        "x-user-type": "student"
      },
      body: JSON.stringify({ offerId: currentOfferId, message })
    });

    const data = await res.json();
    if (data.success) {
      alert("Registration sent successfully! Mentor will review it.");
      closeRegisterModal();
    } else {
      alert(data.message || "Failed to register");
    }
  } catch (err) {
    console.error("submitRegister error:", err);
    alert("Network error. Try again.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Submit Registration";
  }
});

// Utils
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text || "";
  return div.innerHTML;
}
