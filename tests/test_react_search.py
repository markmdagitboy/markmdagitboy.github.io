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

def test_search_filters_laptops(page: Page):
    page.goto(f"{BASE_URL}/pages/projects.html")
    page.get_by_role("button", name="Laptops").click()

    # Initially, all laptops should be visible
    expect(page.locator("#elitebook-cards .laptop-card, #zbook-cards .laptop-card")).to_have_count(14)

    search_input = page.locator("#search-input")
    search_input.fill("G8")

    # After searching, only laptops with "G8" should be visible
    expect(page.locator("#elitebook-cards .laptop-card, #zbook-cards .laptop-card")).to_have_count(2)
    page.screenshot(path="jules-scratch/screenshot.png")

    search_input.fill("32 GB")
    expect(page.locator("#elitebook-cards .laptop-card, #zbook-cards .laptop-card")).to_have_count(3)

    search_input.fill("SS03XL")
    expect(page.locator("#elitebook-cards .laptop-card, #zbook-cards .laptop-card")).to_have_count(2)

    search_input.fill('14"')
    expect(page.locator("#elitebook-cards .laptop-card, #zbook-cards .laptop-card")).to_have_count(7)