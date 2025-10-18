import re
from playwright.sync_api import Page, expect
import pytest
import subprocess
import time

PORT = 8080
BASE_URL = f"http://localhost:{PORT}"

@pytest.fixture(scope="session", autouse=True)
def start_server():
    # Start the server in a separate process
    server_process = subprocess.Popen(["python", "-m", "http.server", str(PORT)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    # Wait a bit for the server to be ready
    time.sleep(2)
    yield
    # Stop the server
    server_process.terminate()

def test_search_functionality(page: Page):
    page.on("console", lambda msg: print(f"BROWSER CONSOLE: {msg.text}"))
    page.goto(f"{BASE_URL}/pages/projects.html")

    # Click the "Laptops" button to ensure the search bar is visible
    page.get_by_role("button", name="Laptops").click()

    # Find the search input and type a query
    search_input = page.locator("#search-input")
    expect(search_input).to_be_visible()
    search_input.fill("EliteBook")
    page.get_by_role("button", name="Search").click()

    # Wait for the results to be updated
    page.wait_for_selector("#search-results .laptop-card")

    # Check that the results are as expected
    results_container = page.locator("#search-results")
    expect(results_container).to_contain_text("EliteBook")

    # Check that only items with "16GB" are displayed
    laptop_items = results_container.locator(".laptop-card").all()
    assert len(laptop_items) > 0

    for item in laptop_items:
        assert "EliteBook" in item.inner_text()

    # Take a screenshot to visually confirm the results
    page.screenshot(path="search_results.png")