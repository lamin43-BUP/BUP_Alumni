/**
 * BUP Alumni System - Reset Password JavaScript
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Form submission handler
document.getElementById('resetPasswordForm').addEventListener('submit', async function(e) {
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
    submitBtn.textContent = 'Resetting...';
    
    try {
        console.log('🔄 Sending reset password request...');
        const response = await resetPassword(formData);
        
        if (response.success) {
            showMessage('Password reset successfully! Redirecting to login...', 'success');
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                window.location.href = '/frontend/login_select.html';
            }, 3000);
        } else {
            showMessage(response.message || 'Failed to reset password', 'error');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        showMessage(error.message || 'An error occurred. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Helper functions
function collectFormData() {
    return {
        token: document.getElementById('token').value,
        userType: document.getElementById('userType').value,
        newPassword: document.getElementById('newPassword').value,
        confirmPassword: document.getElementById('confirmPassword').value
    };
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.token) {
        errors.push('Invalid reset token');
    }
    
    if (!formData.userType) {
        errors.push('Invalid user type');
    }
    
    if (!formData.newPassword) {
        errors.push('New password is required');
    } else if (formData.newPassword.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    if (!formData.confirmPassword) {
        errors.push('Please confirm your password');
    } else if (formData.newPassword !== formData.confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return errors;
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Scroll to message
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function resetPassword(formData) {
    console.log('🌐 Making API call to:', `${API_BASE_URL}/auth/reset-password`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
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
        
        console.log('✅ Password reset successfully');
        return data;
    } catch (error) {
        console.error('❌ Network error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running.');
        }
        throw error;
    }
}



// Add this function to verify token on page load
async function verifyResetToken(token, userType) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-reset-token?token=${token}&userType=${userType}`);
        const data = await response.json();
        
        if (!data.valid) {
            showMessage('Invalid or expired reset link. Please request a new one.', 'error');
            return false;
        }
        return true;
    } catch (error) {
        console.error('Token verification error:', error);
        showMessage('Error verifying reset link. Please try again.', 'error');
        return false;
    }
}

// Update the getTokenFromURL function
async function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userType = urlParams.get('type');
    
    if (!token || !userType) {
        showMessage('Invalid reset link. Please request a new one.', 'error');
        return false;
    }
    
    document.getElementById('token').value = token;
    document.getElementById('userType').value = userType;
    
    // Verify token is valid
    return await verifyResetToken(token, userType);
}



// Extract token from URL and validate
function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userType = urlParams.get('type');
    
    if (!token || !userType) {
        showMessage('Invalid or expired reset link. Please request a new one.', 'error');
        return false;
    }
    
    document.getElementById('token').value = token;
    document.getElementById('userType').value = userType;
    
    return true;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Reset password page loaded successfully');
    console.log('🔗 API Base URL:', API_BASE_URL);
    
    // Get token from URL
    if (!getTokenFromURL()) {
        document.querySelector('.btn-primary').disabled = true;
    }
});