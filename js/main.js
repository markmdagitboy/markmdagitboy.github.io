async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch data from ${url}`);
    }
    return response.json();
}

function createTable(container, data, headers) {
    if (!container || !data || data.length === 0) {
        return;
    }

    const table = document.createElement("table");
    table.classList.add("table", "table-striped", "table-bordered");

    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    data.forEach(item => {
        const row = document.createElement("tr");
        headers.forEach(header => {
            const cell = document.createElement("td");
            cell.textContent = String(item[header] || '');
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.innerHTML = ''; // Clear any previous content
    container.appendChild(table);
}

function setActiveNav() {
    const navLinks = document.querySelectorAll('nav a');
    const currentPage = window.location.pathname.split('/').pop();

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setActiveNav();

    const elitebookSupplyChainContainer = document.getElementById("elitebook-supply-chain-cards");
    const zbookSupplyChainContainer = document.getElementById("zbook-supply-chain-cards");
    if (elitebookSupplyChainContainer && zbookSupplyChainContainer) {
        fetchData("../supply_chain.json")
            .then(data => {
                const elitebookSupplyData = data.filter(item => item["Model Series"] === "Elitebook");
                const zbookSupplyData = data.filter(item => item["Model Series"] === "Zbook Studio");

                elitebookSupplyData.forEach(item => createSupplyChainCard(elitebookSupplyChainContainer, item));
                zbookSupplyData.forEach(item => createSupplyChainCard(zbookSupplyChainContainer, item));
            })
            .catch(error => console.error("Error fetching or creating supply chain cards:", error));
    }
});

function createSupplyChainCard(container, item) {
    const card = document.createElement('div');
    card.className = 'laptop-card';

    const title = document.createElement('h3');
    title.textContent = `${item["Model Series"]} ${item["Generation"]}`;
    card.appendChild(title);

    // Infographic for Assembly Location(s)
    if (item["Typical Final Assembly Location(s)"]) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';

        const keySpan = document.createElement('span');
        keySpan.className = 'spec-key';
        keySpan.textContent = 'Assembly Location(s):';
        specDiv.appendChild(keySpan);

        const chartContainer = document.createElement('div');
        chartContainer.className = 'infographic-container infographic-container-bar';
        const canvas = document.createElement('canvas');
        // Generate a unique ID for the canvas
        const canvasId = `locations-chart-${item["Model Series"]}-${item["Generation"]}`.replace(/\s+/g, '-');
        canvas.id = canvasId;
        chartContainer.appendChild(canvas);
        specDiv.appendChild(chartContainer);
        card.appendChild(specDiv);

        // Defer chart creation until the card is in the DOM
        setTimeout(() => {
            const ctx = document.getElementById(canvasId).getContext('2d');
            const locations = item["Typical Final Assembly Location(s)"].split(',').map(s => s.trim());
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: locations,
                    datasets: [{
                        label: 'Assembly Presence',
                        data: locations.map(() => 1), // Equal representation
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    indexAxis: 'y',
                    scales: {
                        x: {
                            display: false,
                            beginAtZero: true,
                            max: 1.1
                        },
                        y: {
                             ticks: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }, 0);
    }

    // Infographic for Assembly Partners (ODMs)
    if (item["Primary Assembly Partners (ODMs)"] && item["Primary Assembly Partners (ODMs)"].length > 0) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';

        const keySpan = document.createElement('span');
        keySpan.className = 'spec-key';
        keySpan.textContent = 'Assembly Partners (ODMs):';
        specDiv.appendChild(keySpan);

        const chartContainer = document.createElement('div');
        chartContainer.className = 'infographic-container infographic-container-pie';
        const canvas = document.createElement('canvas');
        const canvasId = `partners-chart-${item["Model Series"]}-${item["Generation"]}`.replace(/\s+/g, '-');
        canvas.id = canvasId;
        chartContainer.appendChild(canvas);
        specDiv.appendChild(chartContainer);
        card.appendChild(specDiv);

        setTimeout(() => {
            const ctx = document.getElementById(canvasId).getContext('2d');
            const partners = item["Primary Assembly Partners (ODMs)"].map(p => p.name);
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: partners,
                    datasets: [{
                        data: partners.map(() => 1), // Equal slices
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.6)',
                            'rgba(54, 162, 235, 0.6)',
                            'rgba(255, 206, 86, 0.6)',
                            'rgba(75, 192, 192, 0.6)',
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 206, 86, 1)',
                            'rgba(75, 192, 192, 1)',
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                             labels: {
                                font: {
                                    size: 12
                                }
                            }
                        }
                    }
                }
            });
        }, 0);
    }

    // Infographic for Notes & Context
    if (item["Notes & Context"]) {
        const specDiv = document.createElement('div');
        specDiv.className = 'spec';

        const keySpan = document.createElement('span');
        keySpan.className = 'spec-key';
        keySpan.textContent = 'Notes & Context:';
        specDiv.appendChild(keySpan);

        const valueDiv = document.createElement('div');
        valueDiv.className = 'spec-value-context';

        const text = item["Notes & Context"];
        let iconClass = '';

        if (text.toLowerCase().includes('pandemic')) {
            iconClass = 'fas fa-virus';
        } else if (text.toLowerCase().includes('diversify') || text.toLowerCase().includes('diversification')) {
            iconClass = 'fas fa-sitemap';
        } else if (text.toLowerCase().includes('china +1')) {
            iconClass = 'fas fa-plus-circle';
        } else if (text.toLowerCase().includes('tariffs')) {
            iconClass = 'fas fa-file-invoice-dollar';
        } else if (text.toLowerCase().includes('largest laptop manufacturing base')) {
            iconClass = 'fas fa-industry';
        }

        if (iconClass) {
            const icon = document.createElement('i');
            icon.className = iconClass + ' context-icon';
            valueDiv.appendChild(icon);
        }

        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        valueDiv.appendChild(textSpan);

        specDiv.appendChild(valueDiv);
        card.appendChild(specDiv);
    }

    container.appendChild(card);
}