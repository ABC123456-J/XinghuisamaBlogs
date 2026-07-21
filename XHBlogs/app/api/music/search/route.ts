import { NextRequest, NextResponse } from 'next/server';
import { searchNetease } from '@/lib/music/netease';
import { searchKuwo } from '@/lib/music/kuwo';
import { searchBilibili } from '@/lib/music/bilibili';
import fs from 'fs';
import path from 'path';

const CORS = { 'Access-Control-Allow-Origin': '*' };

export async function OPTIONS() {
  return new Response(null, { headers: { ...CORS, 'Access-Control-Allow-Methods': 'GET,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q');
  const source = request.nextUrl.searchParams.get('source') || 'netease';

  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 });

  try {
    if (source === 'netease') {
      const songs = await searchNetease(q);
      return NextResponse.json(songs, { headers: CORS });
    }
    if (source === 'bilibili') {
      const songs = await searchBilibili(q);
      return NextResponse.json(songs, { headers: CORS });
    }
    if (source === 'kuwo') {
      const songs = await searchKuwo(q);
      return NextResponse.json(songs, { headers: CORS });
    }
    if (source === 'local') {
      const dataPath = path.join(process.cwd(), 'data', 'local-music.json');
      if (!fs.existsSync(dataPath)) return NextResponse.json([], { headers: CORS });
      const local = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      const results = local.filter((m: any) => m.title?.includes(q) || m.artist?.includes(q));
      return NextResponse.json(results, { headers: CORS });
    }
    return NextResponse.json({ error: 'Unknown source' }, { status: 400, headers: CORS });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: CORS });
  }
}
