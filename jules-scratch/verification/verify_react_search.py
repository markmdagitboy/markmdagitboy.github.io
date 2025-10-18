from playwright.sync_api import sync_playwright, Page, expect
import subprocess
import time

PORT = 8080
BASE_URL = f"http://localhost:{PORT}"

def run_test():
    server_process = subprocess.Popen(["python", "-m", "http.server", str(PORT)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(2)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto(f"{BASE_URL}/pages/projects.html")

        # Click the "Laptops" button to ensure the search bar is visible
        page.get_by_role("button", name="Laptops").click()

        # Find the search input and type a query
        search_input = page.locator("#search-input")
        expect(search_input).to_be_visible()
        search_input.fill("G8")

        # Wait for the results to be updated
        expect(page.locator("#elitebook-cards .laptop-card, #zbook-cards .laptop-card")).to_have_count(2)

        page.screenshot(path="jules-scratch/verification/verification.png")

        browser.close()
    server_process.terminate()

if __name__ == "__main__":
    run_test()