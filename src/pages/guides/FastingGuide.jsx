import React from "react";
import useSEO from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Droplets, Clock, TrendingUp, Utensils, AlertCircle, CheckCircle } from "lucide-react";

export default function FastingGuide() {
  useSEO({ title: "Intermittent Fasting Guide for Professionals", description: "A practical guide to intermittent fasting for busy professionals. Learn how strategic meal timing can boost your energy and focus throughout the workday.", ogType: "article" });

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
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">Guide</span>
          <span className="text-white/30 text-xs">10 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Intermittent Fasting for Professionals: A Practical Guide</h1>
        <p className="text-white/40 text-sm mb-10">How to structure your eating window around your work schedule for better energy, focus, and health.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-emerald-400" />
              What is Intermittent Fasting?
            </h2>
            <p className="mb-3">
              Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. Unlike traditional diets that focus on <em>what</em> you eat, IF focuses on <em>when</em> you eat. It's not about restriction — it's about timing.
            </p>
            <p className="mb-3">
              The most popular approach for professionals is time-restricted eating (TRE), where you limit your daily food intake to a specific window — typically 6 to 10 hours — and fast for the remaining 14 to 18 hours. Since most of the fasting period overlaps with sleep, it's more practical than it sounds.
            </p>
            <p>
              Research from the Salk Institute and published in <em>Cell Metabolism</em> shows that time-restricted eating can improve metabolic health, reduce inflammation, and enhance cognitive function — all without changing what you eat or how many calories you consume.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Common Fasting Protocols
            </h2>
            <p className="mb-4">Here are the most widely practiced protocols, ranked from easiest to most challenging:</p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold">14/10 — Gentle Start</p>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full">Beginner</span>
                </div>
                <p className="text-white/50 text-xs">Fast 14 hours, eat within a 10-hour window. Example: eat 8:00 AM – 6:00 PM. Minimal adjustment needed for most people.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold">16/8 — The Standard</p>
                  <span className="text-[10px] text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">Popular</span>
                </div>
                <p className="text-white/50 text-xs">Fast 16 hours, eat within an 8-hour window. Example: eat 12:00 PM – 8:00 PM. Skip breakfast, have a normal lunch and dinner.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold">18/6 — Extended Fast</p>
                  <span className="text-[10px] text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Intermediate</span>
                </div>
                <p className="text-white/50 text-xs">Fast 18 hours, eat within a 6-hour window. Example: eat 1:00 PM – 7:00 PM. Two meals and one snack typically fit well.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-semibold">20/4 — Warrior Diet</p>
                  <span className="text-[10px] text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">Advanced</span>
                </div>
                <p className="text-white/50 text-xs">Fast 20 hours, eat within a 4-hour window. Requires experience with fasting and careful nutrition planning.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Why Fasting Helps Professionals
            </h2>
            <p className="mb-4">Beyond weight management, intermittent fasting offers specific benefits for knowledge workers:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Stable energy levels.</strong>
                  <span className="text-white/50"> Eating within a window prevents the blood sugar spikes and crashes that follow frequent meals, especially carb-heavy ones. Many professionals report sustained energy throughout the morning fast.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Enhanced focus during fasting.</strong>
                  <span className="text-white/50"> During fasting, your body increases production of norepinephrine, a neurotransmitter that enhances alertness and attention. This is why many people find their best focus in the morning before eating.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Reduced decision fatigue.</strong>
                  <span className="text-white/50"> When you eat fewer meals, you make fewer food-related decisions. No more "what should I have for breakfast?" — one less decision in your day.</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white">Better sleep quality.</strong>
                  <span className="text-white/50"> Finishing eating 3-4 hours before bed allows your body to focus on repair rather than digestion, often resulting in deeper sleep and more refreshed mornings.</span>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              Practical Tips for Your Work Day
            </h2>
            <ol className="space-y-3 pl-4 list-decimal list-inside">
              <li><strong className="text-white">Start with 16/8.</strong> Skip breakfast, have your first meal at noon, and finish eating by 8 PM. This is the easiest protocol to maintain long-term.</li>
              <li><strong className="text-white">Stay hydrated.</strong> Water, black coffee, and unsweetened tea don't break your fast and help curb hunger during the fasting window.</li>
              <li><strong className="text-white">Align your window with social meals.</strong> If you have team lunches or family dinners, plan your eating window around them. Consistency matters more than perfection.</li>
              <li><strong className="text-white">Plan your meals.</strong> Decide what you'll eat before your window opens. This prevents impulsive choices and ensures balanced nutrition.</li>
              <li><strong className="text-white">Don't compensate by overeating.</strong> Eat normally within your window. The goal is timing, not calorie restriction.</li>
              <li><strong className="text-white">Track your meals.</strong> Logging when you eat creates accountability and helps you identify patterns. Even a simple counter ("2/3 meals logged") keeps you aware.</li>
            </ol>
          </section>

          <section>
            <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-amber-300 font-semibold text-sm mb-1">Health Disclaimer</p>
                <p className="text-amber-200/60 text-xs">
                  Intermittent fasting is not suitable for everyone. If you are pregnant, breastfeeding, have a history of eating disorders, diabetes, or other metabolic conditions, consult your healthcare provider before starting any fasting protocol. NomadBalance is a lifestyle tool, not a medical device.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-3">Continue reading</h2>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog/blood-sugar-focus-connection" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Blood Sugar and Focus</Link> — how what you eat affects how you think</li>
              <li><Link to="/blog/meal-timing-remote-workers" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Meal Timing for Remote Workers</Link> — strategic eating for peak performance</li>
              <li><Link to="/blog/caffeine-strategy-productivity" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">The Caffeine Strategy</Link> — when and how much coffee actually helps</li>
              <li><Link to="/blog/hydration-cognitive-performance" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">Hydration and Cognitive Performance</Link> — the overlooked productivity tool</li>
            </ul>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
}
