import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Send, MessageSquare, Bug, Lightbulb, Clock, HelpCircle, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "general", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setStatus("sending");
    try {
      const res = await fetch("https://formsubmit.co/ajax/gabriele@gabrielesedda.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: form.name || "Anonymous",
          email: form.email,
          subject: `[NomadBalance] ${form.subject === "bug" ? "Bug Report" : form.subject === "feedback" ? "Feedback" : form.subject === "press" ? "Press/Partnership" : "General Inquiry"}`,
          message: form.message,
          _template: "table",
        }),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "general", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO title="Contact Us" description="Get in touch with the NomadBalance team. We'd love to hear your feedback, suggestions, or questions about the app." />
      <nav className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">NomadBalance</span>
        </Link>
        <Link to="/" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <h1 className="text-3xl font-extrabold mb-3">Contact Us</h1>
        <p className="text-white/40 text-sm mb-10">We'd love to hear from you. Use the form below to get in touch.</p>

        {/* Contact Form */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-10">
          {status === "sent" ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Message sent!</h2>
              <p className="text-white/50 text-sm mb-4">We'll get back to you within 24-48 hours.</p>
              <button
                onClick={() => setStatus("idle")}
                className="text-sm text-cyan-400 hover:text-cyan-300 underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Name (optional)</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="How should we call you?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Subject</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
                >
                  <option value="general" className="bg-slate-900">General inquiry</option>
                  <option value="feedback" className="bg-slate-900">Feedback & suggestions</option>
                  <option value="bug" className="bg-slate-900">Bug report</option>
                  <option value="press" className="bg-slate-900">Press & partnerships</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us what's on your mind..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
                />
              </div>
              {status === "error" && (
                <p className="text-red-400 text-xs">Something went wrong. Please try again or email us directly.</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold text-sm transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>

        {/* Info sections */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
            <MessageSquare className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">Feedback</h3>
            <p className="text-white/40 text-xs">Feature requests, ideas, and suggestions are always welcome.</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
            <Bug className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">Bug Reports</h3>
            <p className="text-white/40 text-xs">Include device, browser, and steps to reproduce. Screenshots help!</p>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center">
            <Lightbulb className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-white mb-1">Press & Partners</h3>
            <p className="text-white/40 text-xs">Media inquiries and collaboration proposals.</p>
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-lg font-bold text-white">What Happens When You Write</h2>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Every message is read personally by the founder. We typically respond within 24-48 hours. Your feedback directly shapes the product roadmap — many of NomadBalance's features started as user suggestions. Whether it's a small usability improvement or an entirely new module, real user input drives what gets built next.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Common Questions</h2>
            </div>
            <div className="space-y-5 text-sm">
              <div>
                <p className="text-white font-medium mb-1">"Can I request a new exercise?"</p>
                <p className="text-white/70 leading-relaxed">
                  Yes. Our exercise library is curated from physiotherapy research targeting desk-related musculoskeletal issues, but we're always looking to expand it. Describe the movement and the problem it addresses, and we'll evaluate it for inclusion.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">"I found a bug on mobile"</p>
                <p className="text-white/70 leading-relaxed">
                  Please include your device model, browser name and version, and the steps to reproduce the issue. Screenshots help enormously — even a quick screen recording can save hours of debugging.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">"Can I write for the blog?"</p>
                <p className="text-white/70 leading-relaxed">
                  We welcome guest contributions from remote work professionals, physiotherapists, nutritionists, and productivity researchers. Pitch your topic through the form above.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-2">Data Controller</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            NomadBalance<br />
            Sardinia, Italy<br />
            For privacy-related requests, see our <Link to="/privacy" className="text-violet-400 hover:text-violet-300 underline">Privacy Policy</Link>.
          </p>
        </div>
      </article>
    </div>
  );
}
