import asyncio
from playwright.async_api import async_playwright, expect
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Go to the local server
        await page.goto('http://localhost:8000/index.html')

        # Wait for the initial content to load
        await expect(page.locator('#content h2')).to_have_text('Core Competencies')
        await page.screenshot(path='jules-scratch/verification/01_skills.png')

        # Click on the Experience tab
        await page.get_by_role('button', name='Experience').click()
        await expect(page.locator('#content h2')).to_have_text('Professional Experience')
        await page.screenshot(path='jules-scratch/verification/02_experience.png')

        # Click on the Education tab
        await page.get_by_role('button', name='Education').click()
        await expect(page.locator('#content h2')).to_have_text('Education')
        await page.wait_for_timeout(500) # wait 500ms for class to be applied
        await page.screenshot(path='jules-scratch/verification/verification.png')

        await browser.close()

asyncio.run(main())
