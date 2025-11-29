// ===============================
// CREATE / EDIT / DELETE OFFERS (Frontend JS)
// ===============================

const API_BASE_URL = "http://localhost:3000/api/offers";

// Get logged-in user from localStorage (your login saves full response)
const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
const loggedInAlumni = currentUser.user || {};   // ← This is correct now!

// Debug log
console.log("Current logged-in alumni:", loggedInAlumni);

// Redirect if not logged in
if (!loggedInAlumni.id) {
    alert("You are not logged in. Redirecting to login page...");
    window.location.href = "/frontend/alumni_login.html";
}

// Elements
const createForm = document.getElementById("createOfferForm");
const formMessage = document.getElementById("formMessage");
const successModal = document.getElementById("successModal");
const createdOfferTitle = document.getElementById("createdOfferTitle");
const successClose = document.getElementById("successClose");
const createAnother = document.getElementById("createAnother");

let editingOfferId = null; // Track if we're editing

// ===============================
// CREATE OR UPDATE OFFER
// ===============================
createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("offerTitle").value.trim();
    const category = document.getElementById("offerCategory").value.trim();
    const description = document.getElementById("offerDescription").value.trim();
    const maxApplicants = document.getElementById("maxApplicants").value || null;
    const schedule = document.getElementById("offerSchedule").value.trim();
    const status = document.getElementById("offerStatus").value;

    if (!title || !category || !description || !status) {
        showMessage("Please fill all required fields", "error");
        return;
    }

    const offerData = {
        title,
        category,
        description,
        max: maxApplicants,
        schedule,
        status,
        alumniId: loggedInAlumni.id  // ← This is sent to backend
    };

    try {
        let url = `${API_BASE_URL}/create`;
        let method = "POST";

        if (editingOfferId) {
            url = `${API_BASE_URL}/${editingOfferId}/edit`;
            method = "PUT";
        }

        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(offerData)
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to save offer", "error");
            return;
        }

        showMessage(
            editingOfferId ? "Offer updated successfully!" : "Offer created successfully!",
            "success"
        );

        createdOfferTitle.textContent = title;
        successModal.setAttribute("aria-hidden", "false");
        createForm.reset();
        editingOfferId = null;

        // Optional: reload offers list
        setTimeout(() => location.reload(), 2000);

    } catch (err) {
        console.error("Error:", err);
        showMessage("Network error. Please try again.", "error");
    }
});

// ===============================
// EDIT OFFER (populate form)
// ===============================
async function editOffer(offerId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${offerId}`, {
            credentials: "include"
        });
        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to load offer", "error");
            return;
        }

        const offer = data.data;

        // Check ownership
        if (offer.alumni_id !== loggedInAlumni.id) {
            showMessage("You can only edit your own offers", "error");
            return;
        }

        editingOfferId = offerId;
        document.getElementById("offerTitle").value = offer.title;
        document.getElementById("offerCategory").value = offer.category;
        document.getElementById("offerDescription").value = offer.description;
        document.getElementById("maxApplicants").value = offer.max || "";
        document.getElementById("offerSchedule").value = offer.schedule || "";
        document.getElementById("offerStatus").value = offer.status;

        createdOfferTitle.textContent = `Editing: ${offer.title}`;
        successModal.setAttribute("aria-hidden", "false");

    } catch (err) {
        console.error("Edit error:", err);
        showMessage("Failed to load offer for editing", "error");
    }
}

// ===============================
// DELETE OFFER
// ===============================
async function deleteOffer(offerId) {
    if (!confirm("Are you sure you want to delete this offer? This cannot be undone.")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${offerId}/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ alumniId: loggedInAlumni.id })
        });

        const data = await response.json();

        if (!response.ok) {
            showMessage(data.message || "Failed to delete offer", "error");
            return;
        }

        showMessage("Offer deleted successfully!", "success");
        setTimeout(() => location.reload(), 1500);

    } catch (err) {
        console.error("Delete error:", err);
        showMessage("Network error", "error");
    }
}

// ===============================
// MODAL CONTROLS
// ===============================
successClose.addEventListener("click", () => {
    successModal.setAttribute("aria-hidden", "true");
    createForm.reset();
    editingOfferId = null;
});

createAnother.addEventListener("click", () => {
    successModal.setAttribute("aria-hidden", "true");
    createForm.reset();
    editingOfferId = null;
});

// ===============================
// HELPER: Show message
// ===============================
function showMessage(message, type) {
    formMessage.textContent = message;
    formMessage.style.display = "block";
    formMessage.style.color = type === "error" ? "#e74c3c" : "#27ae60";
    formMessage.style.backgroundColor = type === "error" ? "#fadad7" : "#d4edda";
    formMessage.style.padding = "12px";
    formMessage.style.borderRadius = "8px";

    setTimeout(() => {
        formMessage.style.display = "none";
    }, 5000);
}

// Expose functions to window (for inline onclick in HTML)
window.editOffer = editOffer;
window.deleteOffer = deleteOffer;

// Optional: Welcome message
console.log(`Welcome, ${loggedInAlumni.name || "Alumni"}! Ready to create mentorship offers.`);