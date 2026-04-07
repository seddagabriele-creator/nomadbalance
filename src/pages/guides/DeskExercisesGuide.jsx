import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Activity, Clock, AlertCircle, CheckCircle, Heart, Dumbbell } from "lucide-react";

export default function DeskExercisesGuide() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO title="Desk Exercises for Remote Workers: Stay Active at Your Desk" description="Quick desk exercises and stretches designed for remote workers. Combat sitting disease and boost productivity with movements you can do at your workstation." />
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
          <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">Guide</span>
          <span className="text-white/30 text-xs">9 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Desk Exercises for Remote Workers: Combat Sitting All Day</h1>
        <p className="text-white/40 text-sm mb-10">A science-based guide to preventing pain, improving posture, and staying healthy when your office is your couch.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-400" />
              The Real Cost of Sitting
            </h2>
            <p className="mb-3">
              The human body was designed for movement. Our ancestors walked an estimated 10-15 kilometers daily, yet the average office worker today sits for 10-12 hours a day. For remote workers, the number can be even higher — there's no commute, no walk to the meeting room, no trip to a colleague's desk.
            </p>
            <p className="mb-3">
              Research published in <em>The Lancet</em> found that prolonged sitting increases the risk of cardiovascular disease, type 2 diabetes, and certain cancers, independent of exercise habits. In other words, even if you run every morning, sitting for 8+ hours undoes much of the benefit.
            </p>
            <p>
              For remote workers specifically, the musculoskeletal impact is immediate. Without ergonomic office furniture, many work from laptops on couches, beds, or kitchen tables. This leads to a predictable pattern of problems: neck pain, shoulder tension, wrist strain, lower back pain, and tight hip flexors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              The 5 Critical Muscle Groups
            </h2>
            <p className="mb-4">
              Desk-related pain follows specific patterns based on posture. Here are the five muscle groups that need the most attention, and why:
            </p>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">1. Neck & Cervical Spine</h3>
                <p className="text-white/50 text-xs mb-2"><strong className="text-white/70">The problem:</strong> "Tech neck" — the head drifts forward toward the screen, adding up to 27 kg of extra force on the cervical spine for every inch of forward head posture.</p>
                <p className="text-white/50 text-xs"><strong className="text-white/70">The fix:</strong> Chin tucks, cervical rotations, and upper trapezius stretches reposition the head over the shoulders without stressing the spine. Do these every 60-90 minutes.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">2. Shoulders & Thoracic Spine</h3>
                <p className="text-white/50 text-xs mb-2"><strong className="text-white/70">The problem:</strong> Rounded shoulders from typing create thoracic kyphosis — an excessive forward curve in the upper back. This compresses the chest and restricts breathing.</p>
                <p className="text-white/50 text-xs"><strong className="text-white/70">The fix:</strong> Thoracic extensions, wall angels, and doorframe stretches open the chest and activate the muscles between the shoulder blades. Focus on extension without lumbar compensation.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">3. Wrists & Forearms</h3>
                <p className="text-white/50 text-xs mb-2"><strong className="text-white/70">The problem:</strong> Continuous typing and mouse use create repetitive strain on the tendons attaching to the lateral and medial epicondyles (outer and inner elbow). This can develop into carpal tunnel syndrome or tennis/golfer's elbow.</p>
                <p className="text-white/50 text-xs"><strong className="text-white/70">The fix:</strong> Wrist flexor and extensor stretches, finger spreads, and prayer position stretches. These should be done frequently — every 45-60 minutes if you type heavily.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">4. Lower Back & Core</h3>
                <p className="text-white/50 text-xs mb-2"><strong className="text-white/70">The problem:</strong> Sitting deactivates the glutes and weakens the core, forcing the lower back muscles to compensate. Over time, this leads to disc compression and chronic pain.</p>
                <p className="text-white/50 text-xs"><strong className="text-white/70">The fix:</strong> Cat-cow stretches, seated spinal twists, and standing hip hinges mobilize the lumbar spine without loading the discs. Dead bugs and bird dogs rebuild core stability.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="text-white font-semibold mb-2">5. Hips & Legs</h3>
                <p className="text-white/50 text-xs mb-2"><strong className="text-white/70">The problem:</strong> Sitting shortens the hip flexors and tightens the hamstrings. This tilts the pelvis forward, increasing lower back strain and reducing mobility.</p>
                <p className="text-white/50 text-xs"><strong className="text-white/70">The fix:</strong> Standing hip flexor stretches, figure-four stretches, and bodyweight squats. These open the shortened flexors and activate dormant glutes.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              How Often Should You Move?
            </h2>
            <p className="mb-3">
              Research from Columbia University found that taking a 5-minute movement break every 30-60 minutes significantly reduces the negative effects of prolonged sitting. But for most professionals, interrupting work every 30 minutes isn't realistic.
            </p>
            <p className="mb-4">
              A practical compromise that works well with focus sessions:
            </p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Every focus session (45-50 min):</strong> 2-3 minutes of targeted stretching during your break</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Every 2 hours:</strong> A longer 5-minute movement break with multiple exercises</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Midday:</strong> A 10-15 minute walk or full stretching routine</span>
              </li>
            </ul>
            <p className="mt-3">
              The key insight is that frequency matters more than duration. Six 2-minute breaks throughout the day are more effective than one 12-minute stretch session.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-400" />
              Sample Break Routine (3 Minutes)
            </h2>
            <p className="mb-4">This routine can be done standing next to your desk, no equipment needed:</p>
            <ol className="space-y-3 pl-4 list-decimal list-inside">
              <li><strong className="text-white">Chin tucks (30 sec)</strong> — Pull your chin straight back, creating a "double chin." Hold for 5 seconds, release. Repeat 6 times.</li>
              <li><strong className="text-white">Chest opener (30 sec)</strong> — Clasp hands behind your back, squeeze shoulder blades together, and lift arms slightly. Hold for 15 seconds, release. Repeat twice.</li>
              <li><strong className="text-white">Wrist circles (30 sec)</strong> — Extend arms forward, make fists, and circle wrists slowly in both directions. 10 circles each way.</li>
              <li><strong className="text-white">Standing cat-cow (30 sec)</strong> — Hands on knees, alternate between arching and rounding your back. Smooth, controlled movements.</li>
              <li><strong className="text-white">Hip flexor stretch (30 sec)</strong> — Step one foot forward into a lunge, gently push hips forward. 15 seconds each side.</li>
              <li><strong className="text-white">Bodyweight squats (30 sec)</strong> — 8-10 slow squats to activate glutes and increase blood flow to the legs.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-orange-400" />
              Building the Habit
            </h2>
            <p className="mb-3">
              The biggest challenge isn't knowing what to do — it's remembering to do it. When you're deep in a coding problem or writing session, hours can pass without moving. This is why automated reminders are essential.
            </p>
            <p className="mb-3">
              Stack your exercise breaks with your focus timer. When the Pomodoro ends, your break isn't just for scrolling — it's for moving. This creates a natural habit loop: focus → timer rings → stand up and stretch → sit back down refreshed.
            </p>
            <p>
              Start with 3-4 breaks per day and build up to 6. Track your completion rate. Even completing 4 out of 6 planned breaks is dramatically better than zero, which is what most remote workers do.
            </p>
          </section>

          <section className="bg-white/[0.03] rounded-2xl p-6 border border-white/[0.06]">
            <h2 className="text-lg font-bold text-white mb-3">Continue reading</h2>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog/back-pain-sitting-all-day" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Back Pain From Sitting All Day?</Link> — a recovery guide for remote workers</li>
              <li><Link to="/blog/posture-correction-guide" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Posture Correction for Laptop Users</Link> — identify and fix common problems</li>
              <li><Link to="/blog/sitting-disease-remote-work" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Sitting Disease: The Silent Health Crisis</Link> — why prolonged sitting is the new smoking</li>
              <li><Link to="/blog/ergonomic-home-office-setup" className="text-orange-400 hover:text-orange-300 underline underline-offset-2">Ergonomic Home Office Setup</Link> — protect your body on any budget</li>
            </ul>
          </section>
        </div>
      </article>
    </div>
  );
}
