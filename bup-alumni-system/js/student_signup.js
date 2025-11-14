/**
 * BUP Alumni System - Student Signup JavaScript
 * Simplified version without OTP
 */

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';
// Form submission handler
document.getElementById('studentSignupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = collectFormData();
    
    // Client-side validation
    const validationErrors = validateFormData(formData);
    if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
    
    try {
        console.log('🔄 Sending registration request...', formData);
        const response = await registerStudent(formData);
        
        if (response.success) {
            // Clear stored form data on successful registration
            clearStoredFormData();
            alert('🎉 Registration completed successfully!\n\nYou can now login with your Student ID and password.');
            window.location.href = 'student_login.html';
        } else {
            alert('❌ Registration failed: ' + (response.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('❌ Registration failed: ' + (error.message || 'Please check console for details'));
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
});

// Helper functions
function collectFormData() {
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        studentId: document.getElementById('studentId').value.trim(),
        department: document.getElementById('department').value.trim(),
        batch: document.getElementById('batch').value,
        currentYear: document.getElementById('currentYear').value,
        address: document.getElementById('address').value.trim(),
        religion: document.getElementById('religion').value,
        bloodgroup: document.getElementById('bloodgroup').value,
        gender: getRadioValue('gender'),
        facebook: document.getElementById('facebook').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value
    };
}

function getRadioValue(name) {
    const radios = document.getElementsByName(name);
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
    return null;
}

function validateFormData(formData) {
    const errors = [];
    
    if (!formData.name) errors.push('Name is required');
    if (!formData.email || !isValidEmail(formData.email)) errors.push('Valid email is required');
    if (!formData.studentId) errors.push('Student ID is required');
    if (!formData.department) errors.push('Department is required');
    if (!formData.batch) errors.push('Batch is required');
    if (!formData.currentYear) errors.push('Current year/semester is required');
    if (!formData.phone || !isValidBangladeshiPhone(formData.phone)) errors.push('Valid Bangladeshi phone number is required');
    if (!formData.password || formData.password.length < 8) errors.push('Password must be at least 8 characters');
    if (!formData.gender) errors.push('Gender is required');
    if (!formData.bloodgroup) errors.push('Blood group is required');
    if (!formData.religion) errors.push('Religion is required');
    
    // Password confirmation check
    const confirmPassword = document.getElementById('confirmPassword').value;
    if (formData.password !== confirmPassword) {
        errors.push('Passwords do not match');
    }
    
    return errors;
}

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidBangladeshiPhone(phone) {
    // Bangladeshi phone number regex: +8801XXXXXXXXX or 01XXXXXXXXX
    const phoneRegex = /^(\+8801|01)[3-9]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Form field persistence functions
function storeFormData() {
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        studentId: document.getElementById('studentId').value.trim(),
        department: document.getElementById('department').value.trim(),
        batch: document.getElementById('batch').value,
        currentYear: document.getElementById('currentYear').value,
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        religion: document.getElementById('religion').value,
        bloodgroup: document.getElementById('bloodgroup').value,
        gender: getRadioValue('gender'),
        facebook: document.getElementById('facebook').value.trim(),
        linkedin: document.getElementById('linkedin').value.trim(),
        timestamp: Date.now()
    };
    localStorage.setItem('student_signup_data', JSON.stringify(formData));
}

function restoreFormData() {
    const stored = localStorage.getItem('student_signup_data');
    if (stored) {
        const formData = JSON.parse(stored);
        
        // Check if data is not too old (24 hours)
        if (Date.now() - formData.timestamp < 24 * 60 * 60 * 1000) {
            document.getElementById('name').value = formData.name || '';
            document.getElementById('email').value = formData.email || '';
            document.getElementById('studentId').value = formData.studentId || '';
            document.getElementById('department').value = formData.department || '';
            document.getElementById('batch').value = formData.batch || '';
            document.getElementById('currentYear').value = formData.currentYear || '';
            document.getElementById('phone').value = formData.phone || '';
            document.getElementById('address').value = formData.address || '';
            document.getElementById('religion').value = formData.religion || '';
            document.getElementById('bloodgroup').value = formData.bloodgroup || '';
            
            // Set radio button
            if (formData.gender) {
                const radio = document.querySelector(`input[name="gender"][value="${formData.gender}"]`);
                if (radio) radio.checked = true;
            }
            
            document.getElementById('facebook').value = formData.facebook || '';
            document.getElementById('linkedin').value = formData.linkedin || '';
            
            console.log('Form data restored from localStorage');
        } else {
            // Clear old data
            clearStoredFormData();
        }
    }
}

function clearStoredFormData() {
    localStorage.removeItem('student_signup_data');
}

// Real-time validation and auto-save
function setupRealTimeValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        // Auto-save on input change
        input.addEventListener('input', function() {
            storeFormData();
        });
        
        // Real-time validation for specific fields
        if (input.type === 'email') {
            input.addEventListener('blur', function() {
                if (this.value && !isValidEmail(this.value)) {
                    this.style.borderColor = 'var(--error-color)';
                    showFieldError(this, 'Please enter a valid email address');
                } else {
                    this.style.borderColor = '';
                    clearFieldError(this);
                }
            });
        }
        
        if (input.id === 'phone') {
            input.addEventListener('blur', function() {
                if (this.value && !isValidBangladeshiPhone(this.value)) {
                    this.style.borderColor = 'var(--error-color)';
                    showFieldError(this, 'Please enter a valid Bangladeshi phone number (e.g., +8801XXXXXXXXX or 01XXXXXXXXX)');
                } else {
                    this.style.borderColor = '';
                    clearFieldError(this);
                }
            });
        }
    });
    
    // Password confirmation validation
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    confirmPasswordInput.addEventListener('input', function() {
        const password = passwordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && password !== confirmPassword) {
            this.style.borderColor = 'var(--error-color)';
            showFieldError(this, 'Passwords do not match');
        } else {
            this.style.borderColor = '';
            clearFieldError(this);
        }
    });
}

function showFieldError(input, message) {
    clearFieldError(input);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.25rem';
    input.parentNode.appendChild(errorDiv);
}

function clearFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error-message');
    if (existingError) {
        existingError.remove();
    }
}

async function registerStudent(formData) {
    console.log('🌐 Making API call to:', `${API_BASE_URL}/students/register`);
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/register`, {
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
        
        console.log('✅ Registration successful:', data);
        return data;
    } catch (error) {
        console.error('❌ Network error:', error);
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Cannot connect to server. Please make sure the backend is running on port 3000.');
        }
        throw error;
    }
}

// Initialize batch dropdown
document.addEventListener('DOMContentLoaded', function() {
    const batchSelect = document.getElementById('batch');
    const currentYear = new Date().getFullYear();
    
    // Clear existing options except the first one
    while (batchSelect.options.length > 1) {
        batchSelect.remove(1);
    }
    
    for (let year = 2022; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        batchSelect.appendChild(option);
    }
    
    // Department autocomplete
    initializeDepartmentAutocomplete();
    
    // Restore form data
    restoreFormData();
    
    // Setup real-time validation and auto-save
    setupRealTimeValidation();
    
    console.log('✅ Student signup page loaded successfully');
    console.log('🔗 API Base URL:', API_BASE_URL);
    
    // Test server connection
    testServerConnection();
});

// Test server connection
async function testServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Server connection test:', data);
        
        if (!response.ok) {
            alert('⚠️ Server is running but returned an error. Check server logs.');
        }
    } catch (error) {
        console.error('❌ Server connection test failed:', error);
        alert('⚠️ Warning: Cannot connect to server. Please make sure the backend server is running on port 3000.');
    }
}

// Department autocomplete functionality
function initializeDepartmentAutocomplete() {
    const departments = [
        "Department of Computer Science and Engineering",
        "Department of Environmental Science",
        "Department of Information and Communication Engineering",
        "Department of Sociology",
        "Department of Business Administration",
        "Department of Economics",
        "Department of Public Administration",
        "Department of International Relations",
        "Department of Development Studies",
        "Department of Mass Communication and Journalism",
        "Department of Peace, Conflict and Human Rights",
        "Department of Management Studies",
        "Department of Accounting and Information Systems",
        "Department of Finance and Banking",
        "Department of English",
        "Department of Law",
        "Department of Environmental Science",
        "Department of Pharmacy",
        "Department of Public Health"
    ];
    
    const departmentInput = document.getElementById('department');
    const autocompleteList = document.getElementById('department-autocomplete-list');
    
    if (!departmentInput || !autocompleteList) {
        console.error('Department input or autocomplete list not found');
        return;
    }
    
    departmentInput.addEventListener('input', function() {
        const input = this.value.toLowerCase();
        autocompleteList.innerHTML = '';
        
        if (!input) return;
        
        const filteredDepartments = departments.filter(dept => 
            dept.toLowerCase().includes(input)
        );
        
        filteredDepartments.forEach(dept => {
            const item = document.createElement('div');
            item.textContent = dept;
            item.addEventListener('click', function() {
                departmentInput.value = dept;
                autocompleteList.innerHTML = '';
                storeFormData(); // Save after selection
            });
            autocompleteList.appendChild(item);
        });
    });
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target !== departmentInput) {
            autocompleteList.innerHTML = '';
        }
    });
}