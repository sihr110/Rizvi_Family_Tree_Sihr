// Only runs on mobile
if (window.innerWidth <= 768) {
    // Better touch targets
    document.querySelectorAll('.result-item').forEach(el => {
        el.style.padding = '15px';
        el.style.fontSize = '16px';
    });
    
    // Prevent zoom on input
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('focus', () => input.style.fontSize = '16px');
    });
    
    // Swipe navigation
    let touchStartX = 0;
    document.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX);
    document.addEventListener('touchend', e => {
        let diff = e.changedTouches[0].screenX - touchStartX;
        if (diff > 50) document.querySelector('[data-panel="search-panel"]')?.click();
        if (diff < -50) document.querySelector('[data-panel="root-panel"]')?.click();
    });
}