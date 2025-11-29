// js/alumni_profile.js - FIXED VERSION
console.log("alumni_profile.js is loaded!");

const loginResponse = JSON.parse(localStorage.getItem('currentUser'));
console.log("DEBUG → loginResponse:", loginResponse);

if (!loginResponse || !loginResponse.user) {
    alert('Please login first!');
    window.location.href = '/frontend/alumni_login.html';
}

const loggedInUser = loginResponse.user;
console.log("DEBUG → loggedInUser:", loggedInUser);

async function loadProfile() {
    try {
        // Use the correct ID field from the user object
        const alumniId = loggedInUser.id || loggedInUser.alumni_id;
        console.log("Fetching profile for alumni ID =", alumniId);
        
        const response = await fetch(`/api/alumni-profile?id=${alumniId}`);
        const result = await response.json();
        console.log("Backend response:", result);

        if (result.success) {
            const d = result.data;

            // Map database fields to HTML form fields
            document.getElementById('fullName').value = d.name || '';
            document.getElementById('studentId').value = d.bup_id || '';
            document.getElementById('department').value = d.department || '';
            document.getElementById('batch').value = d.batch || '';
            document.getElementById('graduationYear').value = d.graduation_year || '';
            document.getElementById('alumniStatus').value = d.alumni_status || '';
            document.getElementById('email').value = d.email || '';
            document.getElementById('phone').value = d.phone || '';
            document.getElementById('currentWorkplace').value = d.current_workplace || '';
           document.getElementById('designation').value = d.profession || '';
            document.getElementById('address').value = d.address || '';
            document.getElementById('gender').value = d.gender || '';
            document.getElementById('bloodGroup').value = d.bloodgroup || '';
            document.getElementById('religion').value = d.religion || '';
            document.getElementById('facebook').value = d.facebook || '';
            document.getElementById('linkedin').value = d.linkedin || '';

            console.log("ALUMNI DATA LOADED SUCCESSFULLY!");
        } else {
            console.log("Backend error:", result.message);
        }
    } catch (err) {
        console.error("Error:", err);
        alert("Failed to load alumni profile");
    }
}

// Load profile when page loads
window.onload = loadProfile;