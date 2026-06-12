-- Subscription entitlement mirror, kept in sync by /api/revenuecat-webhook.
-- The client treats user_settings.plan = 'pro' as an active subscription
-- (fallback when the RevenueCat SDK is unavailable).

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN user_settings.plan IS 'free | pro — mirrored from RevenueCat via webhook';
