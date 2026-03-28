import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Heart, Code, Globe, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
        <h1 className="text-3xl font-extrabold mb-6">About NomadBalance</h1>

        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Why NomadBalance Exists</h2>
            </div>
            <p className="mb-3">
              NomadBalance was born from a personal frustration. As a remote worker and digital nomad, I found myself sitting for 10+ hours a day, forgetting to eat at regular times, skipping breaks, and losing track of what I was supposed to accomplish. My body ached, my focus scattered, and the boundary between work and life dissolved entirely.
            </p>
            <p className="mb-3">
              I tried dozens of productivity apps — Pomodoro timers, habit trackers, task managers, fasting apps. Each solved one piece of the puzzle, but none addressed the fundamental challenge: <strong className="text-white">a remote workday is a system</strong>. Focus, nutrition, movement, and planning are interconnected. Optimizing one while ignoring the others doesn't work.
            </p>
            <p>
              So I built NomadBalance — a single companion that helps you manage all four pillars of a healthy, productive workday: <strong className="text-white">Focus, Fuel, Body, and Journal</strong>.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Code className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Who's Behind It</h2>
            </div>
            <p className="mb-3">
              I'm Gabriele Sedda, a software developer based in Sardinia, Italy. I've been working remotely for several years, bouncing between coworking spaces, cafes, and home offices across Europe. Through that experience, I've learned firsthand what helps remote workers thrive — and what traps them.
            </p>
            <p>
              NomadBalance is an independent project, built with care and constantly improved based on real usage patterns and user feedback. It's not backed by venture capital or designed to maximize engagement. It's designed to help you have a better workday and then close the laptop.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Our Principles</h2>
            </div>
            <ul className="space-y-4">
              <li>
                <strong className="text-white">Simplicity first.</strong>
                <span className="text-white/50"> Every feature earns its place. If it adds complexity without clear value, it doesn't ship.</span>
              </li>
              <li>
                <strong className="text-white">Privacy by design.</strong>
                <span className="text-white/50"> Your health and productivity data stays yours. We don't sell data, don't build profiles, and don't share your information with third parties beyond what's strictly necessary to run the service.</span>
              </li>
              <li>
                <strong className="text-white">Science over trends.</strong>
                <span className="text-white/50"> Features are based on peer-reviewed research in neuroscience, exercise science, and nutrition — not productivity influencer hype.</span>
              </li>
              <li>
                <strong className="text-white">No dark patterns.</strong>
                <span className="text-white/50"> No streaks designed to make you feel guilty, no gamification that creates anxiety, no notifications designed to pull you back in. The goal is a better workday, not app addiction.</span>
              </li>
            </ul>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Built for Remote Workers, by a Remote Worker</h2>
            </div>
            <p className="mb-3">
              NomadBalance is specifically designed for people who work from home, from coworking spaces, from cafes, or while traveling. It understands that your schedule might change daily, that you might work from different time zones, and that your biggest enemy isn't lack of motivation — it's lack of structure.
            </p>
            <p>
              Whether you're a freelance developer, a remote employee, a digital nomad, or a startup founder working from your kitchen table, NomadBalance gives you the daily structure that an office would normally provide — without the office.
            </p>
          </section>

          <section className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Get in Touch</h2>
            <p className="mb-3">
              Have questions, feedback, or just want to say hello? I'd love to hear from you.
            </p>
            <div className="flex gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-medium text-sm transition-colors">
                Contact us
              </Link>
              <Link to="/blog" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-white font-medium text-sm transition-colors">
                Read the blog
              </Link>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
