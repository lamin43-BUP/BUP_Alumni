// js/student_profile.js → FINAL 100% WORKING VERSION FOR YOUR HTML

console.log("student_profile.js is loaded!");

const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
console.log("DEBUG → currentUser:", loggedInUser);

if (!loggedInUser || loggedInUser.role !== 'student') {
    alert('Please login as a student first!');
    window.location.href = '/frontend/student_login.html';
}

async function loadProfile() {
    try {
        console.log("Fetching profile for student_id =", loggedInUser.id);
        const response = await fetch(`/api/student-profile?id=${loggedInUser.id}`);
        const result = await response.json();
        console.log("Backend response:", result);

        if (result.success) {
            const d = result.data;  // short name

            // THESE IDs MATCH YOUR HTML EXACTLY
            document.getElementById('fullName').value     = d.name || '';
            document.getElementById('studentId').value    = d.bup_id || '';
            document.getElementById('department').value   = d.department || '';
            document.getElementById('batch').value        = d.batch || '';
            document.getElementById('currentYear').value  = d.current_year || '';
            document.getElementById('email').value        = d.email || '';
            document.getElementById('phone').value        = d.phone || '';
            document.getElementById('address').value      = d.address || '';
            document.getElementById('gender').value       = d.gender || '';
            document.getElementById('bloodGroup').value   = d.bloodgroup || '';
            document.getElementById('religion').value     = d.religion || '';
            document.getElementById('facebook').value     = d.facebook || '';
            document.getElementById('linkedin').value     = d.linkedin || '';
            // twitter & github are not in DB yet → leave as is

            console.log("ALL REAL DATA LOADED SUCCESSFULLY!");
        }
    } catch (err) {
        console.error(err);
        alert("Failed to load profile");
    }
}

// Save button (you already have Edit → Save buttons in HTML)
document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const updated = {
        student_id: loggedInUser.id,
        name:        document.getElementById('fullName').value,
        email:       document.getElementById('email').value,
        phone:       document.getElementById('phone').value,
        department:  document.getElementById('department').value,
        batch:       document.getElementById('batch').value,
        current_year:document.getElementById('currentYear').value,
        address:     document.getElementById('address').value,
        gender:      document.getElementById('gender').value,
        bloodgroup:  document.getElementById('bloodGroup').value,
        religion:    document.getElementById('religion').value,
        facebook:    document.getElementById('facebook').value,
        linkedin:    document.getElementById('linkedin').value
    };

    try {
        const res = await fetch('/api/student-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
        const json = await res.json();
        if (json.success) alert('Profile saved successfully!');
        else alert('Save failed');
    } catch (err) {
        alert('Network error');
    }
});

// Edit button → make fields editable
document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('#profileForm input, #profileForm textarea');
    inputs.forEach(i => i.removeAttribute('readonly'));
    document.getElementById('editProfileBtn').style.display = 'none';
    document.getElementById('saveProfileBtn').style.display = 'inline-block';
    document.getElementById('cancelEditBtn').style.display = 'inline-block';
});

// Cancel button → reload page
document.getElementById('cancelEditBtn')?.addEventListener('click', () => location.reload());

window.onload = loadProfile;