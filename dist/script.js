"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        profileImage.addEventListener('error', function () {
            this.style.display = 'none';
            console.warn('Profile image not found. Please add your headshot to images/profile/headshot.png');
        });
        // Add subtle animation on load
        profileImage.addEventListener('load', function () {
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
            console.log(`Button clicked: ${button.getAttribute('data-tab')}`);
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Show/hide content sections
            const tab = button.getAttribute('data-tab');
            console.log(`Switching to tab: ${tab}`);
            sections.forEach(section => {
                console.log(`Checking section: ${section.id}`);
                if (section.id === tab) {
                    console.log(`Showing section: ${section.id}`);
                    section.classList.remove('hidden');
                }
                else {
                    section.classList.add('hidden');
                }
            });
        });
    });
    // Blog post loading functionality
    const blogLinks = document.querySelectorAll('.blog-link');
    const blogSection = document.getElementById('blog');
    const blogPostSection = document.getElementById('blog-post');
    blogLinks.forEach(link => {
        link.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const url = link.getAttribute('href');
            // The token gating logic has been temporarily disabled to fix a bug.
            // All blog links will be treated as regular posts for now.
            if (url && blogSection && blogPostSection) {
                try {
                    const response = yield fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const content = yield response.text();
                    blogPostSection.innerHTML = content;
                    blogSection.classList.add('hidden');
                    blogPostSection.classList.remove('hidden');
                }
                catch (error) {
                    console.error('Error fetching blog post:', error);
                    blogPostSection.innerHTML = '<p>Sorry, there was an error loading the blog post. Please try again later.</p><button class="back-to-blog">Back to Blog</button>';
                    blogSection.classList.add('hidden');
                    blogPostSection.classList.remove('hidden');
                }
            }
        }));
    });
    if (blogPostSection) {
        blogPostSection.addEventListener('click', (e) => {
            if (e.target.classList.contains('back-to-blog')) {
                if (blogSection && blogPostSection) {
                    blogPostSection.classList.add('hidden');
                    blogSection.classList.remove('hidden');
                    blogPostSection.innerHTML = '';
                }
            }
        });
    }
    // Web3 functionality has been removed.
    // Ticketing System Functionality
    const loginView = document.getElementById('login-view');
    const ticketingView = document.getElementById('ticketing-view');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const ticketsTableBody = document.querySelector('#tickets-table tbody');
    const addTicketForm = document.getElementById('add-ticket-form');
    let tickets = [];
    function fetchTickets() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield fetch('/api/tickets');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                tickets = yield response.json();
                renderTickets();
            }
            catch (error) {
                console.error('Error fetching tickets:', error);
            }
        });
    }
    function renderTickets() {
        if (!ticketsTableBody)
            return;
        ticketsTableBody.innerHTML = '';
        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.status}</td>
                <td><button class="delete-ticket" data-id="${ticket.id}">Delete</button></td>
            `;
            ticketsTableBody.appendChild(row);
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            try {
                const response = yield fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, password })
                });
                const data = yield response.json();
                if (data.success) {
                    if (loginView && ticketingView) {
                        loginView.classList.add('hidden');
                        ticketingView.classList.remove('hidden');
                        fetchTickets();
                    }
                }
                else {
                    alert(data.message || 'Invalid credentials');
                }
            }
            catch (error) {
                console.error('Login error:', error);
                alert('An error occurred during login.');
            }
        }));
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            if (loginView && ticketingView) {
                ticketingView.classList.add('hidden');
                loginView.classList.remove('hidden');
            }
        });
    }
    if (addTicketForm) {
        addTicketForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
            e.preventDefault();
            const titleInput = document.getElementById('ticket-title');
            const newTicket = {
                title: titleInput.value,
                status: 'Open'
            };
            try {
                const response = yield fetch('/api/tickets', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newTicket)
                });
                if (response.ok) {
                    titleInput.value = '';
                    yield fetchTickets();
                }
                else {
                    alert('Failed to add ticket');
                }
            }
            catch (error) {
                console.error('Error adding ticket:', error);
                alert('An error occurred while adding the ticket.');
            }
        }));
    }
    if (ticketsTableBody) {
        ticketsTableBody.addEventListener('click', (e) => __awaiter(void 0, void 0, void 0, function* () {
            const target = e.target;
            if (target.classList.contains('delete-ticket')) {
                const idAttr = target.getAttribute('data-id');
                if (idAttr) {
                    const id = parseInt(idAttr, 10);
                    try {
                        const response = yield fetch(`/api/tickets/${id}`, {
                            method: 'DELETE'
                        });
                        if (response.ok) {
                            yield fetchTickets();
                        }
                        else {
                            alert('Failed to delete ticket');
                        }
                    }
                    catch (error) {
                        console.error('Error deleting ticket:', error);
                        alert('An error occurred while deleting the ticket.');
                    }
                }
            }
        }));
    }
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
