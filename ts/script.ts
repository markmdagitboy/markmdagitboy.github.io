import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum: any;
    }
}

const TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789'; // Sepolia LINK token
const TOKEN_ABI = [
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

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
    // Profile image interaction
    const profileImage = document.querySelector('.profile-image') as HTMLImageElement | null;
    if (profileImage) {
        // Handle image load error gracefully
        profileImage.addEventListener('error', function(this: HTMLImageElement) {
            this.style.display = 'none';
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
            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

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

    // Blog post loading functionality
    const blogLinks = document.querySelectorAll<HTMLAnchorElement>('.blog-link');
    const blogSection = document.getElementById('blog');
    const blogPostSection = document.getElementById('blog-post');

    blogLinks.forEach(link => {
        link.addEventListener('click', async (e: MouseEvent) => {
            e.preventDefault();
            const url = link.getAttribute('href');

            if (link.classList.contains('token-gated-link')) {
                // Token gating logic
                if (!provider) {
                    alert('Please connect your wallet to view this post.');
                    return;
                }
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);

                try {
                    const balance = await tokenContract.balanceOf(address);
                    if (balance > 0) {
                        // User has the token, load the post
                        if (url && blogSection && blogPostSection) {
                            const response = await fetch(url);
                            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                            const content = await response.text();
                            blogPostSection.innerHTML = content;
                            blogSection.classList.add('hidden');
                            blogPostSection.classList.remove('hidden');
                        }
                    } else {
                        // User does not have the token
                        alert("You don't have the required token to view this post. (This demo uses Sepolia LINK token)");
                    }
                } catch (error) {
                    console.error('Error checking token balance:', error);
                    alert('Could not verify your token balance. Please try again.');
                }
            } else {
                // Regular blog post logic
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

    // HP Parts Database functionality
    async function loadAndDisplayHPParts() {
        const projectsSection = document.getElementById('projects');
        if (!projectsSection) return;

        const entryDiv = projectsSection.querySelector('.entry');
        if (!entryDiv) return;

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

            // Clear existing content and append table
            entryDiv.innerHTML = '<h3>HP Parts List Database</h3>';
            entryDiv.appendChild(table);

        } catch (error) {
            console.error('Error fetching or displaying HP parts data:', error);
            entryDiv.innerHTML = '<h3>HP Parts List Database</h3><p>Could not load data.</p>';
        }
    }

    setTimeout(() => loadAndDisplayHPParts(), 0);

    // Web3 functionality
    const connectWalletBtn = document.getElementById('connectWalletBtn') as HTMLButtonElement | null;
    let provider: ethers.BrowserProvider | null = null;

    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', async () => {
            if (window.ethereum) {
                try {
                    // Request account access
                    provider = new ethers.BrowserProvider(window.ethereum);
                    await provider.send("eth_requestAccounts", []);
                    const signer = await provider.getSigner();
                    const address = await signer.getAddress();

                    console.log('Connected to wallet:', address);

                    // Get balance
                    const balance = await provider.getBalance(address);
                    const formattedBalance = ethers.formatEther(balance);

                    // Update UI
                    connectWalletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                    connectWalletBtn.disabled = true;

                    const walletInfoDiv = document.getElementById('walletInfo');
                    if (walletInfoDiv) {
                        walletInfoDiv.innerHTML = `<span>Balance: ${parseFloat(formattedBalance).toFixed(4)} ETH</span>`;
                    }

                } catch (error) {
                    console.error('Failed to connect to wallet:', error);
                    alert('Failed to connect to wallet. Please make sure you have MetaMask installed and unlocked.');
                }
            } else {
                alert('Please install MetaMask to use this feature.');
            }
        });
    }
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
