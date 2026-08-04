// Shared helpers for the Google Calendar integration endpoints.
// Files prefixed with "_" inside /api are not routed as functions by Vercel.

import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const STATE_SECRET = process.env.GOOGLE_OAUTH_STATE_SECRET || SERVICE_ROLE_KEY || "";

export function isConfigured() {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && SERVICE_ROLE_KEY && SUPABASE_URL);
}

export function redirectUri(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${host}/api/google/callback`;
}

export function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Verify the caller's Supabase JWT and return the authenticated user.
export async function verifyUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client.auth.getUser(token);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

// ── OAuth state: HMAC-signed so the callback can trust the user id
// without a server-side session store. Expires after 10 minutes.
export function signState(userId) {
  const payload = `${userId}.${Date.now()}`;
  const sig = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyState(state) {
  try {
    const [encoded, sig] = String(state).split(".");
    if (!encoded || !sig) return null;
    const payload = Buffer.from(encoded, "base64url").toString();
    const expected = crypto.createHmac("sha256", STATE_SECRET).update(payload).digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
    const [userId, issuedAt] = payload.split(".");
    if (Date.now() - Number(issuedAt) > 10 * 60 * 1000) return null;
    return userId;
  } catch {
    return null;
  }
}

// ── Google token endpoints ──
export async function exchangeCode(code, redirect) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error(`Token exchange failed: ${res.status}`);
  return res.json();
}

// Exchange the stored refresh token for a short-lived access token.
// Returns null if Google rejected it (revoked access → caller disconnects).
export async function getAccessToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.access_token || null;
}

// The id_token is signed by Google and arrives over TLS straight from the
// token endpoint, so reading the email claim without re-verifying is safe here.
export function emailFromIdToken(idToken) {
  try {
    const payload = JSON.parse(Buffer.from(idToken.split(".")[1], "base64url").toString());
    return payload.email || null;
  } catch {
    return null;
  }
}
