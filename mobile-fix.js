// mobile-fix.js - Applies mobile styles ONLY when on mobile, without affecting PC

(function() {
    // Check if mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Apply mobile styles
    function applyMobileStyles() {
        if (!isMobile()) return;
        
        // Create a style element for mobile-only CSS
        const style = document.createElement('style');
        style.id = 'mobile-only-styles';
        style.textContent = `
            /* Mobile Only Styles - Applied via JavaScript */
            body { overflow: auto !important; height: auto !important; }
            .pg-1 { max-width: 100% !important; height: auto !important; min-height: 100vh; margin: 0 !important; border-left: none !important; border-right: none !important; }
            .fixed-top-section { padding: 10px !important; }
            .search-container { display: block !important; padding: 10px !important; }
            .tree-viewport { padding: 15px 10px !important; overflow-x: auto !important; }
            .box { min-width: 200px !important; max-width: 280px !important; }
            .tables-container { flex-direction: column !important; gap: 20px !important; }
            .lineage-table-container { min-width: 100% !important; max-width: 100% !important; }
            .summary-content { grid-template-columns: 1fr !important; }
            .h-row { gap: 10px !important; flex-wrap: wrap !important; }
            .btn, .btn-root { width: 100% !important; margin: 5px 0 !important; }
        `;
        
        // Remove any existing mobile style
        const existing = document.getElementById('mobile-only-styles');
        if (existing) existing.remove();
        
        // Add the new style
        document.head.appendChild(style);
    }
    
    // Apply on load and resize
    window.addEventListener('load', applyMobileStyles);
    window.addEventListener('resize', function() {
        const existing = document.getElementById('mobile-only-styles');
        if (isMobile()) {
            if (!existing) applyMobileStyles();
        } else {
            if (existing) existing.remove();
        }
    });
})();