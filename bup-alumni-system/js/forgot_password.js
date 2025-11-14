/**
 * BUP Alumni System - Forgot Password JavaScript
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Form submission handler
document.getElementById('forgotPasswordForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    
    // Client-side validation
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
        showMessage(validationErrors.join('\n'), 'error');
        return;
    }
    
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        console.log('🔄 Sending forgot password request...', formData);
        const response = await sendResetLink(formData);
        
        if (response.success) {
            showMessage('Password reset link has been sent to your email! Please check your inbox.', 'success');
            // Clear form
            document.getElementById('forgotPasswordForm').reset();
        } else {
            showMessage(response.message || 'Failed to send reset link', 'error');
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        showMessage(error.message || 'An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Helper functions
function collectFormData() {
    return {
        email: document.getElementById('email').value.trim(),
        userType: document.getElementById('userType').value
    };
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.email) {
        errors.push('Email address is required');
    } else if (!isValidEmail(formData.email)) {
        errors.push('Please enter a valid email address');
    }
    
    if (!formData.userType) {
        errors.push('Please select your account type');
    }
    
    return errors;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function sendResetLink(formData) {
    console.log('🌐 Making API call to:', `${API_BASE_URL}/auth/forgot-password`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
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
            throw new Error('Server returned invalid response');
        }
        
        if (!response.ok) {
            console.error('❌ HTTP Error:', response.status, data);
            throw new Error(data.message || `Server error (${response.status})`);
        }
        
        console.log('✅ Reset link sent successfully');
        return data;
    } catch (error) {
        console.error('❌ Network error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running.');
        }
        throw error;
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Forgot password page loaded successfully');
    console.log('🔗 API Base URL:', API_BASE_URL);
});