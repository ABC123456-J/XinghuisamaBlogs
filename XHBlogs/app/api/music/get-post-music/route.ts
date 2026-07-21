/** Reads music from markdown frontmatter fresh on every request — bypasses Next.js build cache */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) return NextResponse.json(null, { status: 400 });

  try {
    const fpath = path.join(process.cwd(), 'posts', `${slug}.md`);
    if (!fs.existsSync(fpath)) return NextResponse.json(null);

    const content = fs.readFileSync(fpath, 'utf-8');
    const parts = content.split('---');
    if (parts.length < 3) return NextResponse.json(null);

    const fm = parts[1];
    const lines = fm.split('\n');
    const music: any = {};

    let inMusic = false;
    for (const line of lines) {
      if (line.startsWith('music:')) { inMusic = true; continue; }
      if (inMusic) {
        if (line.startsWith('  source:')) music.source = line.split(':')[1].trim();
        else if (line.startsWith('  id:')) music.id = line.split(':')[1].trim().replace(/['"]/g, '');
        else if (line.startsWith('  title:')) music.title = line.split(':')[1].trim().replace(/['"]/g, '');
        else if (line.startsWith('  artist:')) music.artist = line.split(':')[1].trim().replace(/['"]/g, '');
        else if (line.startsWith('  cover:')) music.cover = (line.split(':').slice(1).join(':').trim().replace(/['"]/g, '')) || '';
        else if (line.trim() && !line.startsWith('  ')) break; // exit music block
      }
    }

    if (!music.source || !music.id) return NextResponse.json(null);
    return NextResponse.json(music, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-cache' },
    });
  } catch {
    return NextResponse.json(null);
  }
}
