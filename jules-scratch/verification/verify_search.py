from playwright.sync_api import sync_playwright, expect
import traceback

def run(playwright):
    # Listen for all console messages
    def handle_console(msg):
        print(f"Browser console ({msg.type}): {msg.text}")

    try:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page()
        page.on("console", handle_console)

        print("Navigating to the page...")
        page.goto("http://localhost:8000/pages/projects.html", timeout=60000)
        print("Page loaded.")

        print("Filling search input...")
        page.get_by_placeholder("Search for laptops...").fill("HP EliteBook G5")
        print("Search input filled.")

        print("Clicking search button...")
        page.get_by_role("button", name="Search").click()
        print("Search button clicked.")

        # Wait for the results to appear
        print("Waiting for search results...")
        results = page.locator("#search-results .laptop-card")
        print(f"Found {results.count()} results.")
        expect(results).to_have_count(1, timeout=10000)
        print("Search results are visible and count is correct.")

        # Take a screenshot
        print("Taking screenshot...")
        page.screenshot(path="jules-scratch/verification/verification.png", full_page=True)
        print("Screenshot taken.")

        browser.close()

    except Exception as e:
        print(f"An error occurred during Playwright execution: {e}")
        traceback.print_exc()

with sync_playwright() as playwright:
    run(playwright)