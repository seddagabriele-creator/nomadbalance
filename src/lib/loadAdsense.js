const ADSENSE_SRC =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5955082604612785';

/**
 * Dynamically loads the Google AdSense script if the user has given cookie
 * consent and the script has not already been added to the page.
 *
 * Call this from the cookie-consent component right after the user accepts.
 *
 * @returns {boolean} true if the script was injected, false otherwise.
 */
export function loadAdsenseIfConsented() {
  // Already loaded — nothing to do.
  if (document.querySelector(`script[src="${ADSENSE_SRC}"]`)) {
    return false;
  }

  try {
    const consent = JSON.parse(localStorage.getItem('nb-cookie-consent'));
    if (!consent || consent.accepted !== true) {
      return false;
    }
  } catch {
    return false;
  }

  const script = document.createElement('script');
  script.src = ADSENSE_SRC;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
  return true;
}
