/** Cookie manager for NetEase Cloud Music login state */
import fs from 'fs';
import path from 'path';

const COOKIE_PATH = path.join(process.cwd(), 'data', 'netease-cookie.json');

interface CookieData {
  cookie: string;
  updatedAt: string;
  musicU: string;
}

export function saveCookie(cookie: string, musicU: string = '') {
  const data: CookieData = {
    cookie,
    musicU,
    updatedAt: new Date().toISOString(),
  };
  fs.mkdirSync(path.dirname(COOKIE_PATH), { recursive: true });
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(data, null, 2));
}

export function loadCookie(): CookieData | null {
  try {
    if (!fs.existsSync(COOKIE_PATH)) return null;
    return JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

export function isCookieExpired(maxAgeHours: number = 12): boolean {
  const data = loadCookie();
  if (!data) return true;
  const age = (Date.now() - new Date(data.updatedAt).getTime()) / 3600000;
  return age > maxAgeHours;
}
