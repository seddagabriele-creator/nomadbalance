import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Eye, Monitor, Sun, Lightbulb, Clock, Glasses } from "lucide-react";

export default function EyeStrainComputerScreen() {
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
          <span className="text-white/30 text-xs">7 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Eye Strain From Computer Screens: Prevention and Relief for Remote Workers</h1>
        <p className="text-white/40 text-sm mb-10">If your eyes feel dry, tired, or blurry by the end of a workday, you are not alone. Digital eye strain affects the majority of remote workers, but the right habits and setup can eliminate it almost entirely.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-400" />
              What Is Digital Eye Strain and Why Remote Workers Are Hit Hardest
            </h2>
            <p className="mb-3">
              Digital eye strain, clinically known as computer vision syndrome, is a group of eye and vision-related problems that result from prolonged screen use. The American Optometric Association estimates that the condition affects roughly 65 to 90 percent of computer users, with symptoms intensifying in proportion to daily screen time. For remote workers who routinely spend eight to twelve hours in front of monitors, laptops, and phones, digital eye strain is not a possibility but a near certainty unless deliberate preventive measures are in place.
            </p>
            <p className="mb-3">
              The root cause is straightforward. When you stare at a screen, your eyes must constantly focus and refocus on pixelated characters that lack the sharp contrast of printed text. Your eye muscles work harder to maintain clarity at a fixed distance for hours at a time. Meanwhile, your blink rate drops dramatically. Normal blink rate is about 15 to 20 times per minute, but studies show that screen users blink only 5 to 7 times per minute. Each missed blink means less moisture spread across the corneal surface, leading to dryness, irritation, and that gritty feeling by mid-afternoon.
            </p>
            <p className="mb-3">
              The symptoms of computer vision syndrome extend beyond the eyes themselves. Headaches, particularly those concentrated around the forehead and temples, are one of the most common complaints. Neck and shoulder pain frequently accompany eye strain because people unconsciously lean forward or tilt their heads to compensate for visual discomfort. Blurred vision, double vision, and difficulty refocusing when looking away from the screen are all hallmarks of the condition.
            </p>
            <p>
              Remote workers face compounded risk because the boundaries between work screens and personal screens have dissolved. In a traditional office, you might leave your computer at 6 PM and spend the evening away from monitors. Working from home, many people close their laptop and immediately open a tablet or phone. The cumulative screen exposure can easily reach 14 or more hours per day, giving your eyes almost no recovery time during waking hours. Understanding the mechanics of digital eye strain is the first step toward systematically preventing it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" />
              The 20-20-20 Rule: Simple Science That Actually Works
            </h2>
            <p className="mb-3">
              The 20-20-20 rule is the most widely recommended intervention for digital eye strain, and for good reason. The rule is simple: every 20 minutes, look at something 20 feet away for at least 20 seconds. This brief shift in focal distance allows the ciliary muscles inside your eyes to relax from the sustained contraction required for near-focus screen work. Think of it as stretching a muscle that has been held in a single position for too long.
            </p>
            <p className="mb-3">
              A 2023 study published in Contact Lens and Anterior Eye confirmed that participants who followed the 20-20-20 rule reported significantly fewer symptoms of digital eye strain compared to a control group. The researchers noted improvements in dryness, blurred vision, and headache frequency within just two weeks of consistent practice. The mechanism is well understood: shifting your gaze to a distant object forces your focusing muscles to fully relax, restoring them to a neutral state before the next bout of near work.
            </p>
            <p className="mb-3">
              The practical challenge is remembering to do it. When you are deep in a coding session or drafting a document, 20 minutes evaporates without a conscious break. This is where timers become essential. A simple recurring alarm on your phone works, but dedicated break reminder applications are more effective because they can dim your screen or lock your computer briefly, making the break unavoidable rather than optional. The key is removing the decision from the moment. You should not be deciding whether to take a break. The system should decide for you.
            </p>
            <p>
              During your 20-second distance gaze, make a conscious effort to blink fully several times. A complete blink, where the upper lid touches the lower lid, spreads a fresh layer of tears across your cornea and resets the moisture barrier that screen use depletes. Combining distance gazing with deliberate blinking produces a compounding benefit that neither intervention achieves alone. It takes less than 30 seconds, costs nothing, and when practiced consistently across a workday, it can eliminate the majority of eye strain symptoms most remote workers experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-400" />
              Screen Brightness, Positioning, and Monitor Settings That Protect Your Eyes
            </h2>
            <p className="mb-3">
              Your monitor settings and physical positioning have an outsized impact on eye strain, yet most remote workers never adjust their defaults. The first principle is brightness matching. Your screen brightness should approximately match the brightness of your surrounding environment. If your screen is a glowing rectangle in a dim room, your pupils are constantly fighting between the bright display and the dark periphery. If your room is brightly lit but your screen is dim, your eyes strain to read low-contrast text. Hold a white sheet of paper next to your monitor. If the paper looks brighter, increase your screen brightness. If the screen looks brighter, decrease it.
            </p>
            <p className="mb-3">
              Screen distance matters more than most people realize. The standard recommendation is to position your monitor at arm's length, roughly 20 to 26 inches from your eyes. Closer than that forces your ciliary muscles into tighter contraction. Farther away can cause you to lean forward unconsciously, introducing neck strain alongside eye strain. The top of the screen should be at or slightly below eye level so you gaze slightly downward at the center of the display. This downward gaze angle reduces the exposed surface area of your eyes, slowing tear evaporation.
            </p>
            <p className="mb-3">
              Text size is another underutilized adjustment. If you find yourself leaning toward the screen or squinting, your text is too small. Increase your operating system's display scaling to 125 or 150 percent. In code editors, bump your font size to 14 or 16 points. There is no productivity award for reading 10-point font on a 27-inch monitor from two feet away. Larger text reduces the precision demand on your focusing system and decreases the rate at which eye fatigue accumulates throughout the day.
            </p>
            <p>
              Contrast and color temperature also play a role. High contrast between text and background is easier on the eyes than low contrast. Pure white backgrounds with black text create maximum contrast, which is good, but the sheer brightness of a white page can cause discomfort in dim environments. Many developers prefer dark mode for this reason, though the evidence on dark versus light mode is mixed. What matters most is that your chosen theme provides clear contrast and that your screen brightness matches your ambient light. Experiment with your monitor's contrast setting and color temperature controls until reading feels effortless rather than effortful.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-400" />
              Blue Light: Separating Fact From Marketing Hype
            </h2>
            <p className="mb-3">
              Blue light has become one of the most marketed health concerns in recent years, fueling a multi-billion-dollar industry of blue light blocking glasses, screen filters, and software solutions. The reality is considerably more nuanced than the marketing suggests. Understanding what blue light actually does, and what it does not do, will save you money and help you focus on interventions that genuinely reduce eye strain.
            </p>
            <p className="mb-3">
              Blue light is a portion of the visible light spectrum with wavelengths between approximately 380 and 500 nanometers. It is emitted by screens, LED lighting, and most abundantly by the sun. The amount of blue light emitted by a computer monitor at typical usage distance is a small fraction of what you receive during a brief walk outside on a cloudy day. The concern that screen-emitted blue light causes permanent retinal damage has not been substantiated by peer-reviewed research at exposure levels typical of normal computer use. A 2021 meta-analysis published in the journal Eye found no clinically significant evidence that blue light filtering lenses reduced symptoms of digital eye strain compared to placebo lenses.
            </p>
            <p className="mb-3">
              Where blue light does have a documented effect is on your circadian rhythm. Blue light suppresses melatonin production, the hormone that signals your body to prepare for sleep. Exposure to blue light from screens in the two to three hours before bedtime can delay sleep onset and reduce sleep quality. This is a real and well-established effect, but it is a sleep issue, not an eye strain issue. Night mode features like Apple's Night Shift or Windows Night Light that shift your screen to warmer tones in the evening are worth using for sleep hygiene, not because they protect your eyes from strain.
            </p>
            <p>
              The practical takeaway is to skip expensive blue light glasses if your only goal is reducing eye strain. Your money is better spent on a high-quality monitor with adjustable brightness, proper ambient lighting, and a good pair of prescription lenses if you need vision correction. If you want to protect your sleep, use your operating system's built-in night mode after sunset and limit screen use in the hour before bed. These free or low-cost interventions address the actual mechanisms of both digital eye strain and blue light's circadian effects far more effectively than any coated lens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-orange-400" />
              Home Office Lighting and Eye Exercises That Make a Difference
            </h2>
            <p className="mb-3">
              The lighting in your home office is arguably as important as your monitor settings for preventing eye strain, yet it receives far less attention. The goal is to create even, diffused ambient light that minimizes contrast between your screen and its surroundings. Overhead fluorescent lighting and bare bulbs create harsh glare, while working in a dark room with only your screen illuminated forces your eyes to manage an extreme brightness differential that accelerates fatigue.
            </p>
            <p className="mb-3">
              Position your desk so that windows are to the side rather than directly in front of or behind you. A window behind your monitor creates a bright background that competes with your screen. A window behind you reflects off the screen surface, creating glare. Side lighting provides ambient illumination without direct competition or reflection. If you cannot reposition your desk, use adjustable blinds or sheer curtains to diffuse incoming daylight. Adding a bias light, a soft LED strip placed behind your monitor, can reduce the perceived contrast between a bright screen and a dark wall, easing the strain on your eyes significantly.
            </p>
            <p className="mb-3">
              Eye exercises offer another layer of protection. The simplest and most effective is palming: rub your hands together for 10 seconds to warm them, then cup your palms over your closed eyes without pressing on the eyeballs. Hold for 30 seconds to a minute. The warmth and total darkness give your visual system a genuine rest. Another useful exercise is slow focus shifting: hold your thumb at arm's length, focus on it for five seconds, then shift your focus to an object across the room for five seconds. Repeat ten times. This exercise trains your focusing muscles to transition smoothly between near and far distances, reducing the stiffness that builds during hours of fixed-distance screen work.
            </p>
            <p>
              Circular eye movements also help. With your eyes closed, slowly roll your eyes in a full circle, five times clockwise and five times counterclockwise. This stretches the extraocular muscles that control eye movement and relieves the tension that accumulates from staring at a relatively small area of screen real estate all day. These exercises take less than two minutes combined and, when performed two to three times during a workday, produce a noticeable reduction in end-of-day eye fatigue. They pair naturally with your 20-20-20 breaks, adding just a few seconds to an already short routine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Glasses className="w-5 h-5 text-orange-400" />
              Computer Glasses, Break Timers, and Building a Sustainable System
            </h2>
            <p className="mb-3">
              If you have followed the advice above and still experience persistent eye strain, it may be time to visit an optometrist about computer glasses. Unlike blue light glasses, which are primarily a marketing product, computer glasses are prescription lenses optimized for the specific focal distance of your screen. Many people who have perfect distance vision or whose standard prescription is optimized for driving or general use find that a slight prescription adjustment for the 20-to-26-inch screen distance dramatically reduces strain. Progressive lens wearers in particular often benefit from a dedicated pair of single-vision computer glasses, as the intermediate zone of progressive lenses is typically narrow and forces unnatural head positioning.
            </p>
            <p className="mb-3">
              Tell your optometrist exactly how far your screen is from your eyes and how many hours per day you spend at the computer. Some practitioners offer occupational lens designs specifically for desk work that provide a wide field of clear vision at screen distance with a smaller zone for reading distance below. The difference between generic glasses and task-specific computer glasses can be the difference between ending your workday with fatigued, aching eyes and forgetting you were looking at a screen all day.
            </p>
            <p className="mb-3">
              The missing piece for most remote workers is not knowledge but consistency. You already know you should take breaks. You already know you should look away from the screen. The problem is that deep work, tight deadlines, and flow states override good intentions. This is where structured break timers move from nice-to-have to essential. A break timer that is integrated into your work rhythm, one that understands when you are in a focus session and when you need rest, removes the cognitive burden of self-monitoring and makes eye care automatic rather than aspirational.
            </p>
            <p>
              NomadBalance was designed with exactly this problem in mind. Rather than relying on willpower to remember the 20-20-20 rule or to step away from your screen, NomadBalance builds intelligent break intervals into your focus sessions. It prompts you to rest your eyes, shift your gaze, and move your body at the moments that matter most, between deep work blocks when your eyes and mind are most fatigued. By turning eye care into a system rather than a series of individual decisions, you protect your vision without sacrificing productivity. The best eye health habits are the ones you actually follow, and the ones you follow are the ones your tools enforce.
            </p>
          </section>

          <section className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Protect Your Eyes with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance builds 20-20-20 eye breaks and screen rest prompts directly into your focus sessions. Stop relying on willpower and let intelligent break scheduling protect your vision while you do your best work.
            </p>
            <Link to="/" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-white font-medium text-sm transition-colors">
              Get started for free
            </Link>
          </section>
        </div>
      </article>
    </div>
  );
}
