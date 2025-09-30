
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

// Top-level helper function to create an HP part card (available for tests)
export function createHPPartCardForTest(item: any): HTMLElement {
    const card = document.createElement('div');
    card.className = 'hp-part-card entry';

    const title = document.createElement('h4');
    title.textContent = item['Model'] || 'Unnamed Model';
    card.appendChild(title);

    function renderField(labelText: string, value: string | undefined) {
        if (!value) return;
        const p = document.createElement('p');
        p.className = 'supply-chain-desc';
        p.innerHTML = `<strong>${labelText}:</strong> ${value}`;
        card.appendChild(p);
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

    function pnLine(labelText: string, pn: string | undefined) {
        if (!pn) return;
        const p = document.createElement('p');
        p.className = 'supply-chain-desc';
        const label = document.createElement('strong');
        label.textContent = `${labelText}:`;
        const text = document.createElement('span');
        text.textContent = ` ${pn}`;
        // copy button + tooltip
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn';
        btn.setAttribute('aria-label', `Copy ${labelText.toLowerCase()} part number: ${pn}`);
        btn.textContent = 'Copy';

        const tip = document.createElement('span');
        tip.className = 'copy-tip';
        tip.setAttribute('aria-hidden', 'true');
        tip.textContent = '';

        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(pn);
                announceLive(`Copied ${pn}`);
                tip.textContent = 'Copied!';
                setTimeout(() => { tip.textContent = ''; }, 1200);
            } catch (err) {
                console.error('Copy failed', err);
                announceLive('Copy failed');
                tip.textContent = 'Failed';
                setTimeout(() => { tip.textContent = ''; }, 1200);
            }
        });

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

// Note: helper is exported for tests; do not rely on global exposure.

// Top-level announceLive stub for use by helper; DOMContentLoaded will set window.__announceLive
function announceLiveStub(message: string) {
    try {
        // If the DOM-installed announcer is available, call it
        const fn = (globalThis as any).__announceLive as ((m: string) => void) | undefined;
        if (typeof fn === 'function') {
            fn(message);
        }
    } catch (e) {
        // no-op in test environment
    }
}

// Ensure helper uses the stub if announceLive is not yet defined
const announceLive = (globalThis as any).__announceLive ? (globalThis as any).__announceLive : announceLiveStub;

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
                const card = createHPPartCardForTest(item);
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

                // Render each supply-chain field on its own line for readability
                function renderSCField(labelText: string, value?: string) {
                    if (!value) return;
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

        } catch (error) {
            console.error('Error fetching or displaying supply chain data:', error);
            entryDiv.innerHTML = '<h3>Supply Chain Analysis</h3><p>Could not load data.</p>';
        }
    }
    loadAndDisplaySupplyChainData();

    // Manufacturer maps: support three view modes - embedded, grid, thumbnails
    (function manageManufacturerMaps() {
        const mapContainer = document.getElementById('map-container');
        const viewSelect = document.getElementById('map-view-select') as HTMLSelectElement | null;
        const modal = document.getElementById('map-modal') as HTMLElement | null;
        const modalBody = document.getElementById('map-modal-body') as HTMLElement | null;
        const modalClose = modal ? modal.querySelector('.map-modal-close') as HTMLButtonElement | null : null;

    if (!mapContainer || !viewSelect) return;
    const mc = mapContainer as HTMLElement;

        type MapDef = { id: string; name: string; subtitle?: string; src: string };
        const maps: MapDef[] = [
            {
                id: 'quanta',
                name: 'Quanta Computer',
                subtitle: 'Quanta Computer Inc.',
                src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60918979.32972123!2d47.548828125000014!3d25.04579224030345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442a73f83a3ab5d%3A0xc391ab1cf5f8bae9!2sQuanta%20Computer%20Inc.!5e1!3m2!1sen!2sus!4v1759192107767!5m2!1sen!2sus'
            },
            {
                id: 'compal',
                name: 'Compal Electronics',
                subtitle: 'Compal Electronics, Inc.',
                src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d67178764.97335072!2d-55.26281920403455!3d2.479846959788862!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fc93fbc6c9cff%3A0xbaf94dc0397341c1!2sCompal%20Electronics%2C%20Inc.!5e1!3m2!1sen!2sus!4v1759192158327!5m2!1sen!2sus'
            },
            {
                id: 'wistron',
                name: 'Wistron',
                subtitle: 'Wistron Corp.',
                src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d59697452.47319248!2d58.63536408252298!3d27.40147589261721!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3442abd698fa1c9d%3A0x2c836807dbe09706!2zV0lUUyAoV2lzdHJvbiBJVFMpIOe3r-WJtei7n-mrlA!5e1!3m2!1sen!2sus!4v1759192215510!5m2!1sen!2sus'
            },
            {
                id: 'foxconn',
                name: 'Foxconn',
                subtitle: 'Foxconn',
                src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d56710943.70579673!2d-160.82321526865508!3d32.50025850000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80d93893a57f5ee3%3A0x843d8290d945980f!2sFoxconn!5e1!3m2!1sen!2sus!4v1759192259776!5m2!1sen!2sus'
            }
        ];

        function createEmbedEl(map: MapDef) {
            const wrapper = document.createElement('div');
            wrapper.className = 'map-item';
            const title = document.createElement('h4');
            title.textContent = map.name;
            wrapper.appendChild(title);
            const embed = document.createElement('div');
            embed.className = 'map-embed';
            const iframe = document.createElement('iframe');
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            iframe.setAttribute('title', `${map.name} map`);
            iframe.src = map.src;
            embed.appendChild(iframe);
            wrapper.appendChild(embed);
            return wrapper;
        }

        function createThumbEl(map: MapDef) {
            const wrapper = document.createElement('div');
            wrapper.className = 'map-item';
            const btn = document.createElement('button');
            btn.className = 'map-thumb';
            btn.type = 'button';
            btn.setAttribute('aria-label', `Open ${map.name} map`);

            // Prefer an image thumbnail if present; fall back to text
            const img = document.createElement('img');
            img.alt = `${map.name} thumbnail`;
            img.className = 'map-thumb-img';
            // thumbnail path convention: images/maps/<id>-thumb.png
            img.src = `images/maps/${map.id}-thumb.png`;
            img.loading = 'lazy';

            const textWrap = document.createElement('div');
            const title = document.createElement('div');
            title.className = 'thumb-title';
            title.textContent = map.name;
            const sub = document.createElement('div');
            sub.className = 'thumb-sub';
            sub.textContent = map.subtitle || '';
            textWrap.appendChild(title);
            textWrap.appendChild(sub);

            btn.appendChild(img);
            btn.appendChild(textWrap);

            btn.addEventListener('click', () => openMapModal(map));
            wrapper.appendChild(btn);
            return wrapper;
        }

        function renderEmbedded() {
            mc.className = 'map-container embedded';
            mc.innerHTML = '';
            maps.forEach(m => mc.appendChild(createEmbedEl(m)));
        }

        function renderGrid() {
            mc.className = 'map-container grid';
            mc.innerHTML = '';
            maps.forEach(m => mc.appendChild(createEmbedEl(m)));
        }

        function renderThumbnails() {
            mc.className = 'map-container thumbnails';
            mc.innerHTML = '';
            maps.forEach(m => mc.appendChild(createThumbEl(m)));
        }

        let _prevFocused: Element | null = null;
        let _keydownHandler: ((e: KeyboardEvent) => void) | null = null;

        function openMapModal(map: MapDef) {
            if (!modal || !modalBody) return;
            _prevFocused = document.activeElement;
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            modalBody.innerHTML = '';
            const embed = document.createElement('div');
            embed.className = 'map-embed';
            const iframe = document.createElement('iframe');
            iframe.src = map.src;
            iframe.setAttribute('title', `${map.name} map (modal)`);
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            embed.appendChild(iframe);
            modalBody.appendChild(embed);

            // focus management & trap
            const focusableSelector = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
            const focusables = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));
            const firstFocusable = focusables[0] || modal;
            const lastFocusable = focusables[focusables.length - 1] || modal;

            // focus the close button if present
            if (modalClose) modalClose.focus(); else (firstFocusable as HTMLElement).focus();

            _keydownHandler = function (e: KeyboardEvent) {
                if (e.key === 'Escape') {
                    e.preventDefault();
                    closeMapModal();
                } else if (e.key === 'Tab') {
                    // trap focus inside modal
                    if (!focusables.length) return;
                    const active = document.activeElement as HTMLElement;
                    if (e.shiftKey) {
                        if (active === firstFocusable) {
                            e.preventDefault();
                            (lastFocusable as HTMLElement).focus();
                        }
                    } else {
                        if (active === lastFocusable) {
                            e.preventDefault();
                            (firstFocusable as HTMLElement).focus();
                        }
                    }
                }
            };

            document.addEventListener('keydown', _keydownHandler);
        }

        function closeMapModal() {
            if (!modal || !modalBody) return;
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            modalBody.innerHTML = '';
            if (_keydownHandler) {
                document.removeEventListener('keydown', _keydownHandler);
                _keydownHandler = null;
            }
            // restore focus
            try {
                ( _prevFocused as HTMLElement )?.focus?.();
            } catch (e) {
                // ignore
            }
            _prevFocused = null;
        }

        // wire up controls
        viewSelect.addEventListener('change', () => {
            const val = viewSelect.value;
            if (val === 'embedded') renderEmbedded();
            else if (val === 'grid') renderGrid();
            else renderThumbnails();
        });

        if (modalClose) modalClose.addEventListener('click', closeMapModal);
        if (modal) modal.addEventListener('click', (e) => {
            if (e.target === modal) closeMapModal();
        });

        // initial render: choose embedded by default
        renderEmbedded();

        // expose for testing if needed
        (globalThis as any).__mapsRender = { renderEmbedded, renderGrid, renderThumbnails, openMapModal, closeMapModal };
    })();

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

    // expose to top-level helpers/tests
    (globalThis as any).__announceLive = announceLive;

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
