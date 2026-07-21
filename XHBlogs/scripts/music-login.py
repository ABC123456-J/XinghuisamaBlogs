"""Scrapling-based NetEase Cloud Music login capturer.

Usage: python scripts/music-login.py
Opens a browser to music.163.com, waits for user to scan QR code,
then saves the cookie to data/netease-cookie.json
"""
import time, json, os, sys

# Add Scrapling path if needed
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("Installing playwright...")
    os.system("pip install playwright && python -m playwright install chromium")
    from playwright.sync_api import sync_playwright

COOKIE_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'netease-cookie.json')

print("=" * 50)
print("  NetEase Music Login Helper")
print("  A browser will open. Scan the QR code to login.")
print("=" * 50)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page(viewport={'width': 800, 'height': 900})

    # Go to login page
    page.goto('https://music.163.com/#/login', wait_until='domcontentloaded')
    time.sleep(2)

    # Try to click the QR code tab if it exists
    try:
        page.click('text=二维码登录') or page.click('[class*=qrcode]') or page.click('[class*=QR]')
    except:
        pass

    print("\nPlease scan the QR code in the browser window...")
    print("Waiting for login (max 2 minutes)...\n")

    # Wait for the user to login (check for user info in page)
    for i in range(120):
        try:
            # Check if login succeeded by looking for user avatar or nickname
            logged_in = page.evaluate("""
                return !!document.querySelector('[class*=avatar], [class*=nickname], .m-toolbar .icn.fav, [class*=user]');
            """)
            if logged_in:
                print("Login detected!")
                break
        except:
            pass
        time.sleep(1)
        if i % 10 == 0:
            print(f"  Still waiting... ({i}s)")

    # Extract cookies
    all_cookies = page.context.cookies()
    cookie_str = '; '.join([f'{c["name"]}={c["value"]}' for c in all_cookies])

    # Find MUSIC_U
    music_u = ''
    for c in all_cookies:
        if c['name'] == 'MUSIC_U':
            music_u = c['value']
            break

    browser.close()

    # Save
    os.makedirs(os.path.dirname(COOKIE_PATH), exist_ok=True)
    with open(COOKIE_PATH, 'w', encoding='utf-8') as f:
        json.dump({
            'cookie': cookie_str,
            'musicU': music_u,
            'updatedAt': time.strftime('%Y-%m-%dT%H:%M:%S'),
        }, f, ensure_ascii=False, indent=2)

    print(f"\nCookie saved to: {COOKIE_PATH}")
    print(f"MUSIC_U: {music_u[:20] if music_u else 'N/A'}...")
    print("Done!")
