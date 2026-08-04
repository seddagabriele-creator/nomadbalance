import { admin, isConfigured, verifyUser } from "../_lib/google.js";

// Forgets the stored refresh token and clears the connection flags.
// Existing calendar events are left alone — they're the user's data.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isConfigured()) return res.status(503).json({ error: "Not configured" });

  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const db = admin();
    await db.from("google_credentials").delete().eq("user_id", user.id);
    await db
      .from("user_settings")
      .update({ google_calendar_connected: false, google_calendar_email: null })
      .eq("user_id", user.id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[google/disconnect] error:", err);
    return res.status(500).json({ error: "Disconnect failed" });
  }
}
