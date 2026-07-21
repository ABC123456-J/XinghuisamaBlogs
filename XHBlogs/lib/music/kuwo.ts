/** Kuwo Music API wrapper — uses public search endpoint, no login needed */
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  Referer: 'https://www.kuwo.cn/',
};

export interface KuwoSong {
  id: string;
  name: string;
  artist: string;
  album: string;
  cover: string;
  url: string;
  source: 'kuwo';
}

export async function searchKuwo(keyword: string, limit = 15): Promise<KuwoSong[]> {
  const params = new URLSearchParams({
    key: keyword, pn: '1', rn: String(limit),
    httpsStatus: '1', reqId: String(Date.now()),
  });
  // Use Kuwo search API
  const res = await fetch(`https://www.kuwo.cn/api/www/search/searchMusicBykeyWord?${params}`, {
    headers: { ...HEADERS, csrf: String(Date.now()), Cookie: 'kw_token=placeholder' },
  });
  const data = await res.json();
  const list = data?.data?.list || [];
  return list.map((s: any) => ({
    id: String(s.rid || s.musicrid?.replace('MUSIC_', '') || ''),
    name: s.name || '',
    artist: s.artist || '未知歌手',
    album: s.album || '',
    cover: s.pic || `https://img3.kuwo.cn/star/albumcover/${s.pic?.split('/').pop()}`,
    url: `https://www.kuwo.cn/url?format=mp3&rid=${s.rid}&response=url&type=convert_url3`,
    source: 'kuwo' as const,
  }));
}
