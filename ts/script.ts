
// Progress Bar Functionality
function updateProgressBar(): void {
    const progressBar = document.querySelector('.progress-bar') as HTMLDivElement | null;
    if (progressBar) {
        const scrolled: number = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const progress: number = Math.min(100, Math.max(0, scrolled));
        progressBar.style.width = progress + '%';
        progressBar.setAttribute('aria-valuenow', String(Math.round(progress)));
    }
}

// Throttled scroll event for better performance
let scrollTimeout: number | null = null;
window.addEventListener('scroll', () => {
    if (scrollTimeout) {
        window.cancelAnimationFrame(scrollTimeout);
    }
    scrollTimeout = window.requestAnimationFrame(updateProgressBar);
}, { passive: true });

// Enhanced hover effects for interactive elements
document.addEventListener('DOMContentLoaded', () => {
    // HP Parts Database functionality
    async function loadAndDisplayHPParts() {
        const projectsSection = document.getElementById('projects');
        if (!projectsSection) return;

        const entryDiv = projectsSection.querySelector('#hp-parts-entry');
        if (!entryDiv) return;

        // Add a loading message immediately
        entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>Loading data...</p>';

        try {
            const response = await fetch('data/hp_parts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>No data available.</p>';
                return;
            }

            // Render each HP part as a descriptive entry (heading + paragraphs)
            entryDiv.innerHTML = '<h3>HP Parts List Database</h3>';
            const listContainer = document.createElement('div');
            listContainer.className = 'hp-parts-list';

            data.forEach(item => {
                const card = document.createElement('div');
                card.className = 'hp-part-card entry';

                const title = document.createElement('h4');
                title.textContent = item['Model'] || 'Unnamed Model';
                card.appendChild(title);

                // Build a compact descriptive paragraph from common fields
                const descParts: string[] = [];
                if (item['Processor Family'] || item['Processor']) {
                    const proc = [item['Processor Family'], item['Processor']].filter(Boolean).join(' — ');
                    descParts.push(`<strong>Processor:</strong> ${proc}`);
                }
                if (item['Memory']) {
                    descParts.push(`<strong>Memory:</strong> ${item['Memory']} (${item['Memory Type'] || 'type N/A'})`);
                }
                if (item['Internal Drive']) {
                    descParts.push(`<strong>Storage:</strong> ${item['Internal Drive']}`);
                }
                if (item['Display']) {
                    descParts.push(`<strong>Display:</strong> ${item['Display']}`);
                }
                if (item['Graphics']) {
                    descParts.push(`<strong>Graphics:</strong> ${item['Graphics']}`);
                }
                if (item['External I/O Ports']) {
                    descParts.push(`<strong>Ports:</strong> ${item['External I/O Ports']}`);
                }
                if (item['Weight']) {
                    descParts.push(`<strong>Weight:</strong> ${item['Weight']}`);
                }
                if (item['Warranty']) {
                    descParts.push(`<strong>Warranty:</strong> ${item['Warranty']}`);
                }

                const descPara = document.createElement('p');
                descPara.className = 'hp-part-desc';
                descPara.innerHTML = descParts.join(' · ');
                card.appendChild(descPara);

                // Optional part numbers
                const extras: string[] = [];
                if (item['Screen Replacement Part # (Common)']) {
                    extras.push(`<strong>Screen PN:</strong> ${item['Screen Replacement Part # (Common)']}`);
                }
                if (item['Battery Replacement Part # (Common)']) {
                    extras.push(`<strong>Battery PN:</strong> ${item['Battery Replacement Part # (Common)']}`);
                }
                if (extras.length) {
                    const extrasPara = document.createElement('p');
                    extrasPara.className = 'hp-part-extras';
                    extrasPara.innerHTML = extras.join(' · ');
                    // add copy buttons for part numbers
                    const pnContainer = document.createElement('span');
                    pnContainer.className = 'pn-container';
                    const parts = extrasPara.innerText.split(' · ');
                    parts.forEach((partText, idx) => {
                        const span = document.createElement('span');
                        span.className = 'pn-item';
                        span.textContent = partText;
                        const btn = document.createElement('button');
                        btn.type = 'button';
                        btn.className = 'copy-btn';
                        btn.setAttribute('aria-label', `Copy part number: ${partText}`);
                        btn.textContent = 'Copy';
                        btn.addEventListener('click', async () => {
                            try {
                                // try to copy only the PN after the colon
                                const pn = partText.split(':').slice(1).join(':').trim();
                                await navigator.clipboard.writeText(pn);
                                announceLive(`Copied ${pn}`);
                            } catch (err) {
                                console.error('Copy failed', err);
                                announceLive('Copy failed');
                            }
                        });
                        const wrapper = document.createElement('span');
                        wrapper.className = 'pn-wrapper';
                        wrapper.appendChild(span);
                        wrapper.appendChild(btn);
                        pnContainer.appendChild(wrapper);
                        if (idx < parts.length - 1) {
                            const sep = document.createElement('span');
                            sep.textContent = ' · ';
                            pnContainer.appendChild(sep);
                        }
                    });
                    extrasPara.innerHTML = '';
                    extrasPara.appendChild(pnContainer);
                    card.appendChild(extrasPara);
                }

                listContainer.appendChild(card);
            });

            entryDiv.appendChild(listContainer);

        } catch (error) {
            console.error('Error fetching or displaying HP parts data:', error);
            entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>Could not load data.</p>';
        }
    }
    loadAndDisplayHPParts();

    // Supply Chain Analysis functionality
    async function loadAndDisplaySupplyChainData() {
        const projectsSection = document.getElementById('projects');
        if (!projectsSection) return;

        const entryDiv = projectsSection.querySelector('#supply-chain-entry');
        if (!entryDiv) return;

        // Add a loading message immediately
        entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3><p>Loading data...</p>';

        try {
            const response = await fetch('data/supply_chain.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

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

                const parts: string[] = [];
                if (item['Typical Final Assembly Location(s)']) {
                    parts.push(`<strong>Assembly:</strong> ${item['Typical Final Assembly Location(s)']}`);
                }
                if (item['Primary Assembly Partners (ODMs)']) {
                    parts.push(`<strong>Partners:</strong> ${item['Primary Assembly Partners (ODMs)']}`);
                }
                if (item['Notes & Context']) {
                    parts.push(`<strong>Notes:</strong> ${item['Notes & Context']}`);
                }

                const descPara = document.createElement('p');
                descPara.className = 'supply-chain-desc';
                descPara.innerHTML = parts.join(' · ');
                card.appendChild(descPara);

                listContainer.appendChild(card);
            });

            entryDiv.appendChild(listContainer);

        } catch (error) {
            console.error('Error fetching or displaying supply chain data:', error);
            entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3><p>Could not load data.</p>';
        }
    }
    loadAndDisplaySupplyChainData();

    // Profile image interaction
    const profileImage = document.querySelector('.profile-image') as HTMLImageElement | null;
    if (profileImage) {
        // Handle image load error gracefully: hide the broken img and show SVG fallback
        profileImage.addEventListener('error', function(this: HTMLImageElement) {
            this.style.display = 'none';
            const fallback = document.getElementById('profile-fallback') as HTMLElement | null;
            if (fallback) {
                fallback.style.display = 'block';
            }
            console.warn('Profile image not found. Please add your headshot to images/profile/headshot.png');
        });

        // Add subtle animation on load
        profileImage.addEventListener('load', function(this: HTMLImageElement) {
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
    const navButtons = document.querySelectorAll<HTMLButtonElement>('.nav button');
    const sections = document.querySelectorAll<HTMLElement>('.content .section');
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
            const tab: string | null = button.getAttribute('data-tab');
            sections.forEach(section => {
                if (section.id === tab) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });

    // Make generated cards focusable for keyboard users
    function makeCardsFocusable() {
        const cards = document.querySelectorAll<HTMLElement>('.hp-part-card, .supply-chain-card');
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
        } else {
            backToTop.classList.remove('visible');
        }
    }, { passive: true });

    // ARIA live region for copy notifications
    const live = document.createElement('div');
    live.setAttribute('aria-live', 'polite');
    live.setAttribute('aria-atomic', 'true');
    live.className = 'sr-only';
    document.body.appendChild(live);

    function announceLive(message: string) {
        live.textContent = '';
        setTimeout(() => { live.textContent = message; }, 100);
    }

    // Blog post loading functionality
    const blogLinks = document.querySelectorAll<HTMLAnchorElement>('.blog-link');
    const blogSection = document.getElementById('blog');
    const blogPostSection = document.getElementById('blog-post');

    blogLinks.forEach(link => {
        link.addEventListener('click', async (e: MouseEvent) => {
            e.preventDefault();
            const url = link.getAttribute('href');

            // The token gating logic has been temporarily disabled to fix a bug.
            // All blog links will be treated as regular posts for now.
            if (url && blogSection && blogPostSection) {
                try {
                    const response = await fetch(url);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const content = await response.text();

                    blogPostSection.innerHTML = content;
                    blogSection.classList.add('hidden');
                    blogPostSection.classList.remove('hidden');

                } catch (error) {
                    console.error('Error fetching blog post:', error);
                    blogPostSection.innerHTML = '<p>Sorry, there was an error loading the blog post. Please try again later.</p><button class="back-to-blog">Back to Blog</button>';
                    blogSection.classList.add('hidden');
                    blogPostSection.classList.remove('hidden');
                }
            }
        });
    });

    if (blogPostSection) {
        blogPostSection.addEventListener('click', (e: MouseEvent) => {
            if ((e.target as HTMLElement).classList.contains('back-to-blog')) {
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
document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});
