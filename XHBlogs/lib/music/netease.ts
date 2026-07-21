/** NetEase Cloud Music API wrapper */
import { loadCookie } from './auth-manager';

const BASE = 'https://music.163.com/api';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com/',
};

function getHeaders() {
  const h = { ...HEADERS } as Record<string, string>;
  const cookie = loadCookie();
  if (cookie?.cookie) h['Cookie'] = cookie.cookie;
  return h;
}

export interface SongResult {
  id: string;
  name: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  lrc?: string;
  source: 'netease';
}

export async function searchNetease(keyword: string, limit = 15): Promise<SongResult[]> {
  const params = new URLSearchParams({ s: keyword, type: '1', limit: String(limit), offset: '0' });
  const res = await fetch(`${BASE}/search/get?${params}`, { headers: getHeaders() });
  const data = await res.json();
  const songs = data?.result?.songs || [];
  return songs.map((s: any) => ({
    id: String(s.id),
    name: s.name,
    artist: (s.artists || []).map((a: any) => a.name).join(' / ') || '未知歌手',
    album: s.album?.name || '',
    cover: s.album?.picUrl || '',
    url: `https://music.163.com/song/media/outer/url?id=${s.id}.mp3`,
    source: 'netease' as const,
  }));
}

export async function getSongDetailNetease(id: string) {
  const res = await fetch(`${BASE}/song/detail/?id=${id}&ids=[${id}]`, { headers: getHeaders() });
  const data = await res.json();
  const song = data?.songs?.[0];
  if (!song) return null;
  return {
    id: String(song.id),
    name: song.name,
    artist: (song.artists || []).map((a: any) => a.name).join(' / '),
    cover: song.album?.picUrl || '',
    url: `https://music.163.com/song/media/outer/url?id=${song.id}.mp3`,
    source: 'netease' as const,
  };
}
