import React, { useEffect, useRef } from "react";
import { useSubscription } from "@/lib/SubscriptionContext";

const AD_CLIENT = "ca-pub-5955082604612785";

export default function AdBanner() {
  const { isPro } = useSubscription();
  const pushed = useRef(false);

  useEffect(() => {
    if (isPro || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // ad blocker or script not loaded
    }
  }, [isPro]);

  if (isPro) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center bg-slate-950/80 backdrop-blur-sm border-t border-white/5">
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", maxWidth: 728, height: 60 }}
        data-ad-client={AD_CLIENT}
        data-ad-format="horizontal"
        data-full-width-responsive="false"
      />
    </div>
  );
}
