// Progress Bar Functionality
function updateProgressBar() {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const progress = Math.min(100, Math.max(0, scrolled));
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', String(Math.round(progress)));
    }
}

// Throttled scroll event for better performance
let scrollTimeout = null;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(updateProgressBar);
}, { passive: true });

// Enhanced hover effects for interactive elements
document.addEventListener('DOMContentLoaded', () => {
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

    // Tab switching functionality
    const navButtons = document.querySelectorAll('.nav button');
    const sections = document.querySelectorAll('.content .section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show/hide content sections
            const tab = button.getAttribute('data-tab');
            sections.forEach(section => {
                if (section.id === tab) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });
});

// Keyboard navigation accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});
