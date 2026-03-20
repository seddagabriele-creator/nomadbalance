import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const { login, signup, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setResetSuccess(true);
      } else if (isSignup) {
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
        {/* Back to home */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>

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
          ) : resetSuccess ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Check your email</h2>
              <p className="text-white/60 text-sm">
                We sent a password reset link to <span className="text-white/80">{email}</span>. Follow the instructions to set a new password.
              </p>
              <button
                onClick={() => { setIsForgotPassword(false); setResetSuccess(false); setError(null); }}
                className="mt-6 text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
              >
                Back to login
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-white font-semibold text-lg mb-5 text-center">
                {isForgotPassword ? "Reset password" : isSignup ? "Create account" : "Welcome back"}
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

                {!isForgotPassword && (
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
                )}

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
                  {loading ? "..." : isForgotPassword ? "Send reset link" : isSignup ? "Sign up" : "Log in"}
                </button>
              </form>

              <div className="mt-5 text-center space-y-2">
                {!isSignup && !isForgotPassword && (
                  <button
                    onClick={() => { setIsForgotPassword(true); setError(null); }}
                    className="block w-full text-white/40 text-xs hover:text-white/60 transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isForgotPassword) {
                      setIsForgotPassword(false);
                    } else {
                      setIsSignup(!isSignup);
                    }
                    setError(null);
                  }}
                  className="text-white/40 text-xs hover:text-white/60 transition-colors"
                >
                  {isForgotPassword
                    ? "Back to login"
                    : isSignup
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
