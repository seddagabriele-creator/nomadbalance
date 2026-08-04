import { GOOGLE_CLIENT_ID, GOOGLE_SCOPES, isConfigured, redirectUri, signState, verifyUser } from "../_lib/google.js";

// Builds the Google consent URL for the signed-in user. The user id travels
// in an HMAC-signed `state` so the callback can trust it.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: "Google Calendar is not configured on this deployment" });
  }

  const user = await verifyUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri(req),
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",     // ask for a refresh token
    prompt: "consent",          // guarantee one is issued on re-connect
    include_granted_scopes: "true",
    state: signState(user.id),
  });

  return res.status(200).json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
}
