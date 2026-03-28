import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, BookOpen, ClipboardList, TrendingUp, CalendarDays, AlertTriangle, HelpCircle, CheckCircle } from "lucide-react";

export default function IntermittentFastingBeginners() {
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
          <span className="text-white/30 text-xs">12 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Intermittent Fasting for Beginners: Everything You Need to Know</h1>
        <p className="text-white/40 text-sm mb-10">A comprehensive, evidence-based guide to intermittent fasting — what it is, how it works, every major protocol, how to start safely, and who should avoid it.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              What Is Intermittent Fasting and How Does It Work?
            </h2>
            <p className="mb-3">
              Intermittent fasting is not a diet — it is an eating pattern. Unlike traditional diets that focus on what you eat, intermittent fasting focuses on when you eat. It cycles between defined periods of eating and periods of voluntary abstinence from food. During fasting windows, you consume no calories, though water, black coffee, and plain tea are generally permitted. During eating windows, you eat normally, ideally focusing on nutrient-dense whole foods.
            </p>
            <p className="mb-3">
              The concept is not new. Humans evolved in environments where food was not constantly available, and our physiology is well-adapted to periods without eating. Every major religious tradition includes some form of fasting, and hunter-gatherer societies naturally experienced cycles of feast and famine. What is new is the growing body of scientific research demonstrating that deliberate fasting periods can produce measurable health benefits beyond simple calorie reduction.
            </p>
            <p className="mb-3">
              When you fast, several things happen at the cellular level. After approximately 12 hours without food, your body begins to shift its primary fuel source from glucose (derived from recently consumed food) to stored body fat. Insulin levels drop significantly, which facilitates fat burning and improves insulin sensitivity. After 16 to 18 hours, a process called autophagy accelerates — this is your body's cellular recycling program, where damaged proteins and organelles are broken down and recycled into new cellular components. Research from Yoshinori Ohsumi, who won the 2016 Nobel Prize in Physiology or Medicine for his work on autophagy, showed that this process is crucial for cellular health and longevity.
            </p>
            <p>
              Growth hormone levels also increase during fasting — studies show levels can rise by up to 500 percent during a 24-hour fast — which supports muscle preservation and fat metabolism. These hormonal and cellular changes explain why intermittent fasting can produce health benefits that go beyond what simple calorie restriction achieves, even when total calorie intake is identical.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
              Every Major IF Protocol Explained
            </h2>
            <p className="mb-4">
              There are several established intermittent fasting protocols, each with different fasting-to-eating ratios. The best protocol is the one that fits your lifestyle, preferences, and health goals. Here is a detailed breakdown of each approach:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">16:8 Method (Lean Gains)</p>
                <p className="text-white/50 text-xs">Fast for 16 hours, eat within an 8-hour window. This is the most popular protocol because it is the easiest to adopt — most people simply skip breakfast and eat between noon and 8 PM. The 16-hour fast is long enough to deplete liver glycogen and initiate meaningful fat burning while being short enough that most people can maintain it indefinitely without significant hunger or social disruption. This is the recommended starting point for beginners.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">18:6 Method</p>
                <p className="text-white/50 text-xs">Fast for 18 hours, eat within a 6-hour window. A natural progression from 16:8 for those who find the shorter fast too easy. Eating between 12 PM and 6 PM or 1 PM and 7 PM are common configurations. The additional two fasting hours push you further into the fat-burning and autophagy zone, though the narrower eating window can make it harder to consume adequate calories and nutrients.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">5:2 Method</p>
                <p className="text-white/50 text-xs">Eat normally five days per week, dramatically reduce calories (500-600 calories) on two non-consecutive days. Popularized by Dr. Michael Mosley, this approach appeals to people who dislike daily restrictions. The fasting days can be challenging, but knowing you eat normally the next day makes them psychologically manageable. Research from the University of Manchester found the 5:2 method equally effective as continuous calorie restriction for weight loss and insulin sensitivity improvement.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Eat-Stop-Eat (24-Hour Fast)</p>
                <p className="text-white/50 text-xs">One or two complete 24-hour fasts per week, eating normally on other days. For example, eat dinner at 7 PM on Monday and do not eat again until 7 PM on Tuesday. This is more advanced and can be difficult for beginners due to hunger and energy fluctuations. However, it maximizes autophagy and growth hormone responses.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">OMAD (One Meal a Day)</p>
                <p className="text-white/50 text-xs">Eat all daily calories in a single meal, typically within a one-hour window. This is the most extreme common protocol and is not recommended for beginners. It can be difficult to consume adequate nutrients in a single meal, and the extended fasting period can cause significant energy fluctuations. Some experienced fasters find OMAD simplifies their day and sharpens their focus, but it requires careful nutritional planning.</p>
              </div>
            </div>
            <p>
              For remote workers, the 16:8 method integrates naturally with work schedules. Skipping breakfast eliminates the morning food decision, and your peak fasting hours coincide with your morning focus period. Many practitioners report enhanced mental clarity during fasted morning work sessions, which aligns with the elevated norepinephrine and growth hormone levels that fasting produces.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Evidence-Based Benefits of Intermittent Fasting
            </h2>
            <p className="mb-3">
              The research on intermittent fasting has grown substantially over the past decade, with studies published in major journals including the New England Journal of Medicine, Cell Metabolism, and The Lancet. Here is what the evidence reliably supports:
            </p>
            <p className="mb-3">
              Weight loss and fat loss are the most commonly sought benefits, and the evidence here is strong. A 2020 systematic review in the Annual Review of Nutrition found that intermittent fasting produces weight loss of 3 to 8 percent of body weight over 8 to 12 weeks, comparable to traditional caloric restriction. Importantly, intermittent fasting appears to preferentially reduce visceral fat — the metabolically dangerous fat that surrounds your organs — even when total weight loss is modest. This visceral fat reduction is particularly significant because visceral fat is strongly associated with type 2 diabetes, cardiovascular disease, and chronic inflammation.
            </p>
            <p className="mb-3">
              Insulin sensitivity improvement is one of the most robust findings. Fasting periods allow insulin levels to drop to baseline, which is something that never happens in people who eat frequently throughout the day. A study published in Cell Metabolism showed that time-restricted eating improved insulin sensitivity by 36 percent in men with prediabetes, even without weight loss. For the millions of people with insulin resistance — a precursor to type 2 diabetes — intermittent fasting offers a powerful, medication-free intervention.
            </p>
            <p className="mb-3">
              Brain health benefits are supported by animal research and emerging human studies. Fasting increases the production of brain-derived neurotrophic factor (BDNF), a protein that supports the growth and survival of neurons. Higher BDNF levels are associated with improved learning, memory, and resistance to neurological disease. While large-scale human trials are still underway, the mechanistic evidence is compelling and consistent with the subjective reports of improved mental clarity that many intermittent fasters describe.
            </p>
            <p>
              Inflammation reduction is another well-documented benefit. A study in Nutrition Research found that intermittent fasting reduced markers of systemic inflammation including C-reactive protein, tumor necrosis factor alpha, and interleukin-6. Chronic low-grade inflammation is implicated in virtually every major disease of aging, from cardiovascular disease to cancer to Alzheimer's, making this anti-inflammatory effect potentially significant for long-term health.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-emerald-400" />
              How to Start: Your Week-by-Week Plan
            </h2>
            <p className="mb-3">
              The most common mistake beginners make is jumping directly into a 16:8 or longer fast. This leads to intense hunger, irritability, poor energy, and rapid abandonment. A gradual approach allows your hormones and habits to adapt, making the transition sustainable rather than miserable.
            </p>
            <p className="mb-4">
              Follow this four-week progression:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 1: 12:12 fast</strong> — stop eating after dinner (say, 8 PM) and do not eat again until 8 AM. This is barely different from most people's normal pattern but establishes the habit of defined eating windows and eliminates late-night snacking, which alone can produce noticeable results</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 2: 14:10 fast</strong> — push your first meal to 10 AM while keeping dinner at 8 PM. You are now experiencing a meaningful fasting period but the adjustment from week 1 is only two hours. Drink water and black coffee or tea in the morning to manage any hunger</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 3: 15:9 fast</strong> — move your first meal to 11 AM. Most people find that hunger in the morning diminishes significantly by week three as their ghrelin (hunger hormone) patterns adapt to the new schedule. Your body is learning that food arrives at 11, not at 7</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Week 4: 16:8 fast</strong> — first meal at noon, last meal by 8 PM. You have now arrived at the standard 16:8 protocol through a gradual process that has allowed your hormones, habits, and social routines to adapt. Most people find this schedule sustainable indefinitely</span>
              </li>
            </ul>
            <p className="mb-3">
              During the transition, prioritize hydration. Many symptoms attributed to fasting — headaches, fatigue, brain fog — are actually dehydration symptoms. Aim for at least 2 to 3 liters of water during your fasting window. Adding a pinch of salt to your water supports electrolyte balance without breaking your fast. Black coffee and plain green tea are both permitted and provide mild appetite suppression that eases the transition.
            </p>
            <p>
              When you break your fast, resist the urge to eat a massive meal. Start with a moderate portion of protein and healthy fats — eggs, avocado, nuts, or grilled chicken are excellent choices. Protein stabilizes blood sugar and provides sustained satiety, preventing the energy crash that comes from breaking a fast with refined carbohydrates or sugar. Within your eating window, aim for two to three balanced meals that provide adequate protein (at least 0.7 grams per pound of body weight daily), healthy fats, complex carbohydrates, and micronutrients from vegetables and fruits.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-emerald-400" />
              Common Mistakes and Who Should NOT Fast
            </h2>
            <p className="mb-3">
              The most frequent mistake is compensatory overeating during the eating window. If you fast for 16 hours and then consume 3,000 calories in 8 hours — far exceeding your daily needs — you will not lose weight regardless of the fasting schedule. Intermittent fasting creates a favorable hormonal environment for fat loss, but it does not override the fundamental energy balance equation. You still need to eat appropriate portions of quality food during your eating window.
            </p>
            <p className="mb-3">
              Another common error is excessive exercise during the adaptation period. While fasted training can be beneficial once you are adapted, intense workouts during your first two weeks of fasting often lead to hypoglycemia, excessive fatigue, and discouragement. Keep exercise moderate during the transition and gradually increase intensity as your body adapts to using stored fat as fuel.
            </p>
            <p className="mb-3">
              Obsessing over the exact minute of your eating window is counterproductive. If your window is noon to 8 PM and you feel genuinely hungry at 11:30 AM, eating 30 minutes early is not a failure. The benefits of intermittent fasting come from the general pattern over weeks and months, not from militant adherence to exact times. Flexibility prevents the all-or-nothing thinking that causes people to abandon the practice entirely after a single imperfect day.
            </p>
            <p className="mb-4">
              Intermittent fasting is not appropriate for everyone. The following groups should avoid IF or consult a physician before starting:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Pregnant or breastfeeding women</strong> — caloric restriction and extended fasting can impair fetal development and milk production; nutrient timing is critical during these periods</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">People with a history of eating disorders</strong> — the restriction framework of IF can trigger or exacerbate disordered eating patterns including binge-restrict cycles</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Type 1 diabetics or those on insulin</strong> — fasting while on insulin or certain diabetes medications can cause dangerous hypoglycemia; medical supervision is essential</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Children and adolescents</strong> — growing bodies need consistent nutrient availability; fasting is not appropriate for anyone under 18</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">People who are underweight</strong> — if your BMI is below 18.5, fasting could further compromise your nutritional status and should be avoided</span>
              </li>
            </ul>
            <p>
              If you are taking any medication, consult your physician before starting intermittent fasting. Some medications must be taken with food, and others (particularly blood sugar and blood pressure medications) may need dose adjustments as fasting changes your metabolic parameters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-400" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Does coffee break my fast?</p>
                <p className="text-white/50 text-xs">Black coffee does not break your fast and may actually enhance the benefits by boosting fat oxidation and autophagy. However, adding cream, sugar, milk, or flavored creamers introduces calories that trigger an insulin response and technically break the fast. If you must add something, a tiny splash of heavy cream (under 10 calories) is unlikely to significantly impact your fasting state, but purists stick to black.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Will I lose muscle while fasting?</p>
                <p className="text-white/50 text-xs">Short fasting periods of 16 to 24 hours do not cause significant muscle loss, especially when combined with resistance training and adequate protein intake during your eating window. The increase in growth hormone during fasting actually helps preserve muscle mass. Muscle loss becomes a concern only with extended fasts (48 hours or more) or chronic caloric deficiency. Aim for at least 0.7 grams of protein per pound of body weight daily to maintain muscle.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Can I exercise while fasting?</p>
                <p className="text-white/50 text-xs">Yes, and many people prefer it. Fasted training can enhance fat oxidation and improve metabolic flexibility. Light to moderate exercise — walking, yoga, moderate cardio — is well-tolerated during fasting. For intense strength training, some people perform better fasted while others prefer eating first. Experiment to find what works for your body. If you train fasted, consume protein within two hours post-workout for optimal muscle recovery.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Is intermittent fasting different for women?</p>
                <p className="text-white/50 text-xs">Some research suggests that women may be more sensitive to caloric restriction signals, which can affect hormonal balance. Some women report menstrual irregularities with aggressive fasting protocols. A more moderate approach — 14:10 rather than 16:8, or fasting only five days per week — is often recommended as a starting point for women. Pay attention to your menstrual cycle, energy levels, and mood as indicators of whether your fasting protocol is appropriate.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">How long does it take to see results?</p>
                <p className="text-white/50 text-xs">Most people notice improved energy and mental clarity within the first one to two weeks. Measurable weight loss typically begins by week two or three. Significant body composition changes — visible fat loss and improved muscle definition — usually become apparent after six to eight weeks of consistent practice. Metabolic improvements such as better insulin sensitivity can be measured within four weeks but may take three to six months to fully manifest.</p>
              </div>
            </div>
            <p>
              The most important principle in intermittent fasting is sustainability. A protocol that you follow consistently for six months will produce far better results than an aggressive protocol that you abandon after two weeks. Start conservatively, listen to your body, and adjust based on how you feel and the results you observe. Intermittent fasting should enhance your life — if it makes you miserable, irritable, or obsessive about food, it is either the wrong protocol or the wrong approach for you entirely.
            </p>
          </section>

          <section className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Support Your Fasting Schedule with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance helps you maintain healthy eating rhythms alongside your work schedule. Set hydration reminders during your fasting window, schedule mindful eating breaks during your eating window, and track how your nutrition timing impacts your focus and energy throughout the workday.
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
