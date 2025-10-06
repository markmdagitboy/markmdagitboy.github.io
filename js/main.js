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
    card.className = 'laptop-card'; // Re-use laptop-card styling

    const title = document.createElement('h3');
    title.textContent = `${item["Model Series"]} ${item["Generation"]}`;
    card.appendChild(title);

    const specsToShow = {
        "Assembly Location(s)": item["Typical Final Assembly Location(s)"],
        "Assembly Partners (ODMs)": item["Primary Assembly Partners (ODMs)"],
        "Notes & Context": item["Notes & Context"]
    };

    for (const [key, value] of Object.entries(specsToShow)) {
        if (value) {
            const specDiv = document.createElement('div');
            specDiv.className = 'spec';

            const keySpan = document.createElement('span');
            keySpan.className = 'spec-key';
            keySpan.textContent = key + ':';
            specDiv.appendChild(keySpan);

            const valueSpan = document.createElement('span');
            valueSpan.className = 'spec-value';

            if (key === "Assembly Partners (ODMs)" && Array.isArray(value)) {
                valueSpan.textContent = value.map(partner => partner.name).join(', ');
            } else {
                valueSpan.textContent = value;
            }

            specDiv.appendChild(valueSpan);
            card.appendChild(specDiv);

            if (key === "Assembly Partners (ODMs)" && Array.isArray(value)) {
                value.forEach(partner => {
                    if (partner.map_url) {
                        const mapContainer = document.createElement('div');
                        mapContainer.className = 'map-container';

                        const iframe = document.createElement('iframe');
                        iframe.src = partner.map_url;
                        iframe.width = '100%';
                        iframe.height = '250';
                        iframe.style.border = 0;
                        iframe.allowFullscreen = true;
                        iframe.loading = 'lazy';
                        iframe.title = `Map of ${partner.name} headquarters`;

                        mapContainer.appendChild(iframe);
                        card.appendChild(mapContainer);
                    }
                });
            }
        }
    }
    container.appendChild(card);
}