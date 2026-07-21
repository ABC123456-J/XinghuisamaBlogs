'use client';

import { useState, useRef, useEffect } from 'react';

interface MusicInfo {
  source: 'netease' | 'kuwo' | 'local';
  id: string;
  title: string;
  artist: string;
  cover?: string;
}

export default function ArticleBGM({ music }: { music: MusicInfo }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const audioRef = useRef<HTMLAudioElement>(null);

  const streamUrl = `/api/music/stream?source=${music.source}&id=${music.id}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(fmt(audio.currentTime));
      }
    };
    const onMeta = () => setDuration(fmt(audio.duration));
    const onEnd = () => { setPlaying(false); setProgress(0); };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
    };
  }, []);

  function toggle() {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(() => {}); setPlaying(true); }
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-3 flex items-center gap-3 my-4 w-full max-w-sm">
      <audio ref={audioRef} src={streamUrl} preload="auto" loop />

      {/* Play button */}
      <button onClick={toggle}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center flex-shrink-0 transition">
        {playing ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="8,5 19,12 8,19"/></svg>
        )}
      </button>

      {/* Song info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-xs font-medium truncate">{music.title}</span>
          <span className="text-white/30 text-[10px]">· {music.artist}</span>
          <span className="text-white/10 text-[8px] uppercase ml-auto">{music.source === 'local' ? '本 地' : music.source === 'kuwo' ? '酷 我' : '网 易'}</span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-1 bg-white/5 rounded-full mt-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-400/60 to-pink-400/60 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }} />
        </div>
        <div className="flex justify-between mt-0.5">
          <span className="text-white/20 text-[9px]">{currentTime}</span>
          <span className="text-white/20 text-[9px]">{duration}</span>
        </div>
      </div>
    </div>
  );
}

function fmt(s: number): string {
  if (!s || !isFinite(s)) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}
