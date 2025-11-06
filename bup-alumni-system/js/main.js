// main.js - Main JavaScript functionality
(function() {
    'use strict';
    
    // Mobile menu toggle functionality
    function initMobileMenu() {
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navList = document.querySelector('.nav-list');
        
        if (mobileMenuToggle && navList) {
            mobileMenuToggle.addEventListener('click', function() {
                navList.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                if (navList && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                }
            });
        });
    }
    
    // Initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        initMobileMenu();
    });
    
    // Re-initialize when components are loaded
    if (typeof initializeComponents === 'function') {
        // This will be called by components.js after loading header/footer
    } else {
        window.initializeComponents = initMobileMenu;
    }
})();