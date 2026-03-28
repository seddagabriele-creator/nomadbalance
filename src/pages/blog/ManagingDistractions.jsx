import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, ShieldOff, BellOff, Users, Smartphone, Brain, Target, CheckCircle } from "lucide-react";

export default function ManagingDistractions() {
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
        <h1 className="text-3xl font-extrabold mb-3">Managing Distractions When Working From Home</h1>
        <p className="text-white/40 text-sm mb-10">A comprehensive framework for identifying, categorizing, and systematically eliminating the distractions that erode your focus when your office is also your living room.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <ShieldOff className="w-5 h-5 text-violet-400" />
              External vs. Internal Distractions
            </h2>
            <p className="mb-3">
              Most people think of distractions as external events — a notification buzzing, a roommate talking, a delivery driver ringing the doorbell. These are real and disruptive, but they represent only half the problem. Internal distractions — the sudden urge to check your phone, the nagging thought about an unrelated task, the anxiety about an upcoming meeting, the daydream about dinner plans — are far more frequent and, in many ways, harder to manage because there is no off switch for your own mind.
            </p>
            <p className="mb-3">
              Research from the University of California, Irvine led by Gloria Mark found that people switch tasks an average of every three minutes during typical office work. Strikingly, about half of these interruptions are self-initiated. You are not only being distracted by the world around you — you are actively distracting yourself. This finding has profound implications for distraction management. Even if you could eliminate every external interruption, you would still face a constant stream of internally generated ones.
            </p>
            <p className="mb-3">
              Understanding this distinction changes your strategy entirely. External distractions require environmental solutions — turning off notifications, closing doors, wearing headphones. Internal distractions require psychological solutions — managing anxiety, building focus habits, creating systems that capture stray thoughts so your brain can let them go.
            </p>
            <p>
              The most effective distraction management approach addresses both simultaneously. You design your environment to minimize external interruptions while also training your mind to resist internal ones. Neither strategy alone is sufficient. An impeccably quiet room will not help if your mind is racing, and the strongest focus skills will crumble if your phone buzzes every 45 seconds.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <BellOff className="w-5 h-5 text-violet-400" />
              Notification Management: The First Line of Defense
            </h2>
            <p className="mb-3">
              Notifications are engineered to capture your attention. Every app on your phone and computer is competing for a slice of your consciousness, and their designers are very good at winning that competition. The default state of most devices — everything notifying you about everything — is optimized for engagement, not for your productivity or wellbeing.
            </p>
            <p className="mb-3">
              The first step is a complete notification audit. Go through every app on your phone and computer and ask: "Does this need to interrupt me in real time?" For most apps, the answer is no. Email does not require instant responses. Slack messages can wait 30 minutes. Social media notifications should be disabled entirely during work hours. The only notifications that arguably merit real-time delivery are calendar alerts, phone calls from specific contacts, and genuinely urgent communication channels.
            </p>
            <p className="mb-3">
              Beyond disabling individual notifications, consider using system-level tools. Most operating systems now include focus modes or do-not-disturb schedules that can be automated. Set up a "Deep Work" mode that activates during your morning focus block and silences everything except calls from family members. Set up a "Communication" mode for your email and Slack windows. The goal is to make the right behavior the default behavior during each part of your day.
            </p>
            <p>
              A surprisingly effective technique is to remove your email client and Slack from your phone entirely, accessing them only through your computer during designated communication blocks. This eliminates the possibility of "just quickly checking" during a break or while walking to the kitchen. That quick check is never quick — research shows it takes an average of 23 minutes to regain the same level of focus you had before the interruption.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Setting Boundaries with Family and Roommates
            </h2>
            <p className="mb-3">
              When you work from home, the people you live with become the most significant source of external interruptions. This is not because they are inconsiderate — it is because the visual cue of you being physically present at home naturally invites interaction. In an office, colleagues understand that you are working because the environment signals it. At home, that signal does not exist unless you deliberately create it.
            </p>
            <p className="mb-3">
              The foundation of good boundaries is a clear, specific conversation. Vague requests like "please don't bother me while I'm working" are ineffective because they lack specificity. Instead, define exactly when you are available and when you are not. For example: "From 9 AM to 11 AM, I am in a focus session and should not be interrupted unless there is an emergency. From 11 to 11:30, I am on break and happy to chat. From 11:30 to 1 PM, I am back in focus mode." This clarity removes ambiguity and reduces the guilt that comes with setting boundaries.
            </p>
            <p className="mb-3">
              Reinforce verbal agreements with visual signals. A closed door is the most obvious one, but not everyone has a room with a door. Alternatives include wearing a specific pair of headphones (visible noise-cancelling headphones are an excellent signal), placing a small sign on your desk, or using a desk lamp that is only on during focus sessions. The key is that the signal is visible, consistent, and mutually understood.
            </p>
            <p>
              If you have children at home, the strategies need to be age-appropriate. Young children cannot be expected to respect abstract focus boundaries. In these cases, coordinating focus sessions with a partner's availability, a caregiver's schedule, or nap times is essential. It is far better to have two uninterrupted hours than to attempt eight hours of intermittently interrupted work. Quality of focus time matters more than quantity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-violet-400" />
              Digital Minimalism for the Work-From-Home Professional
            </h2>
            <p className="mb-3">
              Digital minimalism, a concept popularized by Cal Newport, is a philosophy of technology use in which you carefully curate the digital tools in your life to support the things you value and eliminate those that do not. For remote workers, this is not a lifestyle choice — it is a professional necessity. Every app, website, and digital service is a potential distraction pipeline, and the cumulative effect of dozens of such pipelines running simultaneously is cognitive chaos.
            </p>
            <p className="mb-3">
              Start by evaluating every app and service you use regularly. For each one, ask three questions. First, does this tool directly support work that I am paid to do? Second, is there a less distracting alternative that provides the same benefit? Third, can I restrict my use of this tool to specific times without losing its value? If a tool fails all three tests, it is a candidate for removal.
            </p>
            <p className="mb-3">
              One powerful practice is the single-tab rule: during focus sessions, have only one browser tab open at a time. This sounds extreme, but it eliminates the visual clutter that invites tab-switching and forces you to deliberately open and close resources as needed rather than maintaining a passive buffet of potential distractions. Browser extensions that limit the number of open tabs can enforce this automatically.
            </p>
            <p>
              Another effective approach is to use separate browser profiles for work and personal use. Your work profile contains only work-related bookmarks, extensions, and logged-in accounts. Your personal profile contains everything else. During work hours, you use the work profile exclusively. This simple separation reduces the temptation to drift from a work task to a personal website because the personal sites are not visible, bookmarked, or logged in within your work browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              The Attention Residue Problem
            </h2>
            <p className="mb-3">
              Perhaps the most insidious effect of distraction is not the interruption itself but what it leaves behind. Sophie Leroy, a professor at the University of Washington, coined the term "attention residue" to describe the cognitive phenomenon where part of your attention remains stuck on a previous task even after you have switched to a new one. When you glance at an email notification during a focus session, you do not simply lose the five seconds it takes to read the subject line. You lose the next five to fifteen minutes as your brain continues to process and worry about the email while you try to refocus on your original task.
            </p>
            <p className="mb-3">
              Leroy's research found that attention residue is thickest when the previous task was left incomplete or when it involved an unresolved decision. This explains why half-read emails and partially answered Slack threads are so destructive to focus — they create open loops that your brain keeps trying to close in the background, consuming working memory and reducing the cognitive resources available for your primary task.
            </p>
            <p className="mb-4">
              To minimize attention residue, adopt these practices:
            </p>
            <ul className="space-y-2 pl-4 mb-4">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Complete tasks before switching</strong> — whenever possible, finish what you are working on before moving to the next thing. Partial completion creates the strongest residue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Write down intrusive thoughts</strong> — keep a notepad beside your keyboard. When a stray thought or worry arises during a focus session, write it down and return to your task. The act of externalizing the thought releases your brain from the obligation to remember it.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Create shutdown rituals</strong> — before transitioning between tasks, spend 60 seconds reviewing what you accomplished and what the next step is. This gives your brain a sense of completion that reduces residue.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Never "peek" at communication channels</strong> — a quick glance at email or Slack creates residue without resolving anything. Either process your messages fully during a communication block or do not look at them at all.</span>
              </li>
            </ul>
            <p>
              Understanding attention residue changes how you think about distractions. The cost of an interruption is not the time the interruption takes — it is the time the interruption takes plus the recovery time that follows. A 10-second notification can easily cost you 15 minutes of impaired focus. When you multiply that across the dozens of interruptions in a typical day, the cumulative cost is staggering.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Designing Your Day Around Focus, Not Around Distractions
            </h2>
            <p className="mb-3">
              Most people design their workday around communication and then try to squeeze focus work into the gaps. This is backward. The highest-value work you do — the work that advances projects, generates ideas, and develops your skills — requires uninterrupted focus. Communication and coordination, while necessary, are support activities that serve the focused work.
            </p>
            <p className="mb-3">
              Flip the hierarchy. Plan your focus blocks first, then schedule communication around them. If you know you need three hours of deep focus daily, block those hours first thing in the morning (when willpower and cognitive resources are highest for most people) and schedule all meetings, calls, and email processing for the afternoon. This structure ensures that your best hours are spent on your best work, not on responding to other people's priorities.
            </p>
            <p className="mb-3">
              Communicate your schedule proactively. Post your availability in your team's communication channel. Set an auto-responder on email that says "I check email at 11 AM, 2 PM, and 4 PM. If this is urgent, call me." Update your calendar to show focus blocks as busy. Most colleagues will respect your boundaries once they understand them, especially if you are reliably responsive during your communication windows.
            </p>
            <p>
              The endgame is a workday that feels intentional rather than reactive. Instead of waking up and immediately checking what the world demands of you, you wake up knowing exactly what you will focus on and when. This sense of agency reduces stress, increases output, and paradoxically gives you more time for rest and personal life because you accomplish more in fewer hours.
            </p>
          </section>

          <section className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Take Control of Your Focus with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance helps you structure your day around focus sessions with customizable timers, binaural beats that block distracting sounds, and active break scheduling that ensures you recover properly between deep work blocks. Stop reacting to distractions and start designing your day for depth.
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