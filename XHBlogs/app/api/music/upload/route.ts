import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function OPTIONS() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || file.name.replace(/\.[^.]+$/, '');
    const artist = formData.get('artist') as string || '未知';

    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    // Save file to public/music/
    const musicDir = path.join(process.cwd(), 'public', 'music');
    fs.mkdirSync(musicDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = path.join(musicDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    // Update local-music.json
    const dataPath = path.join(process.cwd(), 'data', 'local-music.json');
    let musicList: any[] = [];
    if (fs.existsSync(dataPath)) {
      musicList = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    }
    musicList.push({
      id: safeName,
      title,
      artist,
      cover: '/music/placeholder.svg',
      source: 'local',
      url: `/music/${safeName}`,
      addedAt: new Date().toISOString(),
    });
    fs.mkdirSync(path.dirname(dataPath), { recursive: true });
    fs.writeFileSync(dataPath, JSON.stringify(musicList, null, 2));

    return NextResponse.json({ success: true, file: safeName, url: `/music/${safeName}` }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
