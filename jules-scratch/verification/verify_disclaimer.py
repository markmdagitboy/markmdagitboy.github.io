from playwright.sync_api import sync_playwright, expect

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the index page
        page.goto("http://localhost:8000/pages/index.html")

        # Click the disclaimer link
        disclaimer_link = page.get_by_role("link", name="Disclaimer")
        disclaimer_link.click()

        # Wait for navigation and check the title
        expect(page).to_have_title("Disclaimer | Marcos Alvarez")

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/disclaimer_page.png")

        browser.close()

if __name__ == "__main__":
    run_verification()