// AdSense serving control.
//
// Ads load paused (inline snippet in index.html) and are unpaused when:
//   1. The user is on a public content route (blog, guide) — always
//   2. The user is authenticated but on the free plan — in-app banner
// Pro subscribers never see ads anywhere.

export function syncAdServing({ isAuthenticated, isProSubscriber } = {}) {
  if (typeof window === "undefined") return;
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    // Pro = no ads. Everyone else (free users + anonymous visitors) = ads.
    window.adsbygoogle.pauseAdRequests = isProSubscriber ? 1 : 0;
  } catch {
    // Ad blocker or script failed to load
  }
}
