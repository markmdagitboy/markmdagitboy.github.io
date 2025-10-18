document.addEventListener('DOMContentLoaded', async () => {
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');

    // Load the sql.js WebAssembly file
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`
    });

    const db = new SQL.Database();

    // Fetch laptop data and populate the database
    try {
        const response = await fetch('../data/laptops.json');
        const laptopsData = await response.json();

        // Create the laptops table
        db.run(`
            CREATE TABLE laptops (
                id INTEGER PRIMARY KEY,
                model TEXT,
                processor TEXT,
                ram TEXT,
                storage TEXT,
                screen TEXT,
                graphics TEXT
            );
        `);

        // Insert data into the table
        const insertStmt = db.prepare("INSERT INTO laptops (model, processor, ram, storage, screen, graphics) VALUES (?, ?, ?, ?, ?, ?)");
        laptopsData.forEach(laptop => {
            insertStmt.run([laptop.Model, laptop.Processor, laptop.Memory, laptop['Internal Drive'], laptop.Display, laptop.Graphics]);
        });
        insertStmt.free();

    } catch (error) {
        console.error("Failed to load or process laptop data:", error);
        searchResultsContainer.innerHTML = '<p>Error loading search data. Please try again later.</p>';
        return;
    }

    const performSearch = () => {
        const searchTerm = searchInput.value.trim();
        if (searchTerm === '') {
            searchResultsContainer.innerHTML = '';
            return;
        }

        try {
            const stmt = db.prepare(`
                SELECT * FROM laptops
                WHERE model LIKE :term OR
                      processor LIKE :term OR
                      ram LIKE :term OR
                      storage LIKE :term OR
                      screen LIKE :term OR
                      graphics LIKE :term
            `);

            const results = [];
            stmt.bind({ ':term': `%${searchTerm}%` });
            while (stmt.step()) {
                results.push(stmt.getAsObject());
            }
            stmt.free();

            displayResults(results);
        } catch (error) {
            console.error("Error performing search:", error);
            searchResultsContainer.innerHTML = '<p>An error occurred during the search.</p>';
        }
    };

    const displayResults = (results) => {
        if (results.length === 0) {
            searchResultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        const resultsHtml = results.map(laptop => `
            <div class="laptop-card">
                <h3>${laptop.model}</h3>
                <div class="spec">
                    <span class="spec-key">Processor:</span>
                    <span class="spec-value">${laptop.processor}</span>
                </div>
                <div class="spec">
                    <span class="spec-key">RAM:</span>
                    <span class="spec-value">${laptop.ram}</span>
                </div>
                <div class="spec">
                    <span class="spec-key">Storage:</span>
                    <span class="spec-value">${laptop.storage}</span>
                </div>
                <div class="spec">
                    <span class="spec-key">Screen:</span>
                    <span class="spec-value">${laptop.screen}</span>
                </div>
                <div class="spec">
                    <span class="spec-key">Graphics:</span>
                    <span class="spec-value">${laptop.graphics}</span>
                </div>
            </div>
        `).join('');

        searchResultsContainer.innerHTML = `<div class="card-grid">${resultsHtml}</div>`;
    };

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
});