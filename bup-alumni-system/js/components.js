// components.js - Load header and footer components
(function() {
    'use strict';
    
    // Function to load HTML components
    function loadComponent(elementId, filePath) {
        fetch(filePath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(data => {
                document.getElementById(elementId).innerHTML = data;
                // Re-initialize any scripts that need to run after component load
                initializeComponents();
            })
            .catch(error => {
                console.error('Error loading component:', error);
                document.getElementById(elementId).innerHTML = '<p>Error loading component</p>';
            });
    }
    
    // Load header and footer when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        loadComponent('header', './header.html');
        loadComponent('footer', './footer.html');
    });
    
    // Initialize components after loading
    function initializeComponents() {
        // Mobile menu functionality will be reinitialized here
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navList = document.querySelector('.nav-list');
        
        if (mobileMenuToggle && navList) {
            // Remove existing event listeners
            mobileMenuToggle.replaceWith(mobileMenuToggle.cloneNode(true));
            const newToggle = document.getElementById('mobileMenuToggle');
            
            newToggle.addEventListener('click', function() {
                navList.classList.toggle('active');
            });
        }
        
        // Set active navigation link based on current page
        setActiveNavLink();
    }
    
    // Set active navigation link
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }
    
    // Make function available globally
    window.initializeComponents = initializeComponents;
})();