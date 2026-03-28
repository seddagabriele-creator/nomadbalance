import React from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Monitor, Armchair, Mouse, Laptop, Sun, DollarSign, CheckCircle } from "lucide-react";

export default function ErgonomicSetup() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO title="Setting Up an Ergonomic Home Office on Any Budget" description="From expensive standing desks to free posture hacks — how to protect your body at any price point." />
      <nav className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">NomadBalance</span>
        </Link>
        <Link to="/blog" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">Movement</span>
          <span className="text-white/30 text-xs">12 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">Setting Up an Ergonomic Home Office on Any Budget</h1>
        <p className="text-white/40 text-sm mb-10">You do not need to spend thousands on a perfect setup. From zero-cost adjustments to smart investments, here is how to protect your body while working from home.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-orange-400" />
              Monitor Height and Distance: The Foundation of Ergonomics
            </h2>
            <p className="mb-3">
              The single most impactful ergonomic adjustment you can make costs nothing and takes 30 seconds. It is getting your screen at the right height. When your monitor is too low, which is the default for every laptop and most desk setups, you tilt your head forward and down to look at it. This forward head posture adds roughly 10 pounds of effective weight to your head for every inch it moves forward from neutral alignment.
            </p>
            <p className="mb-3">
              The average human head weighs about 11 pounds when balanced directly over the spine. At a 15-degree forward tilt, common when looking down at a laptop on a desk, the effective load on your cervical spine increases to 27 pounds. At 30 degrees, it jumps to 40 pounds. At 45 degrees, the angle many people adopt when hunched over a laptop on a low table or couch, your neck muscles are supporting 49 pounds of force. Sustaining this load for eight hours a day, five days a week, is the primary cause of the chronic neck and upper back pain that plagues remote workers.
            </p>
            <p className="mb-3">
              The correct monitor position places the top of the screen at or slightly below eye level when you are sitting upright. Your eyes should naturally rest on the upper third of the display. The screen should be approximately an arm's length away, roughly 50 to 70 centimeters. At this distance, you can read standard text without leaning forward, and your eyes do not have to work as hard to focus, reducing digital eye strain.
            </p>
            <p>
              If you use a laptop without an external monitor, the simplest fix is a stack of books. Measure the height you need by sitting upright and noting where your eyes naturally rest, then stack books or boxes under your laptop until the screen reaches that height. This immediately necessitates an external keyboard and mouse since your laptop keyboard will now be too high to type on comfortably, but even a basic 15-dollar keyboard and mouse set is a worthwhile investment for the postural improvement you gain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Armchair className="w-5 h-5 text-orange-400" />
              Chair Alternatives: Finding What Supports Your Body
            </h2>
            <p className="mb-3">
              The office chair industry would have you believe that the only path to ergonomic comfort is an 800-dollar task chair with lumbar adjustment, tilt tension, and synchronized armrests. While a good chair is genuinely valuable for people who sit for extended periods, it is not the only option, and it is certainly not the first thing you should spend money on.
            </p>
            <p className="mb-3">
              The most important principle of seated ergonomics is not finding the perfect chair. It is maintaining a neutral spine position and changing positions frequently. A neutral spine has three natural curves: a slight forward curve in the lower back (lumbar lordosis), a slight backward curve in the mid-back (thoracic kyphosis), and a slight forward curve in the neck (cervical lordosis). Any chair that allows you to maintain these natural curves while keeping your feet flat on the floor and your thighs roughly parallel to the ground is functional.
            </p>
            <p className="mb-4">
              Several alternatives to the traditional office chair deserve consideration:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">A firm dining chair with a cushion.</strong> Many dining chairs provide better postural support than cheap office chairs because they have flat seats and upright backs. Add a rolled towel behind your lower back for lumbar support and a cushion for seat comfort.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">An exercise ball (used in rotation).</strong> Sitting on a stability ball engages core muscles and promotes active sitting. It should not be your only seat because extended use causes fatigue, but alternating between a ball and a chair throughout the day provides variety and core engagement.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">A kneeling chair.</strong> These chairs tilt your pelvis forward, naturally encouraging lumbar lordosis without back support. They distribute weight between your shins and sit bones, reducing spinal compression. Available for as little as 60 dollars and excellent for people with lower back issues.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Floor sitting with cushions.</strong> Cross-legged sitting on a meditation cushion or zafu is a valid option for shorter work sessions. It promotes hip flexibility and core engagement. Alternate with other seating options throughout the day for variety.</span>
              </li>
            </ul>
            <p>
              The best seating strategy is not finding one perfect chair but having two or three different seating options and rotating between them throughout the day. Each position loads your body differently, preventing the cumulative strain that comes from maintaining any single posture for hours. Even an expensive ergonomic chair becomes a health liability if you never leave it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mouse className="w-5 h-5 text-orange-400" />
              Keyboard and Mouse Positioning: Protecting Your Wrists
            </h2>
            <p className="mb-3">
              Repetitive strain injuries affecting the wrists, hands, and forearms are among the most common occupational hazards for remote knowledge workers. Carpal tunnel syndrome, tendinitis, and de Quervain's tenosynovitis can develop insidiously over months of poor positioning and become chronic conditions that significantly impact your ability to work.
            </p>
            <p className="mb-3">
              Proper keyboard positioning starts with your elbows. When typing, your elbows should be bent at approximately 90 degrees, close to your body rather than flared out to the sides. Your forearms should be roughly parallel to the floor or angled very slightly downward. Your wrists should be in a neutral position, meaning they are not bent upward (extension), downward (flexion), or sideways in either direction. The keyboard should be at a height where you can maintain this neutral wrist position without hunching your shoulders up or reaching your arms forward.
            </p>
            <p className="mb-3">
              Most desk surfaces are too high for proper keyboard positioning if you are of average or below-average height. If your desk puts the keyboard at or above elbow height when you sit upright, your wrists will be forced into extension. A keyboard tray that mounts below the desk surface is one of the most cost-effective ergonomic investments you can make, typically running 25 to 60 dollars. Alternatively, raising your chair height and using a footrest to support your feet can achieve the same result.
            </p>
            <p className="mb-3">
              Mouse positioning is equally important and often overlooked. Your mouse should be at the same height as your keyboard and close enough that you do not have to reach for it. Extending your arm repeatedly to a mouse that is too far away or too high strains the shoulder and forearm muscles. A vertical mouse, which positions your hand in a handshake orientation rather than palm-down, reduces the pronation strain that contributes to carpal tunnel syndrome. Vertical mice are available for as little as 15 dollars and many users report immediate relief from wrist discomfort upon switching.
            </p>
            <p>
              Regardless of your equipment, take micro-breaks from typing and mousing every 20 to 30 minutes. Shake your hands out, make gentle fists and release them, and rotate your wrists in circles. These 10-second interventions interrupt the repetitive loading pattern that causes injury. Prevention is infinitely easier than treatment when it comes to repetitive strain injuries, and the habits you build now will protect your career longevity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Laptop className="w-5 h-5 text-orange-400" />
              Laptop Risers and DIY Standing Desk Options
            </h2>
            <p className="mb-3">
              If you primarily use a laptop, a riser is arguably the single best ergonomic investment you can make. It elevates your screen to the correct height and, when combined with an external keyboard and mouse, transforms your laptop into an ergonomically sound workstation. Commercial laptop risers range from 20 to 80 dollars, but effective alternatives can be built from materials you likely already have.
            </p>
            <p className="mb-3">
              A stack of hardcover books, a sturdy box, or even a small shelf placed on your desk works perfectly well. The ideal riser raises your laptop screen by 15 to 25 centimeters, depending on your height and desk surface. Adjustability is nice but not essential. Find the height that puts the top of your screen at eye level, build or buy something that achieves that height, and you are done.
            </p>
            <p className="mb-3">
              For standing desk alternatives, creativity goes a long way before money needs to. A high kitchen counter or bar-height table can serve as a standing workstation. A sturdy bookshelf with a cleared shelf at the right height works well. Some remote workers use an ironing board adjusted to standing height as a remarkably functional temporary standing desk. These solutions cost nothing and allow you to experiment with standing work before committing to a dedicated standing desk purchase.
            </p>
            <p>
              If you decide to invest in a standing desk, the most versatile option is an electric sit-stand desk with programmable height presets. These allow you to switch between sitting and standing positions with the press of a button, dramatically increasing the likelihood that you will actually alternate positions throughout the day. Prices have come down significantly, with reliable options available from 250 to 400 dollars. A more budget-friendly option is a desk converter that sits on top of your existing desk and raises your keyboard and monitor to standing height, available from 100 to 200 dollars. Both approaches are valid, and either is a worthwhile investment if you plan to work from home long-term.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-orange-400" />
              Lighting: The Ergonomic Factor Nobody Talks About
            </h2>
            <p className="mb-3">
              When people think about ergonomics, they think about chairs and desks. Lighting is rarely mentioned, yet it has a profound impact on eye strain, headaches, energy levels, and even posture. Poor lighting forces you to lean forward to see your screen clearly, undermining all the postural improvements you have made with your chair and monitor setup.
            </p>
            <p className="mb-3">
              The ideal lighting setup for computer work avoids two extremes: too much light falling directly on the screen, which causes glare and forces you to squint, and too little ambient light, which creates excessive contrast between the bright screen and dark surroundings, straining your eyes.
            </p>
            <p className="mb-3">
              Position your desk so that natural light comes from the side rather than from behind or in front of you. Light from behind creates screen glare. Light from directly in front means you are facing a window and squinting against the brightness. Side lighting provides even illumination without glare. If you cannot control window position, adjustable blinds or a sheer curtain can diffuse harsh direct light.
            </p>
            <p className="mb-3">
              For artificial lighting, bias lighting is one of the best investments you can make for your eyes. This is a soft light placed behind your monitor that illuminates the wall behind the screen, reducing the contrast between the bright display and the dark background. A simple LED strip attached to the back of your monitor, available for five to fifteen dollars, can significantly reduce eye fatigue during long work sessions. Choose a strip with adjustable color temperature and set it to match your screen's white balance.
            </p>
            <p>
              Overhead lighting should be indirect or diffused rather than harsh and direct. If your home office has a single ceiling light with a bare bulb or a downward-facing fixture, consider replacing the bulb with a softer, lower-wattage option or adding a desk lamp that provides focused task lighting without creating harsh shadows. The goal is even, comfortable illumination that allows you to see your screen, your keyboard, and any documents without straining or squinting. Good lighting is invisible when it is working correctly. You only notice it when it is wrong.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-orange-400" />
              Budget Tiers: Ergonomic Upgrades at Every Price Point
            </h2>
            <p className="mb-4">
              Not everyone can invest hundreds of dollars in office equipment immediately. Here are ergonomic improvement plans organized by budget, each delivering meaningful improvements at its price point:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">$0 - Zero Cost Adjustments</p>
                <p className="text-white/50 text-xs mb-2">Stack books under your laptop to raise the screen to eye level. Roll a towel and place it behind your lower back for lumbar support. Use a box or stack of books as a footrest if your chair is too high. Position your desk to get side-lighting from windows. Set a timer to remind yourself to stand and stretch every 30 minutes. These free changes address the most critical ergonomic issues.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">$50 - Essential Starter Kit</p>
                <p className="text-white/50 text-xs mb-2">External keyboard ($15) and mouse ($10) to use with your elevated laptop. A seat cushion ($15) for your existing chair. An LED bias light strip for behind your monitor ($10). These four items transform a basic desk setup into a functionally ergonomic workstation. This is where the cost-to-benefit ratio is highest.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">$200 - Meaningful Upgrade</p>
                <p className="text-white/50 text-xs mb-2">Everything from the $50 tier, plus a dedicated laptop riser or monitor arm ($30-50). A keyboard tray ($30-50). A standing desk converter ($100-150) that sits on your existing desk. At this level, you have a setup that supports both sitting and standing throughout the day with proper positioning in both orientations.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">$500+ - Professional Setup</p>
                <p className="text-white/50 text-xs mb-2">Electric sit-stand desk ($300-400). An ergonomic task chair with adjustable lumbar, seat depth, and armrests ($150-300 used, $400+ new). An external monitor at the correct height ($150+). Ergonomic keyboard and vertical mouse ($60-100 combined). Anti-fatigue standing mat ($30). This is a complete professional workspace that rivals any corporate office setup.</p>
              </div>
            </div>
            <p>
              Start with the zero-cost tier today. The free adjustments alone will make a noticeable difference within a week. As your budget allows, progress through the tiers, prioritizing the items that address your specific pain points. If you have neck pain, the monitor height and laptop riser should be your first investment. If you have wrist discomfort, prioritize the keyboard tray and ergonomic mouse. If you have lower back pain, the chair upgrade is most important. Target your spending at the source of your greatest discomfort and build from there.
            </p>
          </section>

          <section className="bg-gradient-to-br from-orange-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Work Smarter with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance reminds you to adjust your posture, alternate between sitting and standing, and take ergonomic breaks throughout your workday. Build habits that protect your body for the long term.
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
