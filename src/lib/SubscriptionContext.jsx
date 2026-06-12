import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { userSettingsService } from "@/api/services";

// ─── Subscription / entitlement layer ────────────────────────────────
// Free  = live the day: timer, fasting, exercise breaks, today's tasks.
// Pro   = memory + intelligence: Reports, task history, voice assistant,
//         full audio library.
//
// Entitlement resolution (any one grants Pro):
//   1. Billing not configured (no VITE_REVENUECAT_PUBLIC_KEY) → everything
//      unlocked. Kill-switch so production keeps working until the
//      RevenueCat account is set up.
//   2. Active RevenueCat "pro" entitlement (client SDK).
//   3. user_settings.plan === "pro" — mirror kept fresh by the
//      /api/revenuecat-webhook, works even if the RC SDK fails to load.
//   4. Trial: 14 days from account creation (auth user created_at).

const RC_PUBLIC_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_KEY;
const ENTITLEMENT_ID = "pro";
export const TRIAL_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const SubscriptionContext = createContext(null);

export function SubscriptionProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const purchasesRef = useRef(null);
  const [rcEntitlementActive, setRcEntitlementActive] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const billingEnabled = !!RC_PUBLIC_KEY;

  // Shares the cache with Dashboard/Settings — no extra network request
  const { data: settings = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
    enabled: isAuthenticated,
  });
  const mirroredPlan = settings[0]?.plan;

  // ── RevenueCat SDK (lazy: only when billing is configured) ──
  useEffect(() => {
    if (!billingEnabled || !user?.id) return;
    let cancelled = false;

    (async () => {
      try {
        const { Purchases } = await import("@revenuecat/purchases-js");
        const purchases = Purchases.configure(RC_PUBLIC_KEY, user.id);
        purchasesRef.current = purchases;
        const info = await purchases.getCustomerInfo();
        if (!cancelled) {
          setRcEntitlementActive(!!info?.entitlements?.active?.[ENTITLEMENT_ID]);
        }
      } catch (err) {
        // SDK failure must never lock a paying user out — the webhook
        // mirror (user_settings.plan) still grants the entitlement.
        console.error("[Subscription] RevenueCat init error:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [billingEnabled, user?.id]);

  // ── Trial: 14 days from account creation ──
  const trialEndsAt = useMemo(() => {
    if (!user?.created_at) return null;
    return new Date(new Date(user.created_at).getTime() + TRIAL_DAYS * DAY_MS);
  }, [user?.created_at]);

  const isProSubscriber = rcEntitlementActive || mirroredPlan === "pro";
  const trialActive = !isProSubscriber && !!trialEndsAt && Date.now() < trialEndsAt.getTime();
  const trialDaysLeft = trialActive
    ? Math.max(1, Math.ceil((trialEndsAt.getTime() - Date.now()) / DAY_MS))
    : 0;

  const isPro = !billingEnabled || isProSubscriber || trialActive;

  // ── Actions ──
  const promptUpgrade = useCallback(() => setShowUpgradeModal(true), []);
  const closeUpgrade = useCallback(() => setShowUpgradeModal(false), []);

  const purchase = useCallback(async (period /* "monthly" | "annual" */) => {
    const purchases = purchasesRef.current;
    if (!purchases) throw new Error("Billing is not available right now.");
    setPurchasing(true);
    try {
      const offerings = await purchases.getOfferings();
      const packages = offerings?.current?.availablePackages || [];
      const wanted = period === "annual" ? "$rc_annual" : "$rc_monthly";
      const pkg =
        packages.find((p) => p.identifier === wanted || p.packageType?.toLowerCase() === period) ||
        packages[0];
      if (!pkg) throw new Error("No subscription plan is configured yet.");

      await purchases.purchase({ rcPackage: pkg });

      const info = await purchases.getCustomerInfo();
      const active = !!info?.entitlements?.active?.[ENTITLEMENT_ID];
      setRcEntitlementActive(active);
      if (active) {
        setShowUpgradeModal(false);
        queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      }
      return active;
    } finally {
      setPurchasing(false);
    }
  }, [queryClient]);

  const value = useMemo(() => ({
    billingEnabled,
    isPro,
    isProSubscriber,
    trialActive,
    trialDaysLeft,
    trialEndsAt,
    purchasing,
    promptUpgrade,
    closeUpgrade,
    showUpgradeModal,
    purchase,
  }), [billingEnabled, isPro, isProSubscriber, trialActive, trialDaysLeft, trialEndsAt, purchasing, promptUpgrade, closeUpgrade, showUpgradeModal, purchase]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
}
