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
    // HP Parts Database functionality
    function loadAndDisplayHPParts() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectsSection = document.getElementById('projects');
            if (!projectsSection)
                return;
            const entryDiv = projectsSection.querySelector('#hp-parts-entry');
            if (!entryDiv)
                return;
            // Add a loading message immediately
            entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>Loading data...</p>';
            try {
                const response = yield fetch('data/hp_parts.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = yield response.json();
                if (!Array.isArray(data) || data.length === 0) {
                    entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>No data available.</p>';
                    return;
                }
                const table = document.createElement('table');
                table.classList.add('hp-parts-table');
                // Create table header
                const thead = document.createElement('thead');
                const headerRow = document.createElement('tr');
                const headers = Object.keys(data[0]);
                headers.forEach(headerText => {
                    const th = document.createElement('th');
                    th.textContent = headerText;
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
                // Create table body
                const tbody = document.createElement('tbody');
                data.forEach(item => {
                    const row = document.createElement('tr');
                    headers.forEach(header => {
                        const cell = document.createElement('td');
                        cell.textContent = item[header];
                        row.appendChild(cell);
                    });
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                // Clear the loading message and append the table
                entryDiv.innerHTML = '<h3>HP Parts List Database</h3>';
                entryDiv.appendChild(table);
            }
            catch (error) {
                console.error('Error fetching or displaying HP parts data:', error);
                entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>Could not load data.</p>';
            }
        });
    }
    loadAndDisplayHPParts(); // Commented out for diagnostic purposes
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
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // Show/hide content sections
            const tab = button.getAttribute('data-tab');
            sections.forEach(section => {
                if (section.id === tab) {
                    section.classList.remove('hidden');
                    if (section.id === 'projects') {
                        initializeMap();
                    }
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
    // ArcGIS Map initialization
    function initializeMap() {
        return __awaiter(this, void 0, void 0, function* () {
            const viewDiv = document.getElementById('viewDiv');
            if (!viewDiv || viewDiv.dataset.initialized) {
                return;
            }
            // @ts-ignore
            require([
                "esri/config",
                "esri/Map",
                "esri/views/MapView"
            ], function (esriConfig, Map, MapView) {
                const map = new Map({
                    basemap: "arcgis-topographic" // Basemap layer service
                });
                const view = new MapView({
                    map: map,
                    center: [-118.805, 34.027], // Longitude, latitude
                    zoom: 13, // Zoom level
                    container: "viewDiv" // Div element
                });
                viewDiv.dataset.initialized = 'true';
            });
        });
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
