import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { loadAdsenseIfConsented } from '@/lib/loadAdsense';

const STORAGE_KEY = 'nb-cookie-consent';

/**
 * Returns true if the user has accepted cookies.
 */
export function hasConsent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data.accepted === true;
  } catch {
    return false;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accepted: true, timestamp: new Date().toISOString() })
    );
    loadAdsenseIfConsented();
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ accepted: false, timestamp: new Date().toISOString() })
    );
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 shadow-2xl backdrop-blur-xl sm:bottom-6 sm:left-6 sm:right-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-slate-300">
              We use cookies for analytics and to show relevant ads via Google
              AdSense.{' '}
              <a
                href="/cookies"
                className="underline underline-offset-2 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Cookie Policy
              </a>
            </p>

            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={handleReject}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-slate-100"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={handleAccept}
                className="rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-950 transition-colors hover:bg-cyan-400"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
