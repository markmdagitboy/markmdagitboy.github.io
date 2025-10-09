from playwright.sync_api import sync_playwright, Page, expect

def test_accessories_section(page: Page):
    """
    This test verifies that the Laptop Accessories section on the projects page
    loads correctly after clicking the toggle button.
    """
    # Listen for and print console messages
    def handle_console(msg):
        print(f"BROWSER CONSOLE ({msg.type}): {msg.text}")
    page.on("console", handle_console)

    # 1. Arrange: Go to the projects page.
    page.goto("http://localhost:8000/pages/projects.html")

    # 2. Act: Find the "Laptop Accessories" button and click it.
    accessories_button = page.get_by_role("button", name="Laptop Accessories")
    accessories_button.click()

    # 3. Assert: Confirm the accessories section is visible and contains content.
    accessories_section = page.locator("#accessories")
    expect(accessories_section).to_be_visible()

    # Wait for a specific element that should be dynamically loaded.
    expected_card_title = "HP USB-C Dock G5"
    expect(page.get_by_text(expected_card_title)).to_be_visible()

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/accessories_section.png")

# --- Main execution block ---
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    test_accessories_section(page)
    browser.close()