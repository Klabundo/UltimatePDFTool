from playwright.sync_api import sync_playwright

def verify_frontend(page):
    # Navigate to the React app
    page.goto("http://localhost:5173")

    # Wait for the main heading to ensure app is loaded
    page.wait_for_selector("h1:has-text('Merge PDFs')")

    # Take a screenshot of the default Merge tab
    page.screenshot(path="verification_merge.png")

    # Click on the Split tab
    page.click("button:has-text('Split PDF')")
    page.wait_for_selector("h1:has-text('Split PDF')")

    # Take a screenshot of the Split tab
    page.screenshot(path="verification_split.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_frontend(page)
        finally:
            browser.close()
