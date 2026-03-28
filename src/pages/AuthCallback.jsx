import { useEffect, useState } from "react";
import SEO from "@/components/SEO";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      if (errorParam) {
        setError(errorDescription || errorParam);
        return;
      }

      if (code) {
        // Exchange PKCE code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
      }

      // Small delay to let onAuthStateChange propagate
      setTimeout(() => navigate("/", { replace: true }), 300);
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
        <SEO noindex />
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-white font-semibold text-lg mb-2">Confirmation failed</h2>
          <p className="text-white/60 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate("/login", { replace: true })}
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <SEO noindex />
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60 text-sm">Confirming your account...</p>
      </div>
    </div>
  );
}
