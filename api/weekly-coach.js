import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

// AI Weekly Coach — analyzes the user's recent work patterns and returns
// personalized, actionable insights. Pro feature: each call costs API
// credits, so the endpoint requires a valid Supabase JWT.

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the weekly productivity coach inside NomadBalance, an app for remote workers built on four pillars: Flow (focus timer sessions), Fuel (intermittent fasting / meal timing), Body (scheduled exercise breaks), and Journal (daily tasks).

You receive aggregated statistics from the user's recent work days. Analyze them and produce personalized insights.

Respond ONLY with valid JSON, no markdown fences:
{
  "headline": "One encouraging sentence summarizing their week",
  "insights": [
    { "emoji": "🎯", "title": "Short punchy title", "body": "2-3 sentences: the specific pattern you noticed in THEIR data and one concrete, actionable suggestion." }
  ]
}

Rules:
- Exactly 3 insights, each grounded in the actual numbers provided — quote specific figures from their data.
- Be a coach, not a cheerleader: name what's working AND what's slipping.
- One insight should always look at consistency (streak, active days).
- Suggestions must be small and doable tomorrow, not lifestyle overhauls.
- Match the user's language (the app is in English — write in English).
- Never invent data that wasn't provided.`;

async function verifyUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    const supabase = createClient(url, anonKey);
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { stats } = req.body || {};
  if (!stats || typeof stats !== "object") {
    return res.status(400).json({ error: "Missing stats" });
  }

  // Cap payload size — the client sends aggregates, not raw history
  const statsJson = JSON.stringify(stats);
  if (statsJson.length > 8000) {
    return res.status(400).json({ error: "Stats payload too large" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `My recent work data:\n${statsJson}` }],
    });

    const text = response.content[0].text.trim();
    const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const result = JSON.parse(jsonStr);

    if (!result.headline || !Array.isArray(result.insights)) {
      throw new Error("Malformed coach response");
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("[weekly-coach] error:", err);
    return res.status(500).json({ error: "Coach unavailable, try again later" });
  }
}
