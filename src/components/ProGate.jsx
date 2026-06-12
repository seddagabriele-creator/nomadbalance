import React from "react";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/lib/SubscriptionContext";

// Wraps Pro-only content. For Pro users renders children untouched;
// for free users shows the content blurred underneath an upgrade card —
// the user sees exactly what they're missing.
export default function ProGate({ title, description, children }) {
  const { isPro, promptUpgrade } = useSubscription();

  if (isPro) return children;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[6px] opacity-50" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xs rounded-3xl bg-slate-900/90 backdrop-blur-xl border border-violet-500/25 p-5 text-center shadow-2xl">
          <div className="mx-auto w-10 h-10 rounded-2xl bg-violet-500/20 flex items-center justify-center">
            <Lock className="w-4 h-4 text-violet-300" />
          </div>
          <h3 className="mt-3 text-sm font-bold text-white">{title || "Pro feature"}</h3>
          {description && <p className="mt-1 text-xs text-white/40">{description}</p>}
          <Button
            onClick={promptUpgrade}
            className="mt-4 w-full h-10 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-sm font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Unlock with Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
