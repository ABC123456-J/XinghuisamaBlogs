/** Bilibili music source — direct audio stream via DASH API */
import fs from 'fs';
import path from 'path';

const COOKIE_FILE = path.join(process.cwd(), 'data', 'bilibili-cookie.txt');
const BASE = 'https://api.bilibili.com/x/web-interface';

function getHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
    Referer: 'https://www.bilibili.com/',
  };

  // Priority: env vars (Vercel) > cookie file (local dev)
  const sessdata = process.env.BILI_SESSDATA;
  const jct = process.env.BILI_BILI_JCT;
  const uid = process.env.BILI_DEDEUSERID;
  if (sessdata && jct && uid) {
    h['Cookie'] = `SESSDATA=${sessdata}; bili_jct=${jct}; DedeUserID=${uid}`;
    return h;
  }

  // Fallback to local cookie file
  try {
    if (fs.existsSync(COOKIE_FILE)) {
      const raw = fs.readFileSync(COOKIE_FILE, 'utf-8');
      const pairs: string[] = [];
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const parts = trimmed.split('\t');
        if (parts.length >= 7) pairs.push(`${parts[5]}=${parts[6]}`);
      }
      if (pairs.length) h['Cookie'] = pairs.join('; ');
    }
  } catch {}
  return h;
}

export interface BiliSong {
  id: string; name: string; artist: string; cover: string;
  url: string; source: 'bilibili';
}

export async function searchBilibili(keyword: string, limit = 15): Promise<BiliSong[]> {
  const params = new URLSearchParams({ keyword, search_type: 'video', order: 'totalrank', page: '1' });
  const res = await fetch(`${BASE}/search/type?${params}`, { headers: getHeaders() });
  const data = await res.json();
  return (data?.data?.result || []).slice(0, limit).map((v: any) => ({
    id: v.bvid || '', name: v.title?.replace(/<\/?[^>]+(>|$)/g, '') || '',
    artist: v.author || '未知UP主', cover: v.pic || '',
    url: `/api/music/stream?source=bilibili&id=${v.bvid}`,
    source: 'bilibili' as const,
  }));
}

export async function getAudioUrl(bvid: string): Promise<string | null> {
  // Get cid first
  const infoRes = await fetch(`${BASE}/view?bvid=${bvid}`, { headers: getHeaders() });
  const infoData = await infoRes.json();
  const cid = infoData?.data?.cid;
  if (!cid) return null;

  // Get DASH audio stream URL
  const dashRes = await fetch(`https://api.bilibili.com/x/player/playurl?bvid=${bvid}&cid=${cid}&fnval=4048&fourk=1`, { headers: getHeaders() });
  const dashData = await dashRes.json();
  const audio = dashData?.data?.dash?.audio;
  if (!audio || !audio.length) return null;

  // Return highest quality audio URL
  return audio[audio.length - 1]?.baseUrl || audio[0]?.baseUrl || null;
}
