// main.js - Main JavaScript functionality
(function() {
    'use strict';

    // Mobile menu toggle
    function initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navList = document.querySelector('.nav-list');

        if (mobileMenuToggle && navList) {
            mobileMenuToggle.addEventListener('click', () => {
                navList.classList.toggle('active');
            });

            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (navList.classList.contains('active')) {
                        navList.classList.remove('active');
                    }
                });
            });
        }
    }

    // ====================== NOTIFICATION SYSTEM ======================
    async function loadNotifications() {
        const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
        const user = currentUser.user || currentUser;

        if (!user || !user.id) return;

        try {
            const res = await fetch("/api/notifications", {
                headers: {
                    "x-user-id": user.id || user.student_id || user.alumni_id,
                    "x-user-type": user.type || (user.student_id ? "student" : "alumni")
                }
            });

            const data = await res.json();
            if (!data.success) return;

            const badge = document.getElementById("notifBadge");
            const list = document.getElementById("notifList");

            if (data.unreadCount > 0) {
                badge.textContent = data.unreadCount > 99 ? "99+" : data.unreadCount;
                badge.style.display = "flex";
            } else {
                badge.style.display = "none";
            }

            if (data.notifications.length === 0) {
                list.innerHTML = '<div class="notif-empty">No new notifications</div>';
                return;
            }

            list.innerHTML = data.notifications.map(n => `
                <div class="notif-item ${n.is_read === 0 ? 'unread' : ''}">
                    <strong>${n.title}</strong>
                    <p>${n.message}</p>
                    ${n.offer_title ? `<small>Mentorship: ${n.offer_title}</small><br>` : ""}
                    <small>${new Date(n.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                    })}</small>
                </div>
            `).join("");

        } catch (err) {
            console.error("Notification load error:", err);
        }
    }

    // Toggle notification dropdown
    function initNotifications() {
        const bell = document.getElementById("notifBell");
        const dropdown = document.getElementById("notifDropdown");
        const markAll = document.getElementById("markAllRead");

        if (!bell || !dropdown) return;

        bell.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
            if (dropdown.classList.contains("show")) {
                loadNotifications();
            }
        });

        markAll?.addEventListener("click", async () => {
            await fetch("/api/notifications/read-all", { method: "PUT" });
            loadNotifications();
        });

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (!bell.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove("show");
            }
        });
    }

    // Initialize everything
    document.addEventListener('DOMContentLoaded', () => {
        initMobileMenu();
        initNotifications();
        loadNotifications(); // Auto load on every page
    });

    // Export for components.js if needed
    window.initializeComponents = () => {
        initMobileMenu();
        initNotifications();
        loadNotifications();
    };

})();