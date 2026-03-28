import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Clock, Sun, Utensils, Calendar, Brain, CheckCircle, AlertTriangle } from "lucide-react";

export default function MealTimingRemote() {
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
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">Nutrition</span>
          <span className="text-white/30 text-xs">10 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Meal Timing for Remote Workers: When to Eat for Peak Performance</h1>
        <p className="text-white/40 text-sm mb-10">Your eating schedule might be sabotaging your productivity. Here is how to align your meals with your body's natural rhythms for sustained energy and sharper focus.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-emerald-400" />
              Circadian Rhythm and Digestion: Why Timing Matters More Than You Think
            </h2>
            <p className="mb-3">
              Your body runs on an internal clock known as the circadian rhythm, a roughly 24-hour cycle that governs everything from hormone release to body temperature to digestive enzyme production. This clock does not just tell you when to sleep. It also dictates when your body is best prepared to process food, absorb nutrients, and convert calories into usable energy.
            </p>
            <p className="mb-3">
              Research published in the journal Cell Metabolism has shown that the timing of food intake has a profound impact on metabolic health, independent of what or how much you eat. Your digestive system is most active during daylight hours, with peak enzyme production occurring in the late morning. Insulin sensitivity, your body's ability to process glucose efficiently, is highest in the first half of the day and declines steadily as evening approaches.
            </p>
            <p className="mb-3">
              For remote workers, this has significant implications. Without the structure of a commute and office lunch hour, it is easy to fall into erratic eating patterns. You might skip breakfast because you rolled out of bed and straight into a Zoom call, then graze mindlessly through the afternoon, and finally eat a massive dinner at 9 PM because you were "too busy" during the day.
            </p>
            <p>
              This pattern works against your biology. Eating the majority of your calories late in the day forces your body to process food when its metabolic machinery is winding down. The result is sluggish digestion, disrupted sleep, morning grogginess, and a vicious cycle that erodes both health and productivity over time. Understanding your circadian rhythm is the first step toward building an eating schedule that supports your work rather than undermining it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Pre-Work vs. Post-Work Eating: Fueling the Right Phases
            </h2>
            <p className="mb-3">
              Think of your workday as having distinct energy phases, each with different nutritional demands. The morning phase requires fuel for cognitive startup. Your brain has been fasting for eight or more hours during sleep, and its glycogen stores are partially depleted. A protein-rich breakfast with moderate complex carbohydrates provides the amino acids needed for neurotransmitter production and the steady glucose supply your prefrontal cortex demands for executive function.
            </p>
            <p className="mb-3">
              The mid-morning window, roughly two to four hours after waking, is when most people hit their cognitive peak. This is when cortisol levels are naturally elevated, attention is sharpest, and your brain is primed for demanding analytical work. Eating a heavy meal during this window diverts blood flow to your digestive system and triggers a parasympathetic response that promotes rest, not focus. If you have eaten a solid breakfast, you should not need anything more than water or a light snack during this peak performance window.
            </p>
            <p className="mb-3">
              The post-lunch period, often called the "afternoon slump," is partly circadian and partly dietary. Your body experiences a natural dip in alertness between 1 PM and 3 PM regardless of what you eat. However, a carbohydrate-heavy lunch amplifies this dip significantly by spiking blood sugar and then crashing it. A lunch built around protein, healthy fats, and fiber-rich vegetables keeps blood sugar stable and minimizes the severity of the afternoon dip.
            </p>
            <p>
              The evening phase should prioritize recovery. After your workday ends, your body shifts into repair mode. A moderate dinner eaten at least three hours before bedtime gives your body time to digest before sleep. Including complex carbohydrates at dinner can actually aid sleep by promoting serotonin production, which converts to melatonin. This is the one time of day when a moderate serving of whole grains or starchy vegetables works in your favor.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Aligning Your Eating Window with Meetings and Deep Work
            </h2>
            <p className="mb-3">
              One of the unique challenges remote workers face is the meeting-heavy calendar. Back-to-back video calls make it tempting to skip meals entirely or eat at your desk while half-listening to a standup. Neither approach serves you well. Eating while distracted reduces satiety signals, meaning you will feel hungry again sooner. And skipping meals leads to blood sugar crashes that impair decision-making in the very meetings you sacrificed lunch to attend.
            </p>
            <p className="mb-3">
              The solution is to treat your eating schedule with the same respect you give your meeting schedule. Block out meal times on your calendar as non-negotiable appointments. A 30-minute lunch block between 12:00 and 12:30 is not laziness, it is an investment in your afternoon productivity. Studies from Cornell University have demonstrated that workers who take proper meal breaks show significantly higher sustained attention and lower error rates in the hours that follow.
            </p>
            <p className="mb-3">
              If your calendar is truly packed, consider the strategic snack approach. Keep nutrient-dense snacks within arm's reach: a small container of mixed nuts, a piece of fruit with nut butter, or a hard-boiled egg. These take under a minute to eat and provide enough fuel to bridge you to your next proper meal without the cognitive disruption of a full eating session.
            </p>
            <p>
              For deep work sessions, plan your eating around them rather than interrupting them. If you know you have a two-hour block of focused coding or writing ahead, eat a balanced meal 30 to 60 minutes before you begin. You will enter the session with stable blood sugar and a brain that is fully fueled. Trying to push through a deep work session on an empty stomach is a false economy. The time you save by skipping the meal is lost to diminished cognitive output.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              Meal Prep Strategies for the Remote Professional
            </h2>
            <p className="mb-3">
              The biggest obstacle to consistent meal timing is not knowledge, it is convenience. When you are deep in a project and your stomach starts growling, the path of least resistance is whatever requires zero preparation: a bag of chips, leftover pizza, or just skipping the meal entirely. Meal prep eliminates this problem by making the healthy choice the easy choice.
            </p>
            <p className="mb-4">
              You do not need to become a meal prep influencer who spends all Sunday in the kitchen. Here are practical strategies scaled to different commitment levels:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Minimal Prep (15 minutes on Sunday)</p>
                <p className="text-white/50 text-xs">Wash and chop vegetables for the week. Cook a batch of rice or quinoa. Hard-boil a dozen eggs. These three actions give you the building blocks for dozens of quick meals.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Moderate Prep (45 minutes on Sunday)</p>
                <p className="text-white/50 text-xs">Cook two protein sources (grilled chicken and baked salmon, for example). Prepare two different grain bases. Make a large salad without dressing. Portion into containers for grab-and-go lunches.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Full Prep (90 minutes on Sunday)</p>
                <p className="text-white/50 text-xs">Cook complete meals for the entire week. Include breakfast burritos that freeze well, lunch bowls with varied toppings, and pre-portioned snack packs. Label everything with the day of the week.</p>
              </div>
            </div>
            <p>
              The key insight is that meal prep is not about cooking elaborate dishes. It is about removing decision fatigue and preparation time from your workday. When lunch is already sitting in your refrigerator, ready to be microwaved in two minutes, you are far more likely to eat well and eat on schedule. Even the minimal prep approach dramatically improves your odds of maintaining consistent meal timing throughout the work week.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-400" />
              The Lunch Break Myth: Why "Eating at Your Desk" Is Costing You
            </h2>
            <p className="mb-3">
              There is a persistent belief in work culture that eating at your desk is a sign of dedication. In remote work, this translates to eating while scrolling Slack messages or responding to emails. Far from being productive, this habit actively harms both your digestion and your work quality.
            </p>
            <p className="mb-3">
              When you eat while working, your body is in a state of mild sympathetic nervous system activation, the fight-or-flight response triggered by work stress and screen stimulation. Digestion requires the opposite state: parasympathetic activation, the rest-and-digest mode. Eating under stress reduces digestive enzyme production, slows gastric motility, and impairs nutrient absorption. Over time, this contributes to bloating, acid reflux, and other digestive complaints that many desk workers dismiss as normal.
            </p>
            <p className="mb-3">
              From a productivity standpoint, the desk lunch is equally counterproductive. Multitasking research consistently shows that the brain cannot truly focus on two tasks simultaneously. Instead, it rapidly switches between them, with each switch incurring a cognitive cost. When you eat at your desk while working, you are doing neither task well. Your meal satisfaction is reduced because you are not paying attention to the sensory experience of eating, and your work quality suffers because your attention is fragmented.
            </p>
            <p className="mb-3">
              The real lunch break, one where you step away from your desk, eat mindfully, and give your brain a genuine pause, is one of the most powerful productivity tools available to remote workers. A study from the University of Illinois found that brief diversions from a task dramatically improve sustained attention. Your 20-minute lunch break away from the screen is not wasted time. It is the recharge that makes your afternoon work possible.
            </p>
            <p>
              If you take nothing else from this article, take this: protect your lunch break. Close the laptop. Sit somewhere different. Taste your food. Look out a window. These 20 minutes will give you back hours of productive energy in the afternoon. The math is simple and the science is clear. Your lunch break is not a luxury. It is infrastructure for sustainable performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400" />
              Putting It All Together: A Sample Day
            </h2>
            <p className="mb-4">Here is what an optimized eating schedule looks like for a typical remote work day:</p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">7:00 AM - Wake up.</strong> Drink a full glass of water to rehydrate after sleep. Wait 60 to 90 minutes before coffee to let cortisol do its job naturally.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">8:00 AM - Breakfast.</strong> Eggs with avocado and whole grain toast provides protein, healthy fats, and slow-release carbohydrates. Eat away from your desk.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">8:30-12:00 - Peak work window.</strong> Water and maybe a light snack around 10:30 if needed. Avoid heavy eating during your sharpest hours.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">12:30 PM - Lunch.</strong> Step away from your desk. A protein-focused meal with plenty of vegetables and moderate complex carbs. Take a full 20 to 30 minutes.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">3:00 PM - Afternoon snack.</strong> A handful of almonds, an apple, or Greek yogurt to counter the natural afternoon dip without spiking blood sugar.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">6:30 PM - Dinner.</strong> A balanced meal with protein, vegetables, and some complex carbs. Eat at least three hours before bedtime for optimal digestion and sleep quality.</span>
              </li>
            </ul>
            <p>
              This schedule is a template, not a prescription. Adjust the timing to fit your natural wake time, work hours, and personal preferences. The principles remain the same regardless of your specific schedule: eat your largest meals earlier in the day, protect your peak work hours from heavy digestion, take real breaks for meals, and stop eating at least three hours before sleep. Small adjustments to when you eat can yield surprisingly large improvements in how you feel, think, and perform throughout your remote workday.
            </p>
          </section>

          <section className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Build Better Habits with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance helps remote workers build sustainable routines that support both productivity and health. Set meal reminders, track your energy levels, and align your work schedule with your body's natural rhythms.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white font-medium text-sm transition-colors">
              Get started for free
            </Link>
          </section>
        </div>
      </article>
    </div>
  );
}
