import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Bone, Activity, StretchHorizontal, Monitor, Stethoscope, Dumbbell, CheckCircle } from "lucide-react";

export default function BackPainSittingAllDay() {
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
        <h1 className="text-3xl font-extrabold mb-3">Back Pain From Sitting All Day? Here's What Actually Helps</h1>
        <p className="text-white/40 text-sm mb-10">An evidence-based guide to understanding why desk work causes back pain and the specific exercises, habits, and ergonomic changes that provide real relief.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bone className="w-5 h-5 text-orange-400" />
              Why Sitting Causes Back Pain: The Biomechanics
            </h2>
            <p className="mb-3">
              Your spine was not designed for sitting. From an evolutionary perspective, the human body is optimized for two primary positions: standing upright and lying down. Sitting, particularly the kind of prolonged, static sitting that desk work demands, places your spine in a compromised position that accumulates damage over hours, days, and years. Understanding the biomechanics of this damage is the first step toward reversing it.
            </p>
            <p className="mb-3">
              When you sit, the natural curve of your lumbar spine — the inward curve of your lower back — tends to flatten or reverse. This happens because most people slouch forward, rounding their back, which shifts the load-bearing from the spine's natural shock-absorbing curves to the intervertebral discs and ligaments. Research published in the journal Spine found that intradiscal pressure in the lumbar region increases by approximately 40 percent when sitting compared to standing. When you add forward lean — reaching toward a keyboard and screen — that pressure increases further, approaching levels that accelerate disc degeneration over time.
            </p>
            <p className="mb-3">
              Muscle imbalance is the second major factor. Sitting for eight or more hours daily causes your hip flexors — the muscles at the front of your hips — to shorten and tighten. Simultaneously, your gluteal muscles weaken from disuse, a condition physiotherapists call "gluteal amnesia." These shortened hip flexors pull your pelvis forward into an anterior tilt, which exaggerates the lumbar curve when you stand and compresses the facet joints in your lower back. The result is a cycle: sitting weakens the muscles that should protect your back, which makes your back more vulnerable to pain, which makes you less inclined to move, which further weakens those muscles.
            </p>
            <p>
              The third mechanism is reduced blood flow. Prolonged static posture restricts circulation to the spinal discs, which rely on movement-driven osmosis for nutrient delivery because they lack a direct blood supply. Without regular position changes, disc tissue becomes dehydrated and less resilient, making it more susceptible to bulging or herniation. This is why back pain often worsens throughout the day — your discs are literally drying out from hours of immobility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-400" />
              Immediate Relief: Exercises You Can Do Right Now
            </h2>
            <p className="mb-3">
              If you are reading this with an aching lower back, these five movements can provide relief within minutes. They work by reversing the positions and patterns that caused the pain: opening the hip flexors, activating the glutes, and restoring the natural lumbar curve. Perform each one gently and stop if any movement increases your pain.
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">1. Standing Lumbar Extension</p>
                <p className="text-white/50 text-xs">Stand up, place your hands on your lower back, and gently arch backward. Hold for two seconds, return to neutral, and repeat ten times. This movement, recommended by the McKenzie Method, reverses the flexion loading that sitting creates. Many people feel immediate relief after the first set. Perform this every 30 to 60 minutes during your workday.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">2. Cat-Cow Stretch</p>
                <p className="text-white/50 text-xs">On your hands and knees, alternate between arching your back toward the ceiling (cat) and dropping your belly toward the floor while lifting your head (cow). Move slowly through ten repetitions, coordinating each movement with your breath. This mobilizes the entire spine and restores fluid circulation to the intervertebral discs.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">3. Hip Flexor Stretch (Half-Kneeling)</p>
                <p className="text-white/50 text-xs">Kneel on one knee with the other foot flat on the floor in front of you, forming a 90-degree angle at both knees. Gently push your hips forward until you feel a stretch at the front of the kneeling leg's hip. Hold for 30 seconds per side. This directly targets the shortened hip flexors that contribute to lower back compression.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">4. Glute Bridge</p>
                <p className="text-white/50 text-xs">Lie on your back with knees bent and feet flat on the floor. Squeeze your glutes and lift your hips toward the ceiling, creating a straight line from your knees to your shoulders. Hold for five seconds at the top, then lower. Perform ten repetitions. This activates the gluteal muscles that sitting has deactivated, restoring the muscular support your lower back needs.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">5. Child's Pose</p>
                <p className="text-white/50 text-xs">Kneel on the floor, sit back on your heels, and reach your arms forward along the floor while lowering your chest toward your knees. Hold for 30 to 60 seconds, breathing deeply. This gently stretches the lower back muscles and paraspinal muscles that tighten during extended sitting. It also activates the parasympathetic nervous system, reducing the muscle tension that accompanies stress-related back pain.</p>
              </div>
            </div>
            <p>
              Perform this entire sequence once in the morning, once midday, and once in the evening. The total investment is about eight minutes per session. Within a week of consistent practice, most people report a significant reduction in daily back pain. These are not one-time fixes — they are maintenance movements that counteract the ongoing stress of desk work.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-400" />
              Ergonomic Fixes That Make a Real Difference
            </h2>
            <p className="mb-3">
              Exercise alone cannot overcome eight hours of poor ergonomics. Your workstation setup determines the baseline load on your spine for the entire day, and even small adjustments can dramatically reduce the cumulative strain. You do not need to spend thousands on a premium ergonomic setup — the most impactful changes are about position, not equipment.
            </p>
            <p className="mb-4">
              The essential ergonomic adjustments for back pain prevention:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Monitor height</strong> — the top of your screen should be at or slightly below eye level, positioned approximately an arm's length away; this prevents the forward head posture that cascades into upper and lower back strain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Chair height</strong> — your feet should be flat on the floor with thighs parallel to the ground; if your chair is too high, use a footrest; if too low, sit on a cushion or adjust the seat height</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Lumbar support</strong> — your lower back should maintain its natural inward curve; if your chair lacks lumbar support, a rolled towel or small cushion placed at the belt line provides effective support at zero cost</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Keyboard and mouse position</strong> — your elbows should be at approximately 90 degrees with your forearms parallel to the floor; reaching forward for your keyboard rounds your shoulders and upper back</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Sit-stand desk option</strong> — alternating between sitting and standing every 30 to 60 minutes is more beneficial than either sitting all day or standing all day; even a simple laptop riser that lets you work standing at a counter provides this variability</span>
              </li>
            </ul>
            <p>
              A critical point that most ergonomic advice misses: the best posture is your next posture. No single sitting position, no matter how ergonomically perfect, should be maintained for hours. Your body needs variety. Shift your weight, cross and uncross your legs, lean back, lean forward, stand up, sit back down. The damage comes from static loading — holding any one position long enough for tissues to adapt and stiffen. Movement variety throughout the day is more important than finding the single "correct" sitting position.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-400" />
              Long-Term Prevention: Building a Resilient Back
            </h2>
            <p className="mb-3">
              Short-term relief from stretching and ergonomic adjustments is valuable, but lasting freedom from back pain requires building the muscular strength and endurance that protect your spine under load. Research consistently shows that exercise is the most effective long-term intervention for chronic low back pain — more effective than medication, manual therapy, or ergonomic interventions alone.
            </p>
            <p className="mb-3">
              The muscles that matter most for back pain prevention are the deep core stabilizers: the transverse abdominis, the multifidus, and the pelvic floor muscles. Unlike the rectus abdominis — the "six-pack" muscle — these deep stabilizers act as a natural corset around your spine, providing stability during all movements. Research from the University of Queensland found that people with chronic back pain show delayed activation of these muscles, and that specific retraining of these muscles reduces pain recurrence by over 30 percent compared to general exercise.
            </p>
            <p className="mb-3">
              Dr. Stuart McGill, a leading spine biomechanics researcher, recommends three foundational exercises that he calls the "Big Three." These exercises are designed to build spinal stability while minimizing spinal load: the curl-up (a modified crunch that keeps the spine neutral), the side plank (which builds lateral stability), and the bird-dog (which trains coordinated core stability with limb movement). Performing these three exercises daily takes approximately ten minutes and creates a foundation of spinal resilience that protects you throughout the day.
            </p>
            <p className="mb-3">
              Beyond targeted core work, general physical activity is profoundly protective. Walking 30 minutes daily reduces back pain incidence by up to 50 percent according to a meta-analysis published in the British Journal of Sports Medicine. Walking gently loads and unloads the spinal discs in a rhythmic pattern that promotes hydration and nutrient delivery — exactly the opposite of what static sitting does. For remote workers, a daily walk is not just exercise; it is spinal maintenance.
            </p>
            <p>
              Resistance training that includes deadlifts, squats, and rows — performed with proper form and appropriate weight — builds the posterior chain muscles that directly counteract the postural consequences of desk work. If you are new to strength training, even bodyweight versions of these movements provide significant benefit. The key is consistency: three sessions per week of 20 to 30 minutes produces meaningful changes in muscle strength and back pain within six to eight weeks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <StretchHorizontal className="w-5 h-5 text-orange-400" />
              A Daily Stretching Routine for Desk Workers
            </h2>
            <p className="mb-3">
              This ten-minute routine is designed specifically for people who sit at a desk for extended periods. Perform it once in the morning before work and once in the afternoon. Each movement targets the muscle groups most affected by prolonged sitting.
            </p>
            <p className="mb-3">
              Start with 60 seconds of standing marches to warm up your hips and get blood flowing. Then spend 30 seconds per side on a standing quad stretch, pulling your heel toward your glute to open the front of your thigh and hip flexor. Follow this with a 30-second forward fold — standing with feet hip-width apart, hinging at the hips to reach toward the floor — which stretches the hamstrings and decompresses the lower spine.
            </p>
            <p className="mb-3">
              Next, perform a thoracic spine rotation: sit on the edge of your chair, cross your arms over your chest, and rotate your upper body to the left and right, holding each side for 15 seconds. This targets the mid-back stiffness that develops from hunching over a keyboard. Follow with a doorway chest stretch — stand in a doorway with your forearms on the frame and lean forward gently for 30 seconds — which opens the chest muscles that tighten from reaching forward to type.
            </p>
            <p className="mb-3">
              Finish with a 60-second prone press-up: lie face-down, place your hands under your shoulders, and press your upper body up while keeping your hips on the floor. This is the single most effective movement for counteracting the flexion loading that sitting produces. Hold the top position for two seconds, lower, and repeat ten times.
            </p>
            <p>
              Consistency matters far more than duration or intensity. A ten-minute routine performed every day delivers dramatically better results than an hour-long session performed sporadically. Set a recurring calendar reminder or use an app with movement break prompts to ensure you never skip a day. Within two to three weeks, you will notice that your baseline pain level has decreased and your tolerance for sitting has increased.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-orange-400" />
              When to See a Doctor
            </h2>
            <p className="mb-3">
              Most sitting-related back pain is mechanical — caused by muscle imbalance, disc compression, and poor posture — and responds well to the exercise and ergonomic interventions described above. However, certain symptoms indicate a more serious underlying condition that requires professional evaluation. Knowing these red flags can prevent you from ignoring a problem that needs medical attention.
            </p>
            <p className="mb-4">
              Seek medical evaluation if you experience any of the following:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Radiating pain down your leg</strong> — pain, numbness, or tingling that travels from your back down into your buttock, thigh, or foot may indicate nerve compression from a herniated disc or spinal stenosis</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Weakness in your legs or feet</strong> — difficulty lifting your foot, stumbling, or a feeling of leg instability suggests nerve involvement that requires urgent assessment</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Loss of bladder or bowel control</strong> — this is a medical emergency called cauda equina syndrome that requires immediate emergency department evaluation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Pain that worsens at night or at rest</strong> — mechanical pain typically improves with rest; pain that worsens when lying down may indicate an inflammatory or systemic cause</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Pain lasting more than six weeks without improvement</strong> — if consistent stretching, exercise, and ergonomic changes have not reduced your pain after six weeks, a physiotherapist or physician can identify specific structural issues and prescribe targeted treatment</span>
              </li>
            </ul>
            <p>
              For the majority of desk-related back pain, a physiotherapist is the most effective first point of contact. They can assess your specific movement patterns, identify which muscles are weak or tight, and prescribe a personalized exercise program. A good physiotherapist will also evaluate your workstation setup and suggest modifications tailored to your body and your equipment. Most people see significant improvement within four to six weeks of following a physiotherapy-guided program.
            </p>
          </section>

          <section className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Keep Your Back Healthy with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance schedules active movement breaks throughout your workday, guiding you through stretches and exercises designed to counteract the effects of prolonged sitting. Set your break interval, follow along with guided movements, and build the daily habit that prevents back pain before it starts.
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
