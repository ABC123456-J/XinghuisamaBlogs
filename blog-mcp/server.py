"""Blog Management MCP Server — lets Claude Code manage posts/config/assets."""
import json, os, shutil
from pathlib import Path
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

BLOG_ROOT = Path(r"D:\123pan\Downloads\untitled\XinghuisamaBlogs\XHBlogs")
POSTS_DIR = BLOG_ROOT / "posts"
PUBLIC_DIR = BLOG_ROOT / "public"
IMAGES_DIR = PUBLIC_DIR / "images"
MUSIC_DIR = PUBLIC_DIR / "music"

for d in [POSTS_DIR, IMAGES_DIR, MUSIC_DIR]:
    d.mkdir(parents=True, exist_ok=True)

server = Server("blog-manager")

@server.list_tools()
async def list_tools():
    return [
        Tool(name="list_posts", description="List all blog posts", inputSchema={"type":"object","properties":{}}),
        Tool(name="read_post", description="Read a post by filename", inputSchema={
            "type":"object","properties":{"filename":{"type":"string"}},"required":["filename"]
        }),
        Tool(name="create_post", description="Create a new blog post", inputSchema={
            "type":"object","properties":{
                "filename":{"type":"string"},"title":{"type":"string"},"content":{"type":"string"},
                "tags":{"type":"string"},"cover":{"type":"string"},"description":{"type":"string"},
                "music_id":{"type":"string"},"music_source":{"type":"string"},"music_title":{"type":"string"},"music_artist":{"type":"string"},
            },"required":["filename","title","content"]
        }),
        Tool(name="read_config", description="Read siteConfig.ts", inputSchema={"type":"object","properties":{}}),
        Tool(name="upload_image", description="Upload an image to public/images/", inputSchema={
            "type":"object","properties":{"source_path":{"type":"string"},"target_name":{"type":"string"}},"required":["source_path"]
        }),
    ]

@server.call_tool()
async def call_tool(name: str, args: dict):
    if name == "list_posts":
        files = sorted([f.name for f in POSTS_DIR.glob("*.md")])
        return [TextContent(type="text", text=json.dumps(files, ensure_ascii=False))]

    if name == "read_post":
        fpath = POSTS_DIR / args["filename"]
        if not fpath.exists(): return [TextContent(type="text", text=f"Error: not found")]
        return [TextContent(type="text", text=fpath.read_text(encoding="utf-8"))]

    if name == "create_post":
        from datetime import datetime
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        music_yaml = ""
        if args.get("music_id"):
            music_yaml = f'''music:
  source: {args.get("music_source","netease")}
  id: "{args["music_id"]}"
  title: "{args.get("music_title","")}"
  artist: "{args.get("music_artist","")}"
'''
        content = f'''---
title: "{args["title"]}"
date: "{now}"
description: "{args.get("description","")}"
tags: [{args.get("tags","")}]
cover: {args.get("cover","")}
{music_yaml}---

{args["content"]}
'''
        (POSTS_DIR / args["filename"]).write_text(content, encoding="utf-8")
        return [TextContent(type="text", text=f"Created: {args['filename']}")]

    if name == "read_config":
        config = (BLOG_ROOT / "siteConfig.ts").read_text(encoding="utf-8")
        return [TextContent(type="text", text=config)]

    if name == "upload_image":
        src = Path(args["source_path"])
        tgt = IMAGES_DIR / (args.get("target_name") or src.name)
        shutil.copy(src, tgt)
        return [TextContent(type="text", text=json.dumps({"success":True,"url":f"/images/{tgt.name}"}))]

    return [TextContent(type="text", text=f"Unknown: {name}")]

async def main():
    async with stdio_server() as (read, write):
        await server.run(read, write, server.create_initialization_options())

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
