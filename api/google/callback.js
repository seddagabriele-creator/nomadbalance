import { admin, emailFromIdToken, exchangeCode, isConfigured, redirectUri, verifyState } from "../_lib/google.js";

// Google redirects here after consent. Stores the refresh token server-side
// and flags the connection on user_settings, then bounces back to the app.
export default async function handler(req, res) {
  const back = (status) => {
    res.writeHead(302, { Location: `/journal?calendar=${status}` });
    res.end();
  };

  if (!isConfigured()) return back("unavailable");

  const { code, state, error } = req.query || {};
  if (error || !code || !state) return back("denied");

  const userId = verifyState(state);
  if (!userId) return back("expired");

  try {
    const tokens = await exchangeCode(code, redirectUri(req));
    if (!tokens.refresh_token) {
      // Google only re-issues a refresh token with prompt=consent; without
      // one we could not sync later, so treat it as a failed connection.
      return back("error");
    }

    const db = admin();
    const email = tokens.id_token ? emailFromIdToken(tokens.id_token) : null;

    await db.from("google_credentials").upsert({
      user_id: userId,
      refresh_token: tokens.refresh_token,
      calendar_id: "primary",
      updated_at: new Date().toISOString(),
    });

    const patch = {
      google_calendar_connected: true,
      google_calendar_email: email,
      google_calendar_prompt_dismissed: true,
    };
    const { data: updated } = await db
      .from("user_settings")
      .update(patch)
      .eq("user_id", userId)
      .select("id");
    if (!updated?.length) {
      await db.from("user_settings").insert({ user_id: userId, ...patch });
    }

    return back("connected");
  } catch (err) {
    console.error("[google/callback] error:", err);
    return back("error");
  }
}
