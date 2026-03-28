import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Monitor, AlertTriangle, Search, Dumbbell, SlidersHorizontal, Eye, CheckCircle, RefreshCw } from "lucide-react";

export default function PostureCorrection() {
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
          <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">Movement</span>
          <span className="text-white/30 text-xs">10 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Posture Correction for Laptop Users: A Step-by-Step Guide</h1>
        <p className="text-white/40 text-sm mb-10">Your body adapts to the positions you hold most often. Here is how to make sure it adapts in the right direction.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              The Laptop Posture Problem
            </h2>
            <p className="mb-3">
              Laptops were designed for portability, not ergonomics. The fundamental issue is that the screen and keyboard are connected, which forces a compromise: either the screen is too low (causing you to look down) or the keyboard is too high (causing shoulder strain). For remote workers who spend six to ten hours a day on a laptop, this compromise gradually reshapes the musculoskeletal system in ways that cause chronic pain and reduce work capacity.
            </p>
            <p className="mb-3">
              Research published in the journal <em>Applied Ergonomics</em> found that laptop users exhibit significantly greater forward head posture and trunk flexion compared to desktop users. A 2022 study in <em>BMC Musculoskeletal Disorders</em> reported that over 65% of remote workers developed new musculoskeletal complaints within the first year of working from home, with neck and shoulder pain being the most common.
            </p>
            <p>
              The good news is that posture is not permanent. Your body is constantly remodeling itself in response to the forces you place on it. With the right awareness, exercises, and workspace adjustments, you can reverse postural dysfunction and eliminate the pain that comes with it. This guide walks you through the most common problems and gives you a concrete plan to fix each one.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-400" />
              Self-Assessment: Identifying Your Posture Issues
            </h2>
            <p className="mb-4">
              Before you can fix your posture, you need to understand what is actually wrong. Stand with your back against a flat wall, with your heels about two inches from the baseboard. Let your body settle into its natural position. Now check these three areas:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Forward Head Posture (Text Neck)</p>
                <p className="text-white/50 text-xs">With your back against the wall, does the back of your head naturally touch the wall? If there is a gap of more than one inch, you likely have forward head posture. This condition means the muscles at the front of your neck have shortened while the deep neck flexors have weakened. For every inch your head sits forward of your shoulders, the effective load on your cervical spine increases by approximately ten pounds.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Rounded Shoulders (Upper Crossed Syndrome)</p>
                <p className="text-white/50 text-xs">Stand relaxed and look at where your palms face. If your palms face behind you rather than toward your thighs, your shoulders are internally rotated. This pattern develops because the pectoralis muscles and upper trapezius become tight and overactive, while the lower trapezius, rhomboids, and serratus anterior become weak and inhibited. This is the single most common postural issue among laptop workers.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Lumbar Flexion (Flat Back or Posterior Pelvic Tilt)</p>
                <p className="text-white/50 text-xs">Place your hand behind the small of your back while standing against the wall. You should be able to slide your flat hand between your lower back and the wall. If there is no space, you may have lost your natural lumbar curve, often from prolonged sitting in chairs without lumbar support. This causes the hip flexors to weaken and the hamstrings to tighten, pulling the pelvis under.</p>
              </div>
            </div>
            <p>
              Take a photo of yourself from the side while standing naturally. This gives you a baseline to compare against as you make corrections. Many people are surprised by how far their posture has shifted from neutral without them ever noticing. Awareness is the first and most important step.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-400" />
              Corrective Exercises for Each Issue
            </h2>
            <p className="mb-4">
              Posture correction follows a simple principle: stretch what is tight, strengthen what is weak. Here are targeted exercises for each of the three main problem areas. Perform these daily, ideally during your work breaks.
            </p>
            <p className="mb-3">
              <strong className="text-white">For forward head posture,</strong> the priority is to strengthen the deep cervical flexors and stretch the suboccipital muscles. The chin tuck is your primary exercise. Sit upright, look straight ahead, and draw your chin straight back as if making a double chin. Hold for five seconds, then release. Perform ten repetitions three times per day. This movement retrains the deep neck flexors that have been inhibited by hours of looking down at a screen. To stretch the tight muscles at the base of your skull, place two fingers at the ridge where your skull meets your neck, tilt your head back slightly, and hold for thirty seconds. You should feel a gentle stretch, not pain.
            </p>
            <p className="mb-3">
              <strong className="text-white">For rounded shoulders,</strong> you need to open the chest and activate the mid-back. The doorway stretch is highly effective: place your forearms on either side of a doorframe with your elbows at shoulder height, then step forward until you feel a stretch across your chest. Hold for thirty seconds and repeat three times. For strengthening, perform band pull-aparts or wall slides. For wall slides, stand with your back against a wall, raise your arms to a goal-post position with elbows and wrists touching the wall, then slowly slide your arms up overhead and back down. Aim for ten repetitions. If your arms cannot maintain contact with the wall throughout the movement, this reveals exactly how tight your chest and anterior deltoids have become.
            </p>
            <p className="mb-3">
              <strong className="text-white">For lumbar flexion,</strong> focus on hip flexor activation and hamstring flexibility. The standing hip flexor stretch targets the psoas: kneel on one knee with the other foot forward, tuck your pelvis under slightly, and shift your weight forward until you feel a stretch at the front of your back hip. Hold for thirty seconds per side. To reactivate the lumbar extensors, perform the bird-dog exercise: from hands and knees, extend your right arm and left leg simultaneously, hold for five seconds, then switch sides. Complete ten repetitions per side.
            </p>
            <p>
              Consistency matters far more than intensity. Five minutes of corrective exercises three times daily will produce better results than a single thirty-minute session once a week. The goal is to repeatedly remind your nervous system of the positions you want it to default to.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-400" />
              Workspace Adjustments That Make a Difference
            </h2>
            <p className="mb-3">
              Exercise alone will not fix your posture if you return to a poorly configured workspace for eight hours a day. The environment must support the positions you are trying to maintain. You do not need expensive equipment to make meaningful improvements.
            </p>
            <p className="mb-3">
              The single highest-impact change is elevating your laptop screen to eye level and using an external keyboard. A stack of books, a shoebox, or a fifteen-dollar laptop stand all work. When the top of your screen is at or slightly below eye level, your head stays balanced over your spine instead of jutting forward. Pair this with any external keyboard and mouse, and you eliminate the fundamental design flaw of laptop ergonomics.
            </p>
            <p className="mb-3">
              Your chair matters, but not in the way most people think. An expensive ergonomic chair used incorrectly is worse than a simple chair used well. The key principles are: your feet should be flat on the floor with your knees at approximately ninety degrees, your hips should be slightly higher than your knees, and there should be support behind your lower back to maintain your lumbar curve. A rolled-up towel placed behind your lower back provides lumbar support that rivals chairs costing hundreds of dollars.
            </p>
            <p className="mb-3">
              Monitor distance also affects posture. Your screen should be approximately an arm's length away. If you find yourself leaning forward to read text, increase the font size or zoom level in your applications rather than moving closer. Leaning forward even slightly for extended periods loads the posterior chain muscles eccentrically, leading to fatigue and eventually pain.
            </p>
            <p>
              For digital nomads who work from different locations each day, develop a portable ergonomics kit: a lightweight laptop stand, a compact wireless keyboard, and a travel mouse. These three items weigh less than a kilogram combined and transform any cafe table or coworking desk into a reasonably ergonomic workstation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-400" />
              Building Posture Awareness Throughout the Day
            </h2>
            <p className="mb-3">
              The most sophisticated exercise program fails if you spend your conscious hours unaware of how you are sitting. Posture awareness is a skill that must be trained deliberately until it becomes automatic. Research from the University of Queensland found that postural awareness training reduced neck pain by 40% over twelve weeks, even without structured exercise.
            </p>
            <p className="mb-3">
              Start with posture cues: external reminders that prompt you to check and correct your position. Set a recurring timer for every thirty minutes during your workday. When it goes off, perform a quick body scan. Where is your head relative to your shoulders? Are your shoulders creeping up toward your ears? Is your lower back rounded or supported? This takes less than five seconds and interrupts the slow slide into dysfunction that happens unconsciously.
            </p>
            <p className="mb-3">
              Another effective technique is to link posture checks to existing habits. Every time you take a sip of water, check your posture. Every time you switch browser tabs, roll your shoulders back. Every time you send a message, press your shoulder blades together for two seconds. These micro-corrections accumulate over hundreds of repetitions per day and gradually retrain your default position.
            </p>
            <p>
              Consider the concept of "movement snacking" throughout your day. Instead of sitting for ninety minutes and then doing a formal stretch break, introduce small movements every fifteen to twenty minutes. Shift your weight, stand up for thirty seconds, rotate your wrists, look at a distant object to relax your eye muscles. These tiny interruptions prevent the sustained static loading that causes the most tissue adaptation in the wrong direction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-orange-400" />
              A Four-Week Posture Reset Plan
            </h2>
            <p className="mb-4">
              Postural change does not happen overnight, but it does not take as long as most people assume either. Follow this progressive plan to build sustainable improvements:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 1: Awareness.</strong> Set up your posture timer. Perform the self-assessment. Take your baseline photo. Focus only on noticing your posture without judging or forcing corrections. Begin chin tucks, ten repetitions three times daily.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 2: Workspace plus stretching.</strong> Implement your workspace adjustments: elevate the screen, add lumbar support, check chair height. Add the doorway stretch and hip flexor stretch, thirty seconds each, twice daily. Continue chin tucks.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 3: Strengthening.</strong> Add wall slides and bird-dogs, ten repetitions each, once daily. Introduce habit-linked posture checks. Begin movement snacking during work sessions.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 4: Integration.</strong> Combine all exercises into a five-minute routine performed morning and afternoon. Take a new side-profile photo and compare with your baseline. By this point, most people notice visible improvement in head position and shoulder alignment.</span>
              </li>
            </ul>
            <p>
              After the initial four weeks, maintain your gains by continuing the exercises at least once daily and keeping your posture cues active. Most people find that after six to eight weeks of consistent practice, good posture begins to feel natural rather than forced. The nervous system rewires, the shortened muscles regain their length, and the weakened muscles develop the endurance to hold you in alignment throughout the day.
            </p>
          </section>

          <section className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Move better with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance includes timed active break reminders with guided movement prompts, helping you build posture awareness and corrective exercises directly into your workday without disrupting your flow.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white font-medium text-sm transition-colors">
              Start your posture reset
            </Link>
          </section>
        </div>
      </article>
    </div>
  );
}
