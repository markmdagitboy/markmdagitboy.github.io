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
            // Use the header as the key to access the data
            cell.textContent = String(item[header] || '');
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    container.innerHTML = ''; // Clear any previous content
    container.appendChild(table);
}

document.addEventListener("DOMContentLoaded", () => {
    const laptopsContainer = document.getElementById("laptops-table-container");
    if (laptopsContainer) {
        fetchData("../laptops.json")
            .then(data => {
                const headers = [
                    "Model", "Processor", "Memory", "Internal Drive", "Display", "Graphics",
                    "Screen Replacement Part # (Common)", "Battery Replacement Part # (Common)",
                    "RAM Replacement Part # (Common)", "SSD Replacement Part # (Common)"
                ];
                createTable(laptopsContainer, data, headers);
            })
            .catch(error => console.error("Error fetching or creating laptops table:", error));
    }

    const supplyChainContainer = document.getElementById("supply-chain-table-container");
    if (supplyChainContainer) {
        fetchData("../supply_chain.json")
            .then(data => {
                const headers = [
                    "Model Series", "Generation", "Typical Final Assembly Location(s)",
                    "Primary Assembly Partners (ODMs)", "Notes & Context"
                ];
                createTable(supplyChainContainer, data, headers);
            })
            .catch(error => console.error("Error fetching or creating supply chain table:", error));
    }
});