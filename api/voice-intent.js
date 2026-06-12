import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const client = new Anthropic();

// Each call costs API credits — require a valid Supabase JWT so the
// endpoint can't be spammed anonymously.
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

const SYSTEM_PROMPT = `Sei il classificatore di comandi vocali per NomadBalance, un'app di produttività.
Classifica il comando vocale dell'utente in UNO dei seguenti intent.

Intent disponibili:
- addTask: L'utente vuole aggiungere un task, promemoria, nota, attività. Estrai il titolo pulito del task come "param" (rimuovi filler come "scrivi che", "ricordami di", "aggiungi", ecc.).
- logMeal: L'utente menziona cibo, pasti, fame, mangiare, pranzo, cena, colazione, snack.
- startFocus: L'utente vuole avviare una sessione di focus, musica, lavoro, concentrazione.
- pauseTimer: L'utente vuole mettere in pausa (timer, musica, sessione, tutto).
- resumeTimer: L'utente vuole riprendere/continuare (timer, musica, sessione).
- switchRelax: L'utente vuole passare alla modalità relax, rilassarsi, staccare.
- switchFocus: L'utente vuole TORNARE alla modalità focus (da relax). Parole chiave: "torna", "basta relax", "riprendiamo".
- startBreathing: L'utente vuole fare un esercizio di respirazione.
- goAway: L'utente si sta allontanando dalla scrivania (va via, pausa pranzo, esce).
- comeBack: L'utente è tornato alla scrivania (sono qui, eccomi, rientro).
- resetTimer: L'utente vuole resettare/azzerare il timer.

Rispondi SOLO con JSON valido, niente altro:
{"action":"nomeIntent","param":null}

Per addTask il param è il titolo pulito del task. Per tutti gli altri intent param è null.
Se non riconosci nessun intent: {"action":null}

Sii generoso: preferisci riconoscere un intent piuttosto che restituire null.
L'utente parla italiano ma può mescolare parole inglesi. Capisce anche frasi incomplete, colloquiali, dialettali.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { transcript } = req.body;
  if (!transcript?.trim()) {
    return res.status(400).json({ error: "No transcript" });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 100,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: transcript }],
    });

    const text = response.content[0].text.trim();
    const jsonStr = text.replace(/^```json?\n?/, "").replace(/\n?```$/, "");
    const result = JSON.parse(jsonStr);
    return res.status(200).json(result);
  } catch (err) {
    console.error("[voice-intent] error:", err);
    return res.status(500).json({ action: null });
  }
}
