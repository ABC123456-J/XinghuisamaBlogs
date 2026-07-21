"""Bilibili login — opens browser, you login manually, then cookies saved."""
import time, json, os

COOKIE_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'bilibili-cookie.txt')

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    os.system("pip install playwright")
    from playwright.sync_api import sync_playwright

print("=" * 50)
print("  Bilibili Login")
print("  Browser will open. Login manually.")
print("  Close the browser when done.")
print("=" * 50)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page(viewport={'width': 1200, 'height': 800})
    page.goto('https://passport.bilibili.com/login', wait_until='domcontentloaded')

    print("\nLogin page opened. Scan QR code with B站 app.")
    print("After login, you'll see the homepage. Close the browser window.")

    # Wait until the browser is closed by the user
    while page.is_closed() == False:
        try:
            time.sleep(1)
        except:
            break

    # Capture cookies from all pages
    cookies = browser.contexts[0].cookies() if browser.contexts else []
    browser.close()

    if cookies:
        # Netscape format for yt-dlp
        lines = ['# Netscape HTTP Cookie File']
        for c in cookies:
            domain = c.get('domain', '.bilibili.com')
            flag = 'TRUE' if domain.startswith('.') else 'FALSE'
            path = c.get('path', '/')
            secure = 'TRUE' if c.get('secure', False) else 'FALSE'
            expiry = str(int(c.get('expires', 0))) if c.get('expires') and c['expires'] > 0 else '0'
            name = c.get('name', '')
            value = c.get('value', '')
            lines.append('\t'.join([domain, flag, path, secure, expiry, name, value]))
        os.makedirs(os.path.dirname(COOKIE_FILE), exist_ok=True)
        with open(COOKIE_FILE, 'w', encoding='utf-8') as f:
            f.write('\n'.join(lines))
        print(f"\nSaved {len(cookies)} cookies in Netscape format!")
    else:
        print("\nNo cookies captured. Try again.")
