import { createClient } from "@supabase/supabase-js";

// RevenueCat → Supabase entitlement mirror.
// Configure in the RevenueCat dashboard (Integrations → Webhooks):
//   URL:    https://nomadbalance.app/api/revenuecat-webhook
//   Header: Authorization: Bearer <REVENUECAT_WEBHOOK_AUTH>
// The app_user_id is the Supabase auth user id (set by the web SDK).

const PRO_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "SUBSCRIPTION_EXTENDED",
  "TRANSFER",
]);
// CANCELLATION only turns off auto-renew — access lasts until EXPIRATION.
const FREE_EVENTS = new Set(["EXPIRATION"]);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const expected = process.env.REVENUECAT_WEBHOOK_AUTH;
  if (!expected || req.headers.authorization !== `Bearer ${expected}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const event = req.body?.event;
  const userId = event?.app_user_id;
  if (!event?.type || !userId) {
    return res.status(400).json({ error: "Malformed event" });
  }

  let plan = null;
  if (PRO_EVENTS.has(event.type)) plan = "pro";
  else if (FREE_EVENTS.has(event.type)) plan = "free";
  if (!plan) {
    // Event we don't act on (e.g. CANCELLATION, BILLING_ISSUE) — ack it
    return res.status(200).json({ ok: true, ignored: event.type });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("[rc-webhook] missing Supabase env vars");
    return res.status(500).json({ error: "Server not configured" });
  }

  try {
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: updated, error: updateError } = await admin
      .from("user_settings")
      .update({ plan, plan_updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select("id");
    if (updateError) throw updateError;

    // User may never have saved settings — create the row so the
    // entitlement mirror exists.
    if (!updated?.length) {
      const { error: insertError } = await admin
        .from("user_settings")
        .insert({ user_id: userId, plan, plan_updated_at: new Date().toISOString() });
      if (insertError) throw insertError;
    }

    return res.status(200).json({ ok: true, plan });
  } catch (err) {
    console.error("[rc-webhook] error:", err);
    // Non-2xx makes RevenueCat retry — that's what we want on DB hiccups
    return res.status(500).json({ error: "Update failed" });
  }
}
