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
// Top-level helper function to create an HP part card (available for tests)
function createHPPartCardForTest(item) {
    const card = document.createElement('div');
    card.className = 'hp-part-card entry';
    const title = document.createElement('h4');
    title.textContent = item['Model'] || 'Unnamed Model';
    card.appendChild(title);
    function renderField(labelText, value) {
        if (!value)
            return;
        const separators = /\s*[,·]\s*/;
        const parts = value.split(separators).map((s) => s.trim()).filter(Boolean);
        if (parts.length <= 1) {
            const p = document.createElement('p');
            p.className = 'hp-part-desc';
            p.innerHTML = `<strong>${labelText}:</strong> ${value}`;
            card.appendChild(p);
        }
        else {
            const p = document.createElement('p');
            p.className = 'hp-part-desc';
            p.innerHTML = `<strong>${labelText}:</strong>`;
            const ul = document.createElement('ul');
            ul.className = 'hp-part-list';
            parts.forEach((part) => {
                const li = document.createElement('li');
                li.textContent = part;
                ul.appendChild(li);
            });
            card.appendChild(p);
            card.appendChild(ul);
        }
    }
    if (item['Processor Family'] || item['Processor']) {
        const proc = [item['Processor Family'], item['Processor']].filter(Boolean).join(' — ');
        renderField('Processor', proc);
    }
    renderField('Memory', item['Memory'] ? `${item['Memory']} (${item['Memory Type'] || 'type N/A'})` : undefined);
    renderField('Storage', item['Internal Drive']);
    renderField('Display', item['Display']);
    renderField('Graphics', item['Graphics']);
    renderField('Ports', item['External I/O Ports']);
    renderField('Weight', item['Weight']);
    renderField('Warranty', item['Warranty']);
    function pnLine(labelText, pn) {
        if (!pn)
            return;
        const p = document.createElement('p');
        p.className = 'hp-part-extras';
        const label = document.createElement('strong');
        label.textContent = `${labelText}:`;
        const text = document.createElement('span');
        text.textContent = ` ${pn}`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.setAttribute('aria-label', `Copy ${labelText.toLowerCase()} part number: ${pn}`);
        btn.textContent = 'Copy';
        const tip = document.createElement('span');
        tip.className = 'copy-tip';
        tip.setAttribute('aria-hidden', 'true');
        tip.textContent = '';
        btn.addEventListener('click', () => __awaiter(this, void 0, void 0, function* () {
            try {
                yield navigator.clipboard.writeText(pn);
                announceLive(`Copied ${pn}`);
                tip.textContent = 'Copied!';
                setTimeout(() => { tip.textContent = ''; }, 1200);
            }
            catch (err) {
                console.error('Copy failed', err);
                announceLive('Copy failed');
                tip.textContent = 'Failed';
                setTimeout(() => { tip.textContent = ''; }, 1200);
            }
        }));
        p.appendChild(label);
        p.appendChild(text);
        p.appendChild(document.createTextNode(' '));
        p.appendChild(btn);
        p.appendChild(tip);
        card.appendChild(p);
    }
    pnLine('Screen PN', item['Screen Replacement Part # (Common)']);
    pnLine('Battery PN', item['Battery Replacement Part # (Common)']);
    return card;
}
// Expose helper for test runners
globalThis.__createHPPartCardForTest = createHPPartCardForTest;
// Top-level announceLive stub for use by helper; DOMContentLoaded will set window.__announceLive
function announceLiveStub(message) {
    try {
        // If the DOM-installed announcer is available, call it
        const fn = globalThis.__announceLive;
        if (typeof fn === 'function') {
            fn(message);
        }
    }
    catch (e) {
        // no-op in test environment
    }
}
// Ensure helper uses the stub if announceLive is not yet defined
const announceLive = globalThis.__announceLive ? globalThis.__announceLive : announceLiveStub;
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
                // Render each HP part as a descriptive entry (heading + paragraphs)
                entryDiv.innerHTML = '<h3>HP Parts List Database</h3>';
                const listContainer = document.createElement('div');
                listContainer.className = 'hp-parts-list';
                data.forEach(item => {
                    const card = createHPPartCardForTest(item);
                    listContainer.appendChild(card);
                });
                entryDiv.appendChild(listContainer);
            }
            catch (error) {
                console.error('Error fetching or displaying HP parts data:', error);
                entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>Could not load data.</p>';
            }
        });
    }
    loadAndDisplayHPParts();
    // Supply Chain Analysis functionality
    function loadAndDisplaySupplyChainData() {
        return __awaiter(this, void 0, void 0, function* () {
            const projectsSection = document.getElementById('projects');
            if (!projectsSection)
                return;
            const entryDiv = projectsSection.querySelector('#supply-chain-entry');
            if (!entryDiv)
                return;
            // Add a loading message immediately
            entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3><p>Loading data...</p>';
            try {
                const response = yield fetch('data/supply_chain.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = yield response.json();
                if (!Array.isArray(data) || data.length === 0) {
                    entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3><p>No data available.</p>';
                    return;
                }
                // Render supply chain entries as descriptive cards
                entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3>';
                const listContainer = document.createElement('div');
                listContainer.className = 'supply-chain-list';
                data.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'supply-chain-card entry';
                    const title = document.createElement('h4');
                    const series = item['Model Series'] || item['Model'] || 'Model Series';
                    const generation = item['Generation'] ? ` ${item['Generation']}` : '';
                    title.textContent = `${series}${generation}`;
                    card.appendChild(title);
                    // Render each supply-chain field on its own line for readability
                    function renderSCField(labelText, value) {
                        if (!value)
                            return;
                        const p = document.createElement('p');
                        p.className = 'supply-chain-desc';
                        p.innerHTML = `<strong>${labelText}:</strong> ${value}`;
                        card.appendChild(p);
                    }
                    renderSCField('Assembly', item['Typical Final Assembly Location(s)']);
                    renderSCField('Partners', item['Primary Assembly Partners (ODMs)']);
                    renderSCField('Notes', item['Notes & Context']);
                    listContainer.appendChild(card);
                });
                entryDiv.appendChild(listContainer);
            }
            catch (error) {
                console.error('Error fetching or displaying supply chain data:', error);
                entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3><p>Could not load data.</p>';
            }
        });
    }
    loadAndDisplaySupplyChainData();
    // Profile image interaction
    const profileImage = document.querySelector('.profile-image');
    if (profileImage) {
        // Handle image load error gracefully: hide the broken img and show SVG fallback
        profileImage.addEventListener('error', function () {
            this.style.display = 'none';
            const fallback = document.getElementById('profile-fallback');
            if (fallback) {
                fallback.style.display = 'block';
            }
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
            // Update active button and aria state
            navButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            // Show/hide content sections
            const tab = button.getAttribute('data-tab');
            sections.forEach(section => {
                if (section.id === tab) {
                    section.classList.remove('hidden');
                }
                else {
                    section.classList.add('hidden');
                }
            });
        });
    });
    // Make generated cards focusable for keyboard users
    function makeCardsFocusable() {
        const cards = document.querySelectorAll('.hp-part-card, .supply-chain-card');
        cards.forEach(card => {
            card.tabIndex = 0;
            card.setAttribute('role', 'article');
        });
    }
    // Call once after initial load and also after data loads finish
    setTimeout(makeCardsFocusable, 250);
    // Back-to-top button: create and show on scroll
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.type = 'button';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '↑';
    document.body.appendChild(backToTop);
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        }
        else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });
    // ARIA live region for copy notifications
    const live = document.createElement('div');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.className = 'sr-only';
    document.body.appendChild(live);
    function announceLive(message) {
        live.textContent = '';
        setTimeout(() => { live.textContent = message; }, 100);
    }
    // expose to top-level helpers/tests
    globalThis.__announceLive = announceLive;
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
