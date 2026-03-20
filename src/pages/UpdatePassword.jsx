import React, { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function UpdatePassword() {
  const { updatePassword, setIsRecovery } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setIsRecovery(false);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err.message || "Failed to update password");
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">NomadBalance</h1>
          <p className="text-white/50 text-sm mt-2">Set your new password</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          {success ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-white font-semibold text-lg mb-2">Password updated</h2>
              <p className="text-white/60 text-sm">Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 className="text-white font-semibold text-lg mb-5 text-center">New password</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Confirm password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    placeholder="Repeat password"
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
                  {loading ? "..." : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
