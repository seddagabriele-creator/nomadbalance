import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";

export default function ContactPage() {
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
        <p className="text-white/40 text-sm mb-10">We'd love to hear from you. Here's how to reach us.</p>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Mail className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">General Inquiries</h2>
                <p className="text-white/40 text-xs">For any question about NomadBalance</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              Email us at <a href="mailto:gabriele@gabrielesedda.com" className="text-violet-400 hover:text-violet-300 underline">gabriele@gabrielesedda.com</a>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Feedback & Suggestions</h2>
                <p className="text-white/40 text-xs">Help us make NomadBalance better</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              We actively listen to user feedback. Share your ideas, feature requests, or suggestions at <a href="mailto:gabriele@gabrielesedda.com" className="text-emerald-400 hover:text-emerald-300 underline">gabriele@gabrielesedda.com</a>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Bug className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Bug Reports</h2>
                <p className="text-white/40 text-xs">Found something broken?</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              If you've found a bug or technical issue, please describe it in detail (what you expected, what happened, your browser/device) and send it to <a href="mailto:gabriele@gabrielesedda.com" className="text-amber-400 hover:text-amber-300 underline">gabriele@gabrielesedda.com</a>
            </p>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Press & Partnerships</h2>
                <p className="text-white/40 text-xs">Media inquiries and collaborations</p>
              </div>
            </div>
            <p className="text-white/70 text-sm">
              For press inquiries, partnership proposals, or collaboration opportunities, reach out to <a href="mailto:gabriele@gabrielesedda.com" className="text-cyan-400 hover:text-cyan-300 underline">gabriele@gabrielesedda.com</a>
            </p>
          </div>
        </div>

        <div className="mt-10 bg-white/5 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-bold text-white mb-2">Data Controller</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Gabriele Sedda<br />
            Sardinia, Italy<br />
            For privacy-related requests, see our <Link to="/privacy" className="text-violet-400 hover:text-violet-300 underline">Privacy Policy</Link>.
          </p>
        </div>
      </article>
    </div>
  );
}
