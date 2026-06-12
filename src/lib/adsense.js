// AdSense serving control.
//
// The adsbygoogle script loads on every page (it's in index.html so the
// static HTML Google reviews includes it), but ad REQUESTS start paused
// (inline snippet in index.html). We unpause only on public, content-rich
// routes — blog articles, blog index, guides — and only for visitors
// without a Pro subscription. The authenticated app never shows ads:
// auth-gated screens are invisible to the AdSense crawler and serving
// ads there is both a policy risk and bad UX.

const CONTENT_ROUTE_RE = /^\/(blog(\/|$)|guide\/)/;

export function isAdRoute(pathname) {
  return CONTENT_ROUTE_RE.test(pathname);
}

export function syncAdServing(pathname, { isProSubscriber } = {}) {
  if (typeof window === "undefined") return;
  try {
    window.adsbygoogle = window.adsbygoogle || [];
    const allow = isAdRoute(pathname) && !isProSubscriber;
    window.adsbygoogle.pauseAdRequests = allow ? 0 : 1;
  } catch {
    // Ad blocker or script failed to load — nothing to do
  }
}
