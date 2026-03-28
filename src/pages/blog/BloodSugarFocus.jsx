import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Brain, Apple, TrendingDown, Utensils, Leaf, Clock, CheckCircle } from "lucide-react";

export default function BloodSugarFocus() {
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
          <span className="text-white/30 text-xs">8 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Blood Sugar and Focus: How What You Eat Affects How You Think</h1>
        <p className="text-white/40 text-sm mb-10">The science behind glucose, cognition, and practical food choices that keep your brain performing at its best throughout the workday.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-400" />
              Glucose: Your Brain's Primary Fuel Source
            </h2>
            <p className="mb-3">
              Your brain is the most metabolically expensive organ in your body. Despite accounting for only about two percent of your body weight, it consumes roughly twenty percent of your total energy expenditure. The primary fuel driving this enormous energy demand is glucose, a simple sugar derived from the carbohydrates, proteins, and fats you consume. Every thought you think, every decision you make, and every creative idea you generate depends on a steady supply of glucose reaching your neurons at the right time and in the right amount.
            </p>
            <p className="mb-3">
              Research published in the journal Psychopharmacology has demonstrated that cognitive functions including memory, attention, and executive function are all sensitive to fluctuations in blood glucose levels. When glucose availability drops too low, your brain begins to struggle. You experience this as brain fog, difficulty concentrating, irritability, and a general sense of mental fatigue that no amount of willpower can overcome.
            </p>
            <p className="mb-3">
              Conversely, flooding your system with too much glucose at once triggers a cascade of hormonal responses — primarily a spike in insulin — that can rapidly pull glucose out of your bloodstream and leave you in a worse cognitive state than if you had not eaten at all. This is the fundamental paradox of blood sugar and focus: your brain needs glucose to function, but too much too fast is just as damaging as too little.
            </p>
            <p>
              For remote workers who depend on sustained cognitive performance throughout the day, understanding this relationship is not a nice-to-have — it is a core productivity strategy. The foods you choose, the timing of your meals, and the composition of each plate directly determine how well your brain performs during your most important work hours.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-emerald-400" />
              The Glycemic Index and Your Cognitive Performance
            </h2>
            <p className="mb-3">
              The glycemic index is a scale from 0 to 100 that ranks carbohydrate-containing foods by how quickly they raise blood glucose levels after eating. Foods with a high glycemic index — white bread, sugary cereals, candy, most pastries — cause a rapid spike in blood sugar followed by an equally rapid crash. Foods with a low glycemic index — legumes, most vegetables, nuts, whole grains — produce a gradual, sustained rise that maintains stable energy over hours.
            </p>
            <p className="mb-3">
              A landmark study from the University of Toronto found that participants who consumed a low-glycemic breakfast performed significantly better on tests of attention and memory throughout the morning compared to those who ate a high-glycemic breakfast with the same caloric content. The difference was not marginal — it was substantial enough to represent the gap between a productive morning and a wasted one.
            </p>
            <p className="mb-3">
              The mechanism is straightforward. High-glycemic foods trigger a massive insulin response that overshoots, pulling blood sugar below baseline levels within sixty to ninety minutes. This reactive hypoglycemia creates the classic post-meal crash: drowsiness, difficulty concentrating, and a craving for more sugary foods to bring glucose back up. You enter a cycle of spike and crash that destroys sustained focus.
            </p>
            <p>
              Low-glycemic foods, on the other hand, release glucose slowly and steadily. Insulin rises gently, glucose levels remain within the optimal range for cognition, and your brain receives a consistent fuel supply for two to four hours. There is no crash, no craving, and no cognitive cliff. This is the biochemical foundation of sustained mental performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Why Post-Meal Crashes Destroy Your Afternoon
            </h2>
            <p className="mb-3">
              If you have ever felt an overwhelming urge to nap after lunch, you have experienced a post-meal crash in its most recognizable form. This phenomenon — sometimes called postprandial somnolence — is the single biggest productivity killer for remote workers during the afternoon hours. Without the social pressure of an office environment to keep you alert, the temptation to zone out or scroll social media during a post-lunch slump can be nearly irresistible.
            </p>
            <p className="mb-3">
              The crash is driven by multiple overlapping mechanisms. First, a large meal diverts blood flow toward the digestive system and away from the brain. Second, high-glycemic carbohydrates trigger insulin-mediated uptake of amino acids in the muscles, which paradoxically increases the relative concentration of tryptophan crossing the blood-brain barrier. Tryptophan is the precursor to serotonin, which is then converted to melatonin — the sleep hormone. In other words, a sugary lunch literally makes your brain produce sleep chemicals.
            </p>
            <p className="mb-3">
              Third, the blood sugar crash that follows a high-glycemic meal activates your sympathetic nervous system in a stress response, releasing cortisol and adrenaline. While these hormones temporarily restore alertness, they also impair the prefrontal cortex functions you need most for knowledge work: planning, decision-making, and creative thinking. You might feel awake, but your brain is operating in a defensive mode optimized for survival, not innovation.
            </p>
            <p>
              The solution is not to skip lunch — fasting creates its own cognitive impairments for most people. The solution is to compose your lunch strategically so that it provides steady glucose without triggering the hormonal cascade that leads to a crash. The composition of your meal matters far more than its size.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              Meal Composition: The Three Pillars of Stable Energy
            </h2>
            <p className="mb-3">
              Every meal you eat during the workday should be built around three pillars: protein, healthy fat, and fiber-rich carbohydrates. This combination slows gastric emptying, moderates the insulin response, and provides a steady stream of glucose to your brain over several hours. When any one of these pillars is missing, the system breaks down.
            </p>
            <p className="mb-4">
              Here is how each component contributes to sustained focus:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Protein</strong> — slows glucose absorption, provides amino acids for neurotransmitter production (especially tyrosine for dopamine and norepinephrine, which drive motivation and alertness), and promotes satiety so you are not distracted by hunger</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Healthy fat</strong> — further slows digestion, provides essential fatty acids for neuronal membrane health, and helps absorb fat-soluble vitamins that support cognitive function</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Fiber-rich carbohydrates</strong> — delivers glucose at a controlled rate, feeds beneficial gut bacteria that produce short-chain fatty acids supporting brain health, and prevents the rapid blood sugar spikes that trigger crashes</span>
              </li>
            </ul>
            <p className="mb-3">
              A practical rule of thumb is the plate method: fill half your plate with non-starchy vegetables, one quarter with lean protein, and one quarter with complex carbohydrates. Add a thumb-sized portion of healthy fat. This simple framework automatically creates a low-glycemic, nutrient-dense meal without requiring calorie counting or detailed nutritional knowledge.
            </p>
            <p>
              The order in which you eat also matters. Research from Weill Cornell Medical College found that eating vegetables and protein before carbohydrates reduced post-meal glucose spikes by up to 73 percent compared to eating carbohydrates first. Simply rearranging the order of the same foods on your plate can dramatically improve your post-meal cognitive performance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Apple className="w-5 h-5 text-emerald-400" />
              Practical Food Choices for Sustained Focus
            </h2>
            <p className="mb-4">
              Knowing the theory is important, but what does this look like in practice? Here are specific foods and combinations that support stable blood sugar and sustained cognitive performance throughout your workday:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Breakfast: Greek Yogurt with Berries and Nuts</p>
                <p className="text-white/50 text-xs">High-protein Greek yogurt provides sustained energy and tyrosine for alertness. Berries are low-glycemic and rich in flavonoids that improve blood flow to the brain. A handful of walnuts or almonds adds healthy fat and further slows glucose absorption.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Lunch: Salmon Salad with Quinoa</p>
                <p className="text-white/50 text-xs">Salmon delivers omega-3 fatty acids (DHA and EPA) that are critical for brain cell membrane fluidity and neurotransmitter function. A large mixed green salad provides fiber and micronutrients. Quinoa offers complete protein and complex carbohydrates with a glycemic index of only 53.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Afternoon Snack: Apple with Almond Butter</p>
                <p className="text-white/50 text-xs">The fiber in the apple slows sugar absorption while the fat and protein in almond butter extend the energy release. This combination provides approximately two hours of stable energy, perfectly bridging the gap between lunch and dinner.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Focus Snack: Dark Chocolate and Mixed Nuts</p>
                <p className="text-white/50 text-xs">Dark chocolate (70 percent cacao or higher) contains flavonoids that increase blood flow to the brain and small amounts of caffeine and theobromine for gentle alertness. Paired with nuts, this creates a satisfying, low-glycemic snack that supports extended focus sessions.</p>
              </div>
            </div>
            <p>
              Equally important is knowing what to avoid during work hours. Sugary energy drinks, white bread sandwiches, processed snack bars, fruit juices, and large portions of white rice or pasta will all create blood sugar spikes followed by crashes that sabotage your cognitive performance. Save these foods for weekends or evenings when sustained mental focus is less critical.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              Timing Your Meals Around Deep Work
            </h2>
            <p className="mb-3">
              Beyond what you eat, when you eat has a significant impact on your cognitive performance. Your body's insulin sensitivity fluctuates throughout the day following your circadian rhythm. For most people, insulin sensitivity is highest in the morning and decreases as the day progresses. This means your body handles carbohydrates most efficiently early in the day and least efficiently in the evening.
            </p>
            <p className="mb-3">
              From a practical standpoint, this suggests front-loading your carbohydrate intake earlier in the day and shifting toward higher-protein, higher-fat meals as the afternoon progresses. A moderately sized breakfast with balanced macronutrients fuels your morning deep work session. A lighter, protein-focused lunch minimizes the afternoon crash. A small, nutrient-dense snack sustains you through the late afternoon.
            </p>
            <p className="mb-3">
              The timing of meals relative to deep work sessions also matters. Eating a large meal immediately before a focused work session is counterproductive because your body diverts resources to digestion. Ideally, you should finish eating sixty to ninety minutes before a major deep work block, giving your body time to begin absorbing nutrients without the acute digestive burden competing for blood flow and energy.
            </p>
            <p className="mb-3">
              Hydration is another often-overlooked factor. Even mild dehydration — as little as one to two percent of body weight — impairs attention, working memory, and executive function. Many remote workers mistake dehydration-related fatigue for blood sugar issues. Keep water accessible at your desk and aim for consistent intake throughout the day rather than large volumes at once.
            </p>
            <p>
              The bottom line is this: food is not just fuel — it is a cognitive tool. By choosing the right foods, eating them in the right order, and timing your meals strategically around your most important work, you can maintain stable blood sugar and sustain peak cognitive performance for hours at a time. This is not about dieting or restriction. It is about aligning your nutrition with your professional goals so that your brain has exactly what it needs, exactly when it needs it.
            </p>
          </section>

          <section className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Fuel Your Focus with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance helps you build nutrition-aware work routines — schedule meal reminders around your focus sessions, track your energy patterns, and discover the eating habits that keep you performing at your best all day long.
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
