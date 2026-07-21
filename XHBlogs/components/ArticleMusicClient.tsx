'use client';

import { useEffect, useState } from 'react';
import ArticleBGM from './ArticleBGM';

interface MusicInfo {
  source: 'netease' | 'kuwo' | 'local' | 'bilibili';
  id: string;
  title: string;
  artist: string;
  cover?: string;
}

export default function ArticleMusicClient({ slug }: { slug: string }) {
  const [music, setMusic] = useState<MusicInfo | null>(null);

  useEffect(() => {
    fetch(`/api/music/get-post-music?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(data => {
        if (data && data.source && data.id) setMusic(data);
      })
      .catch(() => {});
  }, [slug]);

  if (!music) return null;
  return <ArticleBGM music={music} />;
}
