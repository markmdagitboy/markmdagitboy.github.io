from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()

    # Navigate to the projects page
    page.goto("http://localhost:8000/pages/projects.html")

    # Wait for the laptops section to be visible
    laptops_section = page.locator("#laptops")
    expect(laptops_section).to_be_visible()

    # Take a screenshot of the initial laptops view
    page.screenshot(path="jules-scratch/verification/projects-laptops-view.png")

    # Click the supply chain button
    supply_chain_button = page.locator("#supply-chain-btn")
    supply_chain_button.click()

    # Wait for the supply chain section to be visible
    supply_chain_section = page.locator("#supply-chain")
    expect(supply_chain_section).to_be_visible()

    # And the laptops section to be hidden
    expect(laptops_section).to_be_hidden()

    # Take a screenshot of the supply chain view
    page.screenshot(path="jules-scratch/verification/projects-supply-chain-view.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)