/**
 * BUP Alumni System - Alumni Directory JavaScript
 * Handles alumni data fetching, filtering, and modal display
 */

class AlumniDirectory {
    constructor() {
        this.alumniData = [];
        this.filteredData = [];
        this.currentFilters = {
            name: '',
            department: '',
            batch: '',
            location: ''
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadAlumniData();
    }

    bindEvents() {
        // Filter events
        document.getElementById('filterName').addEventListener('input', (e) => {
            this.currentFilters.name = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterDept').addEventListener('change', (e) => {
            this.currentFilters.department = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterBatch').addEventListener('change', (e) => {
            this.currentFilters.batch = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filterLocation').addEventListener('input', (e) => {
            this.currentFilters.location = e.target.value;
            this.applyFilters();
        });

        // Button events with click effects
        document.getElementById('applyFilters').addEventListener('click', (e) => {
            this.addClickEffect(e.target);
            this.applyFilters();
        });

        document.getElementById('clearFilters').addEventListener('click', (e) => {
            this.addClickEffect(e.target);
            this.clearFilters();
        });

        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeModal').addEventListener('click', (e) => {
            this.addClickEffect(e.target);
            this.closeModal();
        });

        // Close modal when clicking outside
        document.getElementById('alumniModal').addEventListener('click', (e) => {
            if (e.target.id === 'alumniModal') {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    // Add click effect to buttons
    addClickEffect(button) {
        button.classList.add('clicked');
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 200);
    }

    async loadAlumniData() {
    this.showLoading(true);
    this.hideError();
    this.hideNoResults();

    try {
        console.log('🔍 Fetching alumni data from API...');
        
        // Use relative paths that work with your current setup
        const endpoints = [
            '/api/alumni/directory',
            '/api/alumni',
            'http://localhost:3000/api/alumni/directory',
            'http://localhost:3000/api/alumni'
        ];
        
        let response;
        let lastError;
        
        for (const endpoint of endpoints) {
            try {
                console.log(`🔄 Trying endpoint: ${endpoint}`);
                response = await fetch(endpoint, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    mode: 'cors'
                });
                
                if (response.ok) {
                    console.log(`✅ Success with endpoint: ${endpoint}`);
                    break;
                } else {
                    lastError = `HTTP error! status: ${response.status}`;
                    console.log(`❌ Failed with endpoint: ${endpoint} - ${lastError}`);
                }
            } catch (error) {
                lastError = error.message;
                console.log(`❌ Error with endpoint: ${endpoint} - ${lastError}`);
            }
        }

        if (!response || !response.ok) {
            throw new Error(lastError || 'All API endpoints failed. Make sure your Node.js server is running on port 3000.');
        }

        const result = await response.json();
        console.log('✅ API Response received:', result);

        if (result.success && result.data) {
            this.alumniData = result.data;
            this.filteredData = [...this.alumniData];
            this.renderAlumniGrid();
            this.updateAlumniCount();
            
            if (this.alumniData.length === 0) {
                this.showNoResults('No alumni records found in the database.');
            } else {
                console.log(`✅ Loaded ${this.alumniData.length} alumni records`);
            }
        } else {
            throw new Error(result.message || 'No data received from server');
        }
    } catch (error) {
        console.error('❌ Error loading alumni data:', error);
        this.showError(`Failed to load alumni data: ${error.message}. 
        
Make sure:
1. Your Node.js server is running on port 3000
2. Run this command in your project: npm start
3. Then refresh this page`);
        
        // Clear any existing data
        this.alumniData = [];
        this.filteredData = [];
        this.renderAlumniGrid();
        this.updateAlumniCount();
    } finally {
        this.showLoading(false);
    }
}
    applyFilters() {
    if (this.alumniData.length === 0) {
        this.showNoResults('No alumni data available. Please check server connection.');
        return;
    }

    console.log('🔍 Applying filters:', this.currentFilters);

    // Use AND logic for individual filtering
    this.filteredData = this.alumniData.filter(alumni => {
        // If no filters are active, show all alumni
        const noFiltersActive = !this.currentFilters.name && 
            !this.currentFilters.department && 
            !this.currentFilters.batch && 
            !this.currentFilters.location;
        
        if (noFiltersActive) {
            return true;
        }

        // Check if ALL active filters match (AND logic)
        const nameMatch = !this.currentFilters.name || 
            (alumni.name && alumni.name.toLowerCase().includes(this.currentFilters.name.toLowerCase()));
        
        const deptMatch = !this.currentFilters.department || 
            (alumni.department && alumni.department === this.currentFilters.department);
        
        const batchMatch = !this.currentFilters.batch || 
            (alumni.batch && alumni.batch.toString() === this.currentFilters.batch);
        
        const locationMatch = !this.currentFilters.location || 
            (alumni.address && alumni.address.toLowerCase().includes(this.currentFilters.location.toLowerCase()));

        // Return true only if ALL active filters match
        const matches = nameMatch && deptMatch && batchMatch && locationMatch;
        
        if (matches) {
            console.log(`✅ Alumni matches filters: ${alumni.name}`);
        }
        
        return matches;
    });

    console.log(`📊 Filter results: ${this.filteredData.length} alumni found`);
    this.renderAlumniGrid();
    this.updateAlumniCount();
}

    clearFilters() {
        document.getElementById('filterName').value = '';
        document.getElementById('filterDept').value = '';
        document.getElementById('filterBatch').value = '';
        document.getElementById('filterLocation').value = '';

        this.currentFilters = {
            name: '',
            department: '',
            batch: '',
            location: ''
        };

        this.filteredData = [...this.alumniData];
        this.renderAlumniGrid();
        this.updateAlumniCount();
    }

    renderAlumniGrid() {
    const grid = document.getElementById('alumniGrid');
    
    if (this.filteredData.length === 0) {
        this.showNoResults('No alumni found matching your search criteria.');
        grid.innerHTML = '';
        return;
    }

    this.hideNoResults();

    grid.innerHTML = this.filteredData.map(alumni => `
        <div class="alumni-card" role="listitem" data-alumni-id="${alumni.alumni_id}">
            <div class="alumni-card-content">
                <div class="alumni-basic-info">
                    <h3 class="alumni-name">${this.escapeHtml(alumni.name)}</h3>
                    <p class="alumni-dept">${this.escapeHtml(alumni.department)}</p>
                    <p class="alumni-batch">Batch: ${alumni.batch}</p>
                    ${alumni.current_workplace ? `<p class="alumni-workplace">🏢 ${this.escapeHtml(alumni.current_workplace)}</p>` : ''}
                    ${alumni.profession ? `<p class="alumni-profession">💼 ${this.escapeHtml(alumni.profession)}</p>` : ''}
                </div>
                <button class="view-profile-btn" onclick="alumniDirectory.viewAlumniDetails(${alumni.alumni_id})">
                    View Full Profile
                </button>
            </div>
        </div>
    `).join('');
}

    viewAlumniDetails(alumniId) {
        const alumni = this.alumniData.find(a => a.alumni_id === alumniId);
        if (!alumni) return;

        this.populateModal(alumni);
        this.showModal();
    }

    populateModal(alumni) {
        // Basic info
        document.getElementById('modalName').textContent = alumni.name || 'Not provided';
        document.getElementById('modalDept').textContent = alumni.department || 'Not provided';
        document.getElementById('modalBatch').textContent = `Batch: ${alumni.batch || 'Not provided'}`;
        
        // Contact information
        document.getElementById('modalEmail').textContent = alumni.email || 'Not provided';
        document.getElementById('modalPhone').textContent = alumni.phone || 'Not provided';
        document.getElementById('modalLocation').textContent = alumni.address || 'Not provided';
        
        // Professional information
        document.getElementById('modalWorkplace').textContent = alumni.current_workplace || 'Not specified';
        document.getElementById('modalDesignation').textContent = alumni.profession || 'Not specified';
        document.getElementById('modalStatus').textContent = alumni.alumni_status || 'Active';
        
        // Additional information
        document.getElementById('modalBlood').textContent = alumni.blood_group || 'Not specified';
        document.getElementById('modalStudentId').textContent = alumni.bup_id || 'Not specified';
        document.getElementById('modalGraduationYear').textContent = alumni.graduation_year || 'Not specified';

        // Social links
        const socialLinksContainer = document.getElementById('modalSocials');
    const facebookLink = socialLinksContainer.querySelector('.social-link.facebook');
    const linkedinLink = socialLinksContainer.querySelector('.social-link.linkedin');
    const noSocialLinks = socialLinksContainer.querySelector('.no-social-links');

    // Hide all initially
    facebookLink.style.display = 'none';
    linkedinLink.style.display = 'none';
    noSocialLinks.style.display = 'none';

    let hasSocialLinks = false;

    // Show Facebook if available
    if (alumni.facebook) {
        facebookLink.href = alumni.facebook;
        facebookLink.style.display = 'flex';
        hasSocialLinks = true;
    }

    // Show LinkedIn if available
    if (alumni.linkedin) {
        linkedinLink.href = alumni.linkedin;
        linkedinLink.style.display = 'flex';
        hasSocialLinks = true;
    }

    // Show no links message if no social links
    if (!hasSocialLinks) {
        noSocialLinks.style.display = 'block';
    }
    }

    showModal() {
        document.getElementById('alumniModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('alumniModal').classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    updateAlumniCount() {
        const countElement = document.getElementById('alumniCount');
        if (this.alumniData.length === 0) {
            countElement.textContent = 'No alumni data available';
        } else {
            countElement.textContent = `${this.filteredData.length} alumni found (out of ${this.alumniData.length} total)`;
        }
    }

    escapeHtml(text) {
        if (!text) return 'Not specified';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.innerHTML = `<p>${message}</p>`;
        errorElement.classList.add('show');
    }

    hideError() {
        const errorElement = document.getElementById('errorMessage');
        errorElement.classList.remove('show');
    }

    showNoResults(message = 'No alumni found matching your search criteria.') {
        const noResultsElement = document.getElementById('noResultsMessage');
        noResultsElement.innerHTML = `<p>${message}</p>`;
        noResultsElement.classList.add('show');
    }

    hideNoResults() {
        const noResultsElement = document.getElementById('noResultsMessage');
        noResultsElement.classList.remove('show');
    }
}

// Initialize the alumni directory when DOM is loaded
let alumniDirectory;
document.addEventListener('DOMContentLoaded', () => {
    alumniDirectory = new AlumniDirectory();
});