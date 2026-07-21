// app/api/chat/route.ts — DeepSeek + Roxy Skill + Web Search
import { ROXY_SYSTEM_PROMPT, ROXY_CONFIG } from '@/lib/chat/roxy-skill';

export const runtime = 'edge';

// Simple in-memory rate limiter (resets on cold start)
const rateLimit = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 10;      // max requests
const RATE_WINDOW = 60000;  // per 60 seconds

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry || now > entry.reset) {
    rateLimit.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

const SEARCH_TOOL = {
  type: "function",
  function: {
    name: "web_search",
    description: "搜索互联网获取实时信息。当需要知道当前天气、新闻、事实等最新信息时使用。",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "搜索关键词" }
      },
      required: ["query"]
    }
  }
};

async function doSearch(query: string): Promise<string> {
  try {
    // Use DuckDuckGo Instant Answer API (free, no key needed)
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`);
    const data = await res.json() as any;
    const results: string[] = [];
    if (data.AbstractText) results.push(data.AbstractText);
    if (data.RelatedTopics) {
      for (const t of data.RelatedTopics.slice(0, 3)) {
        if (t.Text) results.push(t.Text);
      }
    }
    return results.length ? results.join(' | ') : `未找到关于"${query}"的信息。`;
  } catch {
    return '搜索暂时不可用。';
  }
}

export async function POST(req: Request) {
  try {
    // Rate limit check
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRate(ip)) {
      return new Response(JSON.stringify({ reply: '请稍后再来问我吧……魔术也需要时间吟唱的。' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }

    const { message } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || '';
    if (!apiKey) return new Response(JSON.stringify({ error: "API key missing" }), { status: 500 });

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: ROXY_CONFIG.model,
        messages: [
          { role: 'system', content: ROXY_SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
        tools: [SEARCH_TOOL],
        tool_choice: 'auto',
        max_tokens: ROXY_CONFIG.maxTokens,
        temperature: ROXY_CONFIG.temperature,
      }),
    });

    const data = await response.json() as any;
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'API error' }), { status: response.status });
    }

    const choice = data.choices?.[0];
    const msg = choice?.message;

    // If the model wants to search
    if (msg?.tool_calls?.length) {
      const toolCall = msg.tool_calls[0];
      if (toolCall.function.name === 'web_search') {
        const args = JSON.parse(toolCall.function.arguments);
        const searchResult = await doSearch(args.query);

        // Second call: send search result back
        const res2 = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: ROXY_CONFIG.model,
            messages: [
              { role: 'system', content: ROXY_SYSTEM_PROMPT },
              { role: 'user', content: message },
              { role: 'assistant', content: null, tool_calls: msg.tool_calls },
              { role: 'tool', tool_call_id: toolCall.id, content: searchResult },
            ],
            max_tokens: ROXY_CONFIG.maxTokens,
            temperature: ROXY_CONFIG.temperature,
          }),
        });

        const data2 = await res2.json() as any;
        const reply = data2.choices?.[0]?.message?.content || '……';
        return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    const reply = msg?.content || '……';
    return new Response(JSON.stringify({ reply }), { headers: { 'Content-Type': 'application/json' } });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ status: 'Ready', model: 'DeepSeek + Roxy + Web Search' }), { status: 200 });
}
