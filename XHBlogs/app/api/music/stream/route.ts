import { NextRequest, NextResponse } from 'next/server';
import { loadCookie } from '@/lib/music/auth-manager';

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get('source') || 'netease';
  const id = request.nextUrl.searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    if (source === 'netease') {
      const cookie = loadCookie();
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 ... Chrome/121.0.0.0 Safari/537.36',
        Referer: 'https://music.163.com/',
      };
      if (cookie?.cookie) headers['Cookie'] = cookie.cookie;

      const res = await fetch(`https://music.163.com/song/media/outer/url?id=${id}.mp3`, { headers });
      if (!res.ok) return new NextResponse('Stream error', { status: res.status });

      // Proxy the audio stream
      const contentType = res.headers.get('content-type') || 'audio/mpeg';
      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (source === 'bilibili') {
      const bvid = id.startsWith('http') ? id.split('/video/')[1]?.split('?')[0]?.replace('/', '') : id;
      if (!bvid) return new NextResponse('Invalid BV号', { status: 400 });

      const { getAudioUrl } = await import('@/lib/music/bilibili');
      const audioUrl = await getAudioUrl(bvid);
      if (!audioUrl) return new NextResponse('Audio URL not found', { status: 404 });

      // Proxy the direct audio stream from B站 CDN
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 ... Chrome/121.0.0.0 Safari/537.36',
        Referer: 'https://www.bilibili.com/',
      };
      const res = await fetch(audioUrl, { headers });
      if (!res.ok) return new NextResponse('Stream error', { status: res.status });

      const body = await res.arrayBuffer();
      return new NextResponse(body, {
        headers: { 'Content-Type': 'audio/mp4', 'Cache-Control': 'public, max-age=86400', 'Access-Control-Allow-Origin': '*' },
      });
    }
    if (source === 'kuwo') {
      const res = await fetch(`https://www.kuwo.cn/url?format=mp3&rid=${id}&response=url&type=convert_url3`);
      const data = await res.json();
      const mp3Url = data?.url;
      if (!mp3Url) return new NextResponse('No stream URL', { status: 404 });

      const stream = await fetch(mp3Url);
      const body = await stream.arrayBuffer();
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    if (source === 'local') {
      // Serve from public/music/ directory
      const fs = await import('fs');
      const fpath = `public/music/${id}`;
      if (!fs.existsSync(fpath)) return new NextResponse('File not found', { status: 404 });
      const buf = fs.readFileSync(fpath);
      return new NextResponse(buf, {
        headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' },
      });
    }

    return new NextResponse('Unknown source', { status: 400 });
  } catch (e: any) {
    return new NextResponse(e.message, { status: 500 });
  }
}
