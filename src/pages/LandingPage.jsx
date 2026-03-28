import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Timer, Droplets, Activity, Target, Wind, Moon, Sun,
  ChevronRight, CheckCircle, Sparkles, Smartphone, Shield,
  ArrowRight, Zap, BarChart3, Users, Coffee
} from "lucide-react";

const FEATURES = [
  {
    icon: Timer,
    color: "violet",
    title: "Flow — Focus Timer",
    desc: "Work in structured focus blocks with ambient binaural audio. Choose from 40 Hz deep-focus or 10 Hz relaxation soundscapes. Customizable work/break cycles (45/5, 50/10, or your own rhythm) keep your mind sharp all day.",
  },
  {
    icon: Droplets,
    color: "emerald",
    title: "Fuel — Intermittent Fasting",
    desc: "Set your eating window and let the app handle the rest. Supports 12/12, 14/10, 16/8, 18/6, or custom protocols. Automatic meal timing based on your work schedule — no more clock-watching or food anxiety.",
  },
  {
    icon: Activity,
    color: "orange",
    title: "Body — Active Breaks",
    desc: "Hours at a desk take a real toll. NomadBalance schedules short exercise breaks throughout your day — 27 movements across 5 muscle groups designed for desk workers. Posture correction, tension relief, and glute activation included.",
  },
  {
    icon: Target,
    color: "cyan",
    title: "Journal — Task Planning",
    desc: "Add your daily priorities each morning and check them off as you go. Drag to reorder, set time-based alarms, add notes. Uncompleted tasks carry over automatically. Full history with calendar view and search.",
  },
];

const SECONDARY_FEATURES = [
  { icon: Wind, label: "Breathing Sessions", desc: "4-7-8 and Box Breathing techniques with guided visual pacer for decompression." },
  { icon: Moon, label: "Day Close Ritual", desc: "End your workday intentionally with a breathing session before signing off." },
  { icon: Coffee, label: "Desk Status Tracking", desc: "Toggle away/at-desk to auto-pause break reminders and shift schedules." },
  { icon: Users, label: "Meeting Mode", desc: "One tap to pause all notifications during calls and meetings." },
  { icon: BarChart3, label: "Reports & Badges", desc: "Weekly summaries, streak tracking, focus time stats, and achievement badges." },
  { icon: Smartphone, label: "PWA — Install on Phone", desc: "Works offline. Add to home screen on any device for a native-app experience." },
];

const EXERCISE_GROUPS = [
  "Neck & Cervical — reposition your head without cervical stress",
  "Shoulders & Thoracic — real extension, no lumbar cheats",
  "Wrists & Forearms — epicondyle and epitrochlea relief",
  "Lower Back & Core — mobilize without loading discs",
  "Hips & Legs — open shortened flexors, wake up dormant glutes",
];

const FAQ = [
  {
    q: "Is NomadBalance free?",
    a: "Yes. NomadBalance is free to use. We support the project through non-intrusive ads.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. NomadBalance is a Progressive Web App (PWA). Use it in your browser or add it to your home screen for a native-like experience. It works offline too.",
  },
  {
    q: "Who is this app for?",
    a: "Anyone who spends long hours at a desk — remote workers, digital nomads, office employees, freelancers, students. If you sit for work, this app helps you move, eat, and focus better.",
  },
  {
    q: "How do the exercise breaks work?",
    a: "When you start your day, the app schedules exercise breaks aligned with your focus timer. When it's time, you get a notification with a specific exercise, complete with image, dosage, execution instructions, and anti-cheating tips. You can snooze, swap, or skip — but your body will thank you for doing them.",
  },
  {
    q: "Can I customize everything?",
    a: "Yes. Focus duration, break length, fasting protocol, eating window, number of exercise breaks, muscle groups to target — everything adapts to your schedule and preferences. Save defaults for quick daily starts.",
  },
  {
    q: "Is my data private?",
    a: "Your data is stored securely in your personal account. We use Supabase with row-level security — only you can access your sessions, tasks, and settings.",
  },
];

function FeatureCard({ icon: Icon, color, title, desc, index }) {
  const colorMap = {
    violet: "from-violet-500/20 to-violet-500/5 border-violet-500/20",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    orange: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
  };
  const iconColor = {
    violet: "bg-violet-500/20 text-violet-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
    orange: "bg-orange-500/20 text-orange-400",
    cyan: "bg-cyan-500/20 text-cyan-400",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-2xl p-6 md:p-8`}
    >
      <div className={`w-12 h-12 rounded-xl ${iconColor[color]} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* ====== HERO ====== */}
      <header className="relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] bg-violet-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[500px] max-h-[500px] bg-cyan-600/8 rounded-full blur-3xl" />
        </div>

        <nav className="relative z-10 max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">NomadBalance</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/blog" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2">
              Blog
            </Link>
            <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-2">
              Log in
            </Link>
            <Link to="/login" className="text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg px-4 py-2 transition-colors">
              Sign up free
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-16 pb-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-6">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              Free &middot; No install &middot; Works offline
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] tracking-tight mb-6">
              Focus. Fuel. Move.{" "}
              <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Plan.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-10">
              Your daily companion for a better workday. A focus timer with binaural audio, intermittent fasting tracker, guided exercise breaks, and goal planner — all in one app built for people who sit at a desk.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/login" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all">
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 font-medium text-base transition-all">
                See how it works
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ====== FEATURES ====== */}
      <section id="features" className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Four pillars for a balanced workday</h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            NomadBalance organizes your entire day around four areas that matter most when you work long hours at a screen.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} index={i} />
          ))}
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">How a typical day looks</h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            NomadBalance works best when you follow the rhythm. Here's what a day looks like.
          </p>
        </motion.div>

        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            { icon: Sun, time: "Morning", text: "Hit Start Day. The wizard sets up your eating window, focus rhythm, exercise plan, and tasks — or use saved defaults for a one-tap start." },
            { icon: Timer, time: "Work blocks", text: "Focus timer counts down your work phase with ambient audio. When it ends, you get a short break. Exercises are scheduled to align with your break windows." },
            { icon: Activity, time: "Break time", text: "A notification shows you exactly which exercise to do — with image, reps, and form tips. Snooze, swap for a different one, or complete it in 2-3 minutes." },
            { icon: Droplets, time: "Meal time", text: "The app knows your eating window and work schedule. Tap to log meals. It tracks how many you've had and how long until the window closes." },
            { icon: Moon, time: "End of day", text: "Close the day with a guided breathing session (4-7-8 or Box Breathing). Review your stats, check completed tasks, and sign off feeling good." },
          ].map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ delay: i * 0.08 }} className="flex gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                <step.icon className="w-5 h-5 text-white/40" />
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-widest font-semibold mb-1">{step.time}</p>
                <p className="text-white/70 text-sm leading-relaxed">{step.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== EXERCISE GROUPS ====== */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">27 exercises, 5 muscle groups</h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Every movement is designed for people who sit at a desk. Each exercise includes dosage, execution instructions, anti-cheating cues, and modifications.
          </p>
        </motion.div>
        <div className="max-w-2xl mx-auto space-y-3">
          {EXERCISE_GROUPS.map((group, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/[0.06] border border-orange-500/[0.12]">
              <CheckCircle className="w-5 h-5 text-orange-400 shrink-0" />
              <p className="text-white/70 text-sm">{group}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== MORE FEATURES ====== */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">And there's more</h2>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECONDARY_FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="p-5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <f.icon className="w-5 h-5 text-white/30 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-1">{f.label}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== FAQ ====== */}
      <section className="max-w-2xl mx-auto px-4 py-20">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Frequently asked questions</h2>
        </motion.div>
        <div className="space-y-2">
          {FAQ.map((item, i) => (
            <div key={i} className="rounded-xl border border-white/[0.06] overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors">
                <span className="text-sm font-medium text-white/80 pr-4">{item.q}</span>
                <ChevronRight className={`w-4 h-4 text-white/30 shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`} />
              </button>
              {openFaq === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="px-4 pb-4">
                  <p className="text-white/50 text-sm leading-relaxed">{item.a}</p>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="max-w-3xl mx-auto px-4 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-white/10 rounded-3xl p-10 md:p-14">
          <h2 className="text-3xl font-extrabold mb-3">Ready to take care of your workday?</h2>
          <p className="text-white/50 mb-8 max-w-lg mx-auto">
            NomadBalance is free. No credit card, no install. Create an account and start your first day in under a minute.
          </p>
          <Link to="/login" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-bold text-base shadow-lg shadow-violet-500/20 transition-all">
            Create free account
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-white/60">NomadBalance</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-white/40">
              <Link to="/blog" className="hover:text-white/70 transition-colors">Blog</Link>
              <span className="text-white/20">|</span>
              <Link to="/about" className="hover:text-white/70 transition-colors">About</Link>
              <span className="text-white/20">|</span>
              <Link to="/contact" className="hover:text-white/70 transition-colors">Contact</Link>
              <span className="text-white/20">|</span>
              <Link to="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
              <span className="text-white/20">|</span>
              <Link to="/cookies" className="hover:text-white/70 transition-colors">Cookie Policy</Link>
              <span className="text-white/20">|</span>
              <Link to="/terms" className="hover:text-white/70 transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span className="text-xs text-white/25">&copy; {new Date().getFullYear()} NomadBalance</span>
            <span className="text-xs text-white/25">Focus, Fuel, Move, Plan</span>
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.04]">
            <p className="text-xs text-white/20 leading-relaxed max-w-2xl">
              NomadBalance is a wellness and productivity tool designed to help desk workers maintain healthy habits throughout the workday. 
              It is not a medical device and does not provide medical advice. The exercise recommendations are general stretches and movements 
              suitable for most healthy adults. Consult a healthcare professional before starting any exercise program if you have existing conditions.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
