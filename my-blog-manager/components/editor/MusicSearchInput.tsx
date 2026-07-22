'use client';

import { useState } from 'react';

interface Song {
  id: string; name: string; artist: string; cover?: string; source: string;
}
interface MusicMeta {
  source: string; id: string; title: string; artist: string; cover?: string;
}

export default function MusicSearchInput({ value, onChange }: {
  value: MusicMeta | null;
  onChange: (m: MusicMeta | null) => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [searching, setSearching] = useState(false);
  const [source, setSource] = useState(value?.source || value?.id ? value?.source || 'netease' : 'netease');
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name.replace(/\.[^.]+$/, ''));
    try {
      const res = await fetch('http://localhost:3000/api/music/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) {
        onChange({
          source: 'local', id: data.file,
          title: file.name.replace(/\.[^.]+$/, ''), artist: '本地上传',
        });
      }
    } catch (err) { console.error('Upload failed', err); }
    setUploading(false);
  }

  async function doSearch() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`http://localhost:3000/api/music/search?q=${encodeURIComponent(query)}&source=${source}`);
      if (res.status === 401) {
        alert('网易云登录已过期，请运行 python scripts/music-login.py 重新登录');
        setResults([]); return;
      }
      const data = await res.json();
      setResults(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch { setResults([]); }
    setSearching(false);
  }

  function select(s: Song) {
    const m = { source: s.source, id: s.id, title: s.name, artist: s.artist, cover: s.cover };
    onChange(m);

    // Directly save to file — bypass publish pipeline
    const params = new URLSearchParams(window.location.search);
    const docId = params.get('id') || 'new';
    const filename = docId === 'new' ? `post_${Date.now()}.md` : `${docId}.md`;
    fetch('http://localhost:3000/api/music/save-to-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, music: m }),
    }).then(r => r.json()).then(d => {
      if (d.success) console.log('BGM saved to file:', d.written, 'copies');
    }).catch(console.error);
  }

  const [directUrl, setDirectUrl] = useState('');

  async function pasteBiliUrl() {
    if (!directUrl.trim()) return;
    const bvid = directUrl.split('/video/')[1]?.split('?')[0] || directUrl.trim();
    // Try to get video info
    try {
      const res = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
        headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.bilibili.com/' }
      });
      const data = await res.json();
      const info = data?.data;
      if (info) {
        onChange({
          source: 'bilibili', id: bvid,
          title: info.title?.replace(/<\/?[^>]+(>|$)/g, '') || 'B站视频',
          artist: info.owner?.name || '未知UP主',
          cover: info.pic || '',
        });
      }
    } catch (e) {
      // Fallback: use BV号 as is
      onChange({ source: 'bilibili', id: bvid, title: `B站: ${bvid}`, artist: 'B站' });
    }
  }

  return (
    <div className="space-y-3">
{source === 'bilibili' && (
        <div className="flex gap-2">
          <input value={directUrl} onChange={e => setDirectUrl(e.target.value)}
            placeholder="或直接粘贴B站视频链接..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-pink-400/50" />
          <button onClick={pasteBiliUrl}
            className="px-3 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/30 rounded-lg text-xs text-pink-300 transition">
            解析
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && doSearch()}
          placeholder="搜索配乐..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-purple-400/50" />
        <select value={source} onChange={e => setSource(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white/70 outline-none">
          <option value="netease">网易云</option>
          <option value="kuwo">酷我</option>
          <option value="bilibili">B站</option>
          <option value="local">本地上传</option>
        </select>
        {source === 'local' ? (
          <label className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-xs text-green-300 cursor-pointer transition">
            {uploading ? '...' : '选择文件'}
            <input type="file" accept="audio/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        ) : (
          <button onClick={doSearch} disabled={searching}
          className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-xs text-purple-300 transition">
          {searching ? '...' : '搜索'}
        </button>
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1 bg-white/3 rounded-lg p-2">
          {results.map(s => (
            <button key={s.id + s.source} onClick={() => select(s)}
              className="w-full text-left flex items-center gap-2 p-2 rounded hover:bg-white/5 transition text-xs">
              <span className="truncate flex-1 text-white/80">{s.name}</span>
              <span className="text-white/30 text-[10px]">{s.artist}</span>
              <span className="text-white/15 text-[8px]">{s.source === 'netease' ? '网易' : '酷我'}</span>
            </button>
          ))}
        </div>
      )}

      {/* Selected */}
      {value && (
        <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-400/20 rounded-lg px-3 py-2">
          <span className="text-purple-300 text-xs">🎵</span>
          <span className="text-white/80 text-xs truncate flex-1">{value.title} · {value.artist}</span>
          <button onClick={() => onChange(null)}
            className="text-white/20 hover:text-white/50 text-xs">✕</button>
        </div>
      )}
    </div>
  );
}
