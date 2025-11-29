/**
 * BUP Alumni System - Student Login JavaScript
 */

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// Form submission handler
document.getElementById('studentLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    
    // Client-side validation
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
        showError(validationErrors.join('\n'));
        return;
    }
    
    const loginBtn = document.querySelector('.btn-login');
    const originalText = loginBtn.textContent;
    loginBtn.disabled = true;
    loginBtn.textContent = 'Logging in...';
    
    try {
        console.log('🔄 Sending login request...', { studentId: formData.studentId });
        const response = await loginStudent(formData);
        
        if (response.success) {
            // Store user data in localStorage
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('userRole', 'student');
            
            console.log('✅ Login successful:', response.user);
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to student dashboard
            setTimeout(() => {
                window.location.href = '/frontend/student_home.html';
            }, 1500);
            
        } else {
            showError(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'An error occurred during login. Please try again.');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = originalText;
    }
});

// Helper functions
function collectFormData() {
    return {
        studentId: document.getElementById('studentId').value.trim(),
        password: document.getElementById('password').value
    };
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.studentId) errors.push('Student ID is required');
    if (!formData.password) errors.push('Password is required');
    
    return errors;
}

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'var(--error-color)';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.color = 'var(--success-color)';
}

async function loginStudent(formData) {
    console.log('🌐 Making API call to:', `${API_BASE_URL}/students/login`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        console.log('📨 Response status:', response.status);
        
        const responseText = await response.text();
        console.log('📨 Raw response:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error('❌ Failed to parse JSON response:', parseError);
            throw new Error('Server returned invalid JSON response');
        }
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, data);
            throw new Error(data.message || `Server error (${response.status})`);
        }
        
        console.log('✅ Login successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Network error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running on port 3000.');
        }
        throw error;
    }
}

// Password toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? 'Show' : 'Hide';
        });
    }
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem('currentUser');
    const userRole = localStorage.getItem('userRole');
    
    if (currentUser && userRole === 'student') {
        console.log('User already logged in:', JSON.parse(currentUser));
        // Optionally auto-redirect or show welcome message
    }
    
    console.log('✅ Student login page loaded successfully');
    console.log('🔗 API Base URL:', API_BASE_URL);
});

