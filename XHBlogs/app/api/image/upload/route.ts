import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function OPTIONS() {
  return new Response(null, {
    headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'png';
    const safeName = `upload_${Date.now()}.${ext}`;
    const imgDir = path.join(process.cwd(), 'public', 'images');
    fs.mkdirSync(imgDir, { recursive: true });
    const filePath = path.join(imgDir, safeName);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, url: `/images/${safeName}` }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
