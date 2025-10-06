import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Use a local server to ensure fetch requests work
        laptops_path = "http://localhost:8000/pages/laptops.html"
        supply_chain_path = "http://localhost:8000/pages/supply_chain.html"

        # Verify laptops page
        await page.goto(laptops_path)
        await expect(page.locator("#elitebook-cards .laptop-card").first).to_be_visible()
        await expect(page.locator("#zbook-cards .laptop-card").first).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/laptops_page.png")

        # Verify supply chain page
        await page.goto(supply_chain_path)
        await expect(page.locator("#supply-chain-card-container .laptop-card").first).to_be_visible()
        await page.screenshot(path="jules-scratch/verification/supply_chain_page.png")

        await browser.close()

asyncio.run(main())