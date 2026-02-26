import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const { login, signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signup(email, password);
        setSignupSuccess(true);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            NomadBalance
          </h1>
          <p className="text-white/50 text-sm mt-2">
            Your daily wellness companion
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {signupSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
              <p className="text-white/60 text-sm">
                We sent a confirmation link to <span className="text-white/80">{email}</span>. Click it to activate your account.
              </p>
              <button
                onClick={() => { setIsSignup(false); setSignupSuccess(false); }}
                className="mt-6 text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-semibold text-lg mb-5 text-center">
                {isSignup ? "Create account" : "Welcome back"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="Min 6 characters"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs text-center bg-red-500/10 rounded-lg py-2 px-3">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-slate-950 font-semibold py-2.5 rounded-lg text-sm transition-colors"
                >
                  {loading ? "..." : isSignup ? "Sign up" : "Log in"}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-transparent px-3 text-white/30">or</span>
                </div>
              </div>

              {/* Google Sign-In */}
              <button
                type="button"
                onClick={async () => {
                  setError(null);
                  try {
                    await loginWithGoogle();
                  } catch (err) {
                    setError(err.message || "Google sign-in failed");
                  }
                }}
                className="w-full flex items-center justify-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </button>

              <div className="mt-5 text-center">
                <button
                  onClick={() => { setIsSignup(!isSignup); setError(null); }}
                  className="text-white/40 text-xs hover:text-white/60 transition-colors"
                >
                  {isSignup
                    ? "Already have an account? Log in"
                    : "Don't have an account? Sign up"}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
