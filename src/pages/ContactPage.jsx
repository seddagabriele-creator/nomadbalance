import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Mail, MessageSquare, Bug, Lightbulb, Clock, HelpCircle } from "lucide-react";

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

        <div className="mt-10 space-y-6">
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
                  Yes. Our exercise library is curated from physiotherapy research targeting desk-related musculoskeletal issues, but we're always looking to expand it. Describe the movement and the problem it addresses, and we'll evaluate it for inclusion. If it meets our evidence-based criteria, it gets added to the Body module.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">"I found a bug on mobile"</p>
                <p className="text-white/70 leading-relaxed">
                  Please include your device model, browser name and version, and the steps to reproduce the issue. Screenshots help enormously — even a quick screen recording can save hours of debugging. The more detail you provide, the faster we can fix it.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">"Can I write for the blog?"</p>
                <p className="text-white/70 leading-relaxed">
                  We welcome guest contributions from remote work professionals, physiotherapists, nutritionists, and productivity researchers. If you have expertise in any area related to remote work health, focus, or daily structure, pitch your topic via email. We're particularly interested in evidence-based content that helps remote workers improve their workdays.
                </p>
              </div>
            </div>
          </section>
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
