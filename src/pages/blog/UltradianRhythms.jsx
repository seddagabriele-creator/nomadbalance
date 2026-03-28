import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Clock, Activity, TrendingUp, Moon, Battery, Lightbulb, CheckCircle } from "lucide-react";

export default function UltradianRhythms() {
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
          <span className="px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-400 text-xs font-medium">Focus</span>
          <span className="text-white/30 text-xs">10 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Ultradian Rhythms: Why Your Body Works in 90-Minute Cycles</h1>
        <p className="text-white/40 text-sm mb-10">Understanding the biological cycles that govern your energy, attention, and cognitive performance throughout the day — and how to work with them instead of against them.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              The Basic Rest-Activity Cycle (BRAC)
            </h2>
            <p className="mb-3">
              In the 1950s, pioneering sleep researcher Nathaniel Kleitman made a discovery that would reshape our understanding of human performance. While studying sleep stages, Kleitman observed that the brain cycles through distinct phases of activity roughly every 90 minutes during sleep — what we now know as the progression from light sleep through deep sleep and into REM (rapid eye movement) sleep. But Kleitman went further. He hypothesized that this 90-minute rhythm does not stop when we wake up. Instead, it continues throughout the day, governing our waking alertness, focus, and energy levels. He called this the Basic Rest-Activity Cycle, or BRAC.
            </p>
            <p className="mb-3">
              The BRAC proposes that during waking hours, your body alternates between approximately 90 minutes of heightened alertness and cognitive capacity followed by approximately 20 minutes of reduced alertness during which the body and brain seek rest. This is not a conscious choice or a matter of motivation. It is a physiological rhythm driven by fluctuations in hormones, neurotransmitters, and autonomic nervous system activity, similar to how your heart beats without conscious effort.
            </p>
            <p className="mb-3">
              Subsequent research has largely confirmed Kleitman's hypothesis. Studies using continuous EEG monitoring of awake subjects have found cyclical fluctuations in alertness with periods ranging from 80 to 120 minutes, with 90 minutes being the most common. Variations in performance on cognitive tasks — reaction time, sustained attention, working memory capacity — follow a similar oscillating pattern throughout the day.
            </p>
            <p>
              For remote workers, this has immediate practical implications. If your ability to focus naturally peaks and troughs in 90-minute waves, then structuring your workday around these waves — rather than against them — can dramatically improve both your output and your sense of wellbeing. Working through a trough is not just unpleasant; it is biologically inefficient, like trying to sprint while your body wants to walk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-violet-400" />
              The Neuroscience Behind the 90-Minute Cycle
            </h2>
            <p className="mb-3">
              Several physiological mechanisms drive the ultradian rhythm. The most significant involves fluctuations in the balance between the sympathetic and parasympathetic branches of the autonomic nervous system. During the active phase of the cycle, sympathetic tone is elevated — heart rate increases slightly, cortisol and norepinephrine levels rise, and the prefrontal cortex receives increased blood flow and glucose. This is when you are biologically primed for demanding cognitive work.
            </p>
            <p className="mb-3">
              As the active phase concludes, parasympathetic tone gradually increases. Heart rate slows, cortisol dips, and activity in the default mode network (the brain's resting-state network) increases. This is not fatigue in the traditional sense — it is a programmed shift toward restoration. Your brain uses this period to consolidate recently learned information, clear metabolic waste products, and replenish the neurotransmitters (particularly dopamine and norepinephrine) that fuel sustained attention.
            </p>
            <p className="mb-3">
              Another contributing mechanism involves the buildup and clearance of adenosine, a byproduct of cellular energy metabolism. During intense cognitive work, neurons consume large amounts of ATP (adenosine triphosphate), and the resulting adenosine accumulates in the extracellular space. Adenosine binds to receptors in the brain that promote drowsiness and reduce neural excitability. During the rest phase of the ultradian cycle, adenosine levels decrease, restoring alertness for the next active phase. This, incidentally, is the same mechanism that caffeine exploits — caffeine blocks adenosine receptors, temporarily masking the fatigue signal.
            </p>
            <p>
              The key insight is that the rest phase is not wasted time. It is an active restoration process during which your brain performs essential maintenance. Skipping or powering through these rest phases with caffeine and willpower does not eliminate the need for them — it merely defers and intensifies it, leading to the afternoon crash that so many remote workers experience around 2 or 3 PM.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-400" />
              Identifying Your Personal Ultradian Rhythm
            </h2>
            <p className="mb-3">
              While the 90-minute average is well-supported by research, individual cycles vary. Some people have shorter cycles of about 75 minutes; others have longer cycles closer to 110 minutes. Your personal cycle length may also vary by time of day, with morning cycles tending to be shorter and more intense and afternoon cycles being longer and flatter.
            </p>
            <p className="mb-3">
              To identify your personal rhythm, you need to observe yourself systematically. For one week, set an alarm to go off every 30 minutes during your workday. When it sounds, rate your current energy and focus level on a scale of 1 to 5 and note what you were doing. After a week, plot these ratings on a timeline. You will likely see a wave pattern emerge, with peaks and troughs repeating at a fairly consistent interval.
            </p>
            <p className="mb-4">
              Common signs that you are entering the rest phase of your ultradian cycle include:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Increasing restlessness</strong> — you shift in your chair, stretch, or feel a growing urge to move your body</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Mind wandering</strong> — you re-read the same paragraph multiple times or find your thoughts drifting to unrelated topics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Hunger or thirst cues</strong> — your body signals a desire for fuel or hydration as it prepares for metabolic restoration</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Yawning or sighing</strong> — these are involuntary attempts to increase oxygen intake and reset your respiratory rhythm</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Diminishing returns</strong> — tasks that felt easy 30 minutes ago now require disproportionate effort</span>
              </li>
            </ul>
            <p>
              These are not signs of laziness or weakness. They are your body's built-in signals that the active phase has ended and the rest phase has begun. Learning to recognize and honor these signals is one of the most impactful productivity skills you can develop.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Battery className="w-5 h-5 text-violet-400" />
              Aligning Your Work With Your Energy
            </h2>
            <p className="mb-3">
              Once you have identified your personal ultradian rhythm, the next step is to align your work schedule with it. The principle is straightforward: schedule your most cognitively demanding work for your active phases and reserve your rest phases for genuine recovery or low-demand tasks.
            </p>
            <p className="mb-3">
              In practice, this means organizing your day into 90-minute focus blocks separated by 15-to-20-minute recovery periods. During a focus block, you work on a single demanding task — writing, coding, analyzing, designing — without interruption. During the recovery period, you step away from the screen, move your body, hydrate, and let your mind wander without directed purpose.
            </p>
            <p className="mb-3">
              Most people can sustain four to five complete ultradian cycles of focused work per day, yielding six to seven and a half hours of genuine cognitive output. This is significantly more productive than the standard eight-hour workday, which typically produces only two to three hours of truly focused work interspersed with five to six hours of shallow tasks, context switching, and unproductive downtime.
            </p>
            <p className="mb-3">
              For remote workers, this alignment is especially powerful because you have full control over your schedule. In an office, meetings are imposed on you regardless of where you are in your ultradian cycle. At home, you can schedule meetings during your natural troughs and protect your peaks for deep work. A meeting during a trough is barely a sacrifice — your focus was going to be low anyway. A meeting during a peak, by contrast, wastes your best cognitive hours on an activity that rarely demands them.
            </p>
            <p>
              Pay particular attention to your first ultradian cycle of the day. For most people, this occurs in the first 90 minutes after reaching full wakefulness (which is typically 30 to 60 minutes after waking, once sleep inertia clears). This first cycle tends to be the strongest of the day — cortisol is at its natural daily peak, adenosine levels are low from overnight sleep, and willpower has not yet been depleted by decisions. Guard this cycle fiercely. It is your single most valuable block of productive time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5 text-violet-400" />
              Rest vs. Passive Entertainment: What Actually Recharges You
            </h2>
            <p className="mb-3">
              The rest phase of the ultradian cycle requires actual rest — not a different type of stimulation. This is where most people go wrong. When they feel their focus waning, they switch from work to scrolling social media, watching YouTube clips, or reading news articles. These activities feel like breaks, but they are not. They still engage the same attentional systems and keep the sympathetic nervous system activated. Your brain does not get the parasympathetic recovery it needs, and the next active phase starts from a depleted baseline.
            </p>
            <p className="mb-3">
              Research on attention restoration theory, developed by Rachel and Stephen Kaplan at the University of Michigan, identifies specific types of experiences that actually restore directed attention capacity. Exposure to natural environments — even looking at a tree through a window — activates involuntary attention (which does not fatigue) while allowing directed attention (which does fatigue) to recover. Physical movement, particularly walking, increases blood flow to the brain and promotes the clearance of metabolic waste.
            </p>
            <p className="mb-4">
              Effective rest activities for the ultradian trough include:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Walking (especially outdoors)</p>
                <p className="text-white/50 text-xs">Combines physical movement, exposure to natural light, and visual engagement with the environment. Even a 10-minute walk around the block can significantly restore cognitive capacity.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Gentle stretching or yoga</p>
                <p className="text-white/50 text-xs">Releases physical tension accumulated from sitting, activates the parasympathetic nervous system through deep breathing, and shifts attention from cognitive to somatic awareness.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Gazing at a distant view</p>
                <p className="text-white/50 text-xs">Looking at objects 20 feet or more away relaxes the ciliary muscles of the eyes (strained by close-up screen work) and engages the brain's spatial processing systems, which are different from the verbal and analytical systems used during work.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Mindful breathing or brief meditation</p>
                <p className="text-white/50 text-xs">Even three minutes of focused breathing reduces cortisol, activates the parasympathetic nervous system, and creates a clear psychological boundary between the completed work session and the rest period.</p>
              </div>
            </div>
            <p>
              Notice what is absent from this list: checking your phone, browsing social media, watching videos, or reading articles. These activities may feel pleasurable in the moment, but they do not restore the cognitive resources you need for the next ultradian cycle. Treating rest as a genuine skill to develop — rather than a gap to fill with entertainment — is one of the most underrated productivity strategies available to remote workers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-violet-400" />
              Putting It All Together: A Sample Ultradian Day
            </h2>
            <p className="mb-3">
              Here is what a workday structured around ultradian rhythms might look like for a remote worker. Assume a natural wake time of 7 AM with full alertness by 7:30 AM. The first ultradian cycle runs from approximately 7:30 to 9:00 AM — this is your peak deep work block. Spend it on the most challenging and important task of the day.
            </p>
            <p className="mb-3">
              From 9:00 to 9:20 AM, take a genuine recovery break. Walk outside, stretch, make tea, look out the window. No screens, no email, no Slack. At 9:20, your second cycle begins — another 90-minute deep work block lasting until about 10:50 AM. This is still a strong cognitive period, suitable for demanding creative or analytical work.
            </p>
            <p className="mb-3">
              The break at 10:50 can be slightly longer — 20 to 30 minutes — and is a natural time to check email and messages for the first time. Your third cycle, starting around 11:15 AM, may be suitable for slightly less demanding work — collaborative tasks, editing, review, or structured problem-solving.
            </p>
            <p className="mb-3">
              After lunch (which ideally falls during the trough between your third and fourth cycles), expect a dip in cognitive performance. The post-lunch period is the weakest point of most people's day. This is a good time for meetings, administrative tasks, or lower-stakes work. Your fourth cycle, typically starting around 2:30 to 3:00 PM, brings a second wind — not as strong as the morning peak but sufficient for meaningful work if you rested properly during the preceding troughs.
            </p>
            <p>
              By structuring your day this way, you honor your biology rather than fighting it. You accomplish more in four well-timed focus blocks than most people accomplish in eight hours of undifferentiated desk time. And because you are resting when your body asks for rest, you finish the day feeling tired but not destroyed — which means you recover overnight and start the next day from a full baseline rather than an accumulated deficit.
            </p>
          </section>

          <section className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Align Your Work With Your Biology</h2>
            <p className="mb-4">
              NomadBalance is built around the science of ultradian rhythms. Set your focus sessions to 90 minutes, let binaural beats support each phase, and use guided active breaks to ensure genuine recovery between cycles. Work with your body, not against it.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-white font-medium text-sm transition-colors">
              Get started for free
            </Link>
          </section>
        </div>
      </article>
    </div>
  );
}