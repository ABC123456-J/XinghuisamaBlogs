/** Direct music save — bypasses the complex publish pipeline.
 *  POST { filename: "post_xxx.md", music: { source, id, title, artist, cover } }
 *  Writes the music field directly into the post's markdown frontmatter.
 */
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function OPTIONS() {
  return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
}

export async function POST(request: NextRequest) {
  try {
    const { filename, music } = await request.json();
    if (!filename || !music) return NextResponse.json({ error: 'filename and music required' }, { status: 400 });

    // Write to both admin manager and blog frontend
    const paths = [
      path.join(process.cwd().replace('my-blog-manager', 'XHBlogs'), 'posts', filename),
      path.join(process.cwd(), 'posts', filename),
    ];

    let written = 0;
    for (const filePath of paths) {
      if (!fs.existsSync(filePath)) continue;

      let content = fs.readFileSync(filePath, 'utf-8');
      const parts = content.split('---', 3);

      if (parts.length >= 3) {
        // Remove existing music block if any
        let fm = parts[1];
        fm = fm.replace(/\nmusic:[\s\S]*?(?=\n\w+:|$)/g, '');

        // Build YAML music block
        const musicYaml = `\nmusic:\n  source: ${music.source}\n  id: "${music.id}"\n  title: "${music.title}"\n  artist: "${music.artist}"\n  cover: "${music.cover || ''}"`;

        const newContent = `---${fm}${musicYaml}\n---${parts[2]}`;
        fs.writeFileSync(filePath, newContent, 'utf-8');
        written++;
      }
    }

    return NextResponse.json({ success: true, written, music }, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}
