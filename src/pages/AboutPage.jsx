import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Heart, Code, Globe, Target, Layers, BookOpen, Cpu } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO title="About NomadBalance" description="NomadBalance helps remote workers stay focused, healthy, and productive. Built by Gabriele Sedda for digital nomads and remote professionals worldwide." />
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
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                <Layers className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white">The Problem With Fragmented Tools</h2>
            </div>
            <p className="mb-3">
              Most remote workers cobble together five or more separate applications to manage a single workday: a Pomodoro timer for focus sessions, an intermittent fasting tracker for meal windows, a stretching or exercise reminder, a to-do list for task planning, and perhaps a breathing or meditation app for stress. Each app has its own notification system, its own onboarding flow, its own design language, and its own data silo. The result is constant context switching — and research in cognitive psychology consistently shows that switching between tasks and interfaces carries a measurable cost.
            </p>
            <p className="mb-3">
              Studies in the field of attention residue, pioneered by researcher Sophie Leroy at the University of Washington, demonstrate that when you shift your attention from one task to another, part of your cognition remains stuck on the previous activity. Every time you leave your code editor to check a fasting timer, then switch to a task manager, then open an exercise app, you accumulate residue that degrades your deep work capacity.
            </p>
            <p>
              Beyond the cognitive cost, there is a practical one: tool fatigue. Research on software adoption in workplace settings shows that the more tools employees are expected to use, the lower the adoption rate of each individual tool. People simply stop using half of them within weeks. NomadBalance addresses this by consolidating the four core dimensions of a healthy workday — focus timing, nutrition tracking, physical movement, and daily planning — into a single, unified interface. One app, one dashboard, one set of notifications.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-bold text-white">The Science Behind NomadBalance</h2>
            </div>
            <p className="mb-3">
              Every feature in NomadBalance is grounded in established research rather than productivity trends. The <strong className="text-white">Focus timer</strong> is informed by research on ultradian rhythms — the 90-to-120-minute cycles of alertness and fatigue first described by sleep researcher Nathaniel Kleitman and later studied in waking performance contexts. Working in alignment with these natural rhythms, rather than against them, helps sustain concentration across a full workday without the burnout that comes from forcing continuous attention.
            </p>
            <p className="mb-3">
              The <strong className="text-white">Fuel module</strong> draws from the field of chrononutrition, which studies how the timing of meals interacts with circadian biology. Research published in journals like the International Journal of Obesity and Advances in Nutrition has shown that meal timing affects metabolic efficiency, energy levels, and cognitive performance independently of what you eat. Tracking eating windows helps remote workers avoid the erratic meal patterns that undermine afternoon focus.
            </p>
            <p>
              The <strong className="text-white">Body exercises</strong> are selected from active recovery science and occupational physiotherapy. Prolonged sitting is associated with musculoskeletal issues including thoracic kyphosis, hip flexor shortening, and cervical strain — all well-documented in ergonomics research. The specific movements in NomadBalance target these desk-related patterns. Finally, the <strong className="text-white">Journal</strong> leverages the concept of implementation intentions from behavioral psychology, a planning technique extensively validated by researcher Peter Gollwitzer, which shows that writing down specific "when-where-how" plans dramatically increases follow-through on goals.
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
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Cpu className="w-5 h-5 text-teal-400" />
              </div>
              <h2 className="text-xl font-bold text-white">How NomadBalance Is Built</h2>
            </div>
            <p className="mb-3">
              NomadBalance is a <strong className="text-white">Progressive Web App (PWA)</strong>, which means it works offline, can be installed on any device — phone, tablet, or desktop — directly from the browser, and receives updates automatically without app store delays. The frontend is built with <strong className="text-white">React</strong>, and the backend uses <strong className="text-white">Supabase</strong> for authentication and data storage.
            </p>
            <p className="mb-3">
              Privacy is embedded in the architecture, not bolted on as an afterthought. All user data is protected by <strong className="text-white">row-level security</strong> at the database level, meaning your data is isolated from every other user's data by default. There are no tracking pixels on NomadBalance, no third-party analytics scripts, and no behavioral profiling. We do not sell or share your data.
            </p>
            <p>
              The app is ad-supported in order to remain free for all users. This is a deliberate choice: remote workers and digital nomads should have access to well-designed health and productivity tools without yet another subscription. Ads are served through Google AdSense and are clearly separated from the app's content and functionality.
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
              <li>
                <strong className="text-white">Evidence-based.</strong>
                <span className="text-white/50"> Every exercise in the Body module has been selected from physiotherapy literature targeting desk-related musculoskeletal issues. Fasting protocols follow established intermittent fasting research. Focus intervals are aligned with neuroscience on ultradian rhythms and sustained attention. We do not include features based on anecdote or trend — if the evidence does not support it, it does not ship.</span>
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

          <section>
            <p>
              Have questions? Visit our <Link to="/contact" className="text-violet-400 hover:text-violet-300 underline">contact page</Link> or read our <Link to="/blog" className="text-violet-400 hover:text-violet-300 underline">blog</Link> for more on remote work productivity.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
