// Progress Bar Functionality
function updateProgressBar() {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    const progressBar = document.querySelector('.progress-bar');
    
    if (progressBar) {
        const progress = Math.min(100, Math.max(0, scrolled));
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', Math.round(progress));
    }
}

// Throttled scroll event for better performance
let scrollTimeout;
window.addEventListener('scroll', function() {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(updateProgressBar);
}, { passive: true });

// Enhanced hover effects for interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Profile image interaction
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        // Handle image load error gracefully
        profileImage.addEventListener('error', function() {
            this.style.display = 'none';
            console.warn('Profile image not found. Please add your headshot to images/profile/headshot.png');
        });
        
        // Add subtle animation on load
        profileImage.addEventListener('load', function() {
            this.style.opacity = '0';
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transition = 'all 0.5s ease';
                this.style.opacity = '1';
                this.style.transform = 'scale(1)';
            }, 100);
        });
    }
    
    // Entry cards hover effects
    const entries = document.querySelectorAll('.entry');
    entries.forEach(entry => {
        entry.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        entry.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Tech tags hover effects
    const techTags = document.querySelectorAll('.tech-tag');
    techTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-1px)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

// Keyboard navigation accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', function() {
    document.body.classList.remove('keyboard-navigation');
});