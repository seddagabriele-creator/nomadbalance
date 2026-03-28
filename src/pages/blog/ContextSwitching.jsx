import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Shuffle, Brain, Clock, Layers, MessageSquare, CheckCircle, Target } from "lucide-react";

export default function ContextSwitching() {
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
          <span className="text-white/30 text-xs">7 min read</span>
        </div>
        <h1 className="text-3xl font-extrabold mb-3">The Hidden Cost of Context Switching for Remote Workers</h1>
        <p className="text-white/40 text-sm mb-10">Research shows it takes 23 minutes to refocus after an interruption. Here's how to minimize switching.</p>

        <div className="space-y-10 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shuffle className="w-5 h-5 text-violet-400" />
              What Context Switching Actually Costs You
            </h2>
            <p className="mb-3">
              Context switching — the act of shifting your attention from one task or project to another — is one of the most expensive habits in knowledge work, and one of the least visible. Unlike wasted time in meetings, which is at least measurable, the cost of context switching hides in the gaps between tasks, in the minutes you spend reorienting after each interruption, and in the diminished quality of work you produce while your attention is fragmented.
            </p>
            <p className="mb-3">
              The landmark research on this topic comes from Gloria Mark, a professor of informatics at the University of California, Irvine. In a series of studies spanning more than a decade, Mark and her colleagues observed knowledge workers in their natural environments, tracking every task switch, interruption, and recovery period. Their findings are striking: the average knowledge worker is interrupted or switches tasks every 3 minutes and 5 seconds during their workday. After each interruption, it takes an average of 23 minutes and 15 seconds to return to the same level of focus on the original task.
            </p>
            <p>
              Consider what these numbers mean in practice. If you switch tasks ten times in a morning (a conservative estimate for most remote workers juggling Slack, email, code, and meetings), you lose approximately four hours of productive time — not because you are idle, but because you are operating at reduced cognitive capacity while your brain repeatedly reloads context. You feel busy, you are at your desk, you are typing — but the quality and speed of your output is a fraction of what it would be during sustained, uninterrupted focus. This is the hidden cost: it looks like work, but it produces far less value.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              Attention Residue and the Multitasking Myth
            </h2>
            <p className="mb-3">
              The cognitive mechanism behind the cost of context switching is what Sophie Leroy calls "attention residue." When you move from Task A to Task B, your brain does not instantly and completely disengage from Task A. Part of your cognitive resources remain allocated to the previous task — especially if it was incomplete, complex, or emotionally engaging. This residue occupies working memory slots that would otherwise be available for Task B, reducing your effective intelligence and creative capacity.
            </p>
            <p className="mb-3">
              Leroy's research, published in <em>Organizational Behavior and Human Decision Processes</em>, demonstrated that attention residue is not just a subjective feeling of being scattered. Participants who switched between tasks without completing the first one performed measurably worse on cognitive tests than those who finished one task before starting another. The performance deficit was significant and consistent across different types of tasks.
            </p>
            <p className="mb-3">
              This finding directly contradicts the popular belief in multitasking. What people call multitasking is almost always rapid context switching — jumping between tasks so quickly that it feels simultaneous. True multitasking (performing two cognitively demanding tasks at literally the same time) is neurologically impossible for tasks that require the same brain regions. Your brain has a single executive attention system, and it can only engage deeply with one complex task at a time.
            </p>
            <p>
              Stanford research led by Clifford Nass found that people who describe themselves as heavy multitaskers actually perform worse on every measure of cognitive performance — including task switching itself — compared to people who multitask less. The irony is notable: the people who believe they are best at juggling multiple tasks are demonstrably the worst at it. Heavy multitasking does not build a skill; it trains your brain to be easily distracted. It is a habit that feels productive while systematically undermining productivity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              Batching Similar Tasks Together
            </h2>
            <p className="mb-3">
              Task batching is one of the most powerful antidotes to context switching, and it is surprisingly simple to implement. The idea is to group similar tasks together and handle them in a single, dedicated block rather than spreading them throughout the day. Instead of checking email every time a notification appears, you check email in two or three concentrated sessions. Instead of responding to Slack messages continuously, you process them in batches between focus blocks.
            </p>
            <p className="mb-3">
              The reason batching works is that similar tasks share cognitive context. Answering five emails in a row requires loading your "email processing" mental framework once, whereas answering five emails scattered across the day requires loading it five separate times, with the associated context-switching costs each time. The same principle applies to code reviews, writing, administrative tasks, and meetings.
            </p>
            <p className="mb-4">
              Effective batching categories for remote workers include:
            </p>
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Communication batch</p>
                <p className="text-white/50 text-xs">Email, Slack messages, Loom reviews, pull request comments. Process all asynchronous communication in one or two daily blocks rather than continuously.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Meeting batch</p>
                <p className="text-white/50 text-xs">Cluster all meetings on two or three designated days if possible. A meeting-free day produces dramatically more deep work than a day with three meetings scattered across different hours, even if the total meeting time is the same.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Creative batch</p>
                <p className="text-white/50 text-xs">Writing, design, complex problem-solving, architecture decisions. Group these during your peak energy hours and protect them fiercely from interruption.</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-semibold mb-1">Administrative batch</p>
                <p className="text-white/50 text-xs">Expense reports, time tracking, status updates, scheduling. Handle all of these in a single daily block, ideally during a low-energy period when you would struggle with deep work anyway.</p>
              </div>
            </div>
            <p>
              The transition to batched work feels uncomfortable at first, especially if you are accustomed to responding to messages immediately. You may worry that people will think you are unresponsive or unavailable. In practice, the opposite tends to happen: your responses become more thoughtful and complete when you process them in focused batches, and your deep work output improves so visibly that colleagues notice and often adopt similar practices.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-violet-400" />
              Communication Protocols That Protect Focus
            </h2>
            <p className="mb-3">
              Remote teams face a particular challenge with context switching because the tools that enable remote collaboration — Slack, Teams, email — are also the primary sources of interruption. In an office, a colleague who sees you wearing headphones and staring intently at your screen will probably think twice before interrupting. In a remote environment, they have no visual cues about your current state. A Slack message costs them nothing to send and may cost you 23 minutes of focus.
            </p>
            <p className="mb-3">
              The solution is not to stop communicating but to establish team-wide communication protocols that distinguish between urgent and non-urgent communication and route each appropriately. A simple but effective framework has three tiers: asynchronous (default), synchronous-scheduled (meetings), and synchronous-urgent (phone calls or a designated emergency channel).
            </p>
            <p className="mb-3">
              Asynchronous communication should be the default for all remote work. This means Slack messages, emails, and project management comments, with an explicit expectation that responses may take hours rather than minutes. When a question is genuinely urgent — something that blocks another person's work or has a real-time deadline — it should go through the synchronous-urgent channel, which might be a phone call or a specific Slack channel that people actually monitor. By separating the channels, you can safely silence the non-urgent channels during focus blocks without worrying about missing true emergencies.
            </p>
            <p className="mb-3">
              At the individual level, communicate your focus schedule to your team. Update your Slack status to indicate when you are in a focus block and when you will next check messages. Something as simple as "Focusing until 11:30 — will respond then" sets clear expectations and gives colleagues the information they need to decide whether their message can wait or truly requires immediate attention. Most will wait.
            </p>
            <p>
              Some of the most productive remote teams implement "no meeting" days or "core focus hours" during which no one schedules meetings or expects real-time responses. These team-level agreements are far more powerful than individual efforts because they create a culture that values focused work rather than one that penalizes people for not responding to every message within five minutes. If you have influence over your team's norms, advocating for focus-protective communication protocols may be the single most impactful thing you can do for team productivity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              Scheduling Deep Work vs. Shallow Work
            </h2>
            <p className="mb-3">
              The most effective way to minimize context switching is to proactively schedule your day rather than reactively responding to whatever demands arrive first. Cal Newport distinguishes between deep work (cognitively demanding tasks that produce high-value output) and shallow work (logistical tasks that are necessary but do not require significant cognitive effort). Each type requires a different kind of attention, and mixing them throughout the day maximizes context-switching costs.
            </p>
            <p className="mb-3">
              A well-structured remote workday puts deep work in contiguous blocks during your peak energy hours and groups shallow work into separate blocks. For most people, this means doing deep work in the morning — when cortisol is naturally elevated, the day's distractions have not yet accumulated, and the brain's prefrontal cortex is freshest — and handling shallow work in the afternoon.
            </p>
            <p className="mb-3">
              A practical daily structure might look like this: begin the day with a five-minute planning session to identify the one or two most important deep work tasks. From 9:00 to 11:00, work exclusively on the first deep task with all notifications disabled. From 11:00 to 11:30, process communications and handle quick requests. From 11:30 to 12:30, tackle the second deep work task. After lunch, schedule meetings, process email in a batch, handle administrative tasks, and do code reviews or collaborative work that requires less sustained concentration.
            </p>
            <p>
              The crucial principle is that deep work blocks must be genuinely uninterrupted. A 90-minute "focus block" with three Slack check-ins is not a focus block — it is three 30-minute fragments separated by context switches, which is worse than no focus block at all because you never have time to reach deep focus. The transition from scattered attention to genuine flow typically takes 15 to 20 minutes. If your blocks are shorter than that, or if they include interruptions, you are paying the ramp-up cost repeatedly without ever reaching the state where your most valuable work happens.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Practical Strategies to Reduce Switching Right Now
            </h2>
            <p className="mb-4">
              If you are convinced that context switching is hurting your productivity (it almost certainly is), here are concrete actions you can take immediately:
            </p>
            <ol className="space-y-3 pl-4 list-decimal list-inside mb-4">
              <li><strong className="text-white">Measure your switching frequency.</strong> For one day, make a tally mark every time you switch tasks or check a notification. Most people are shocked by the number. Awareness alone often motivates behavioral change.</li>
              <li><strong className="text-white">Implement a two-hour morning focus block.</strong> Before checking email or Slack, spend the first two hours of your workday on your most important task. This single change often produces more high-quality output than the rest of the day combined.</li>
              <li><strong className="text-white">Close all tabs except the ones you need.</strong> Open browser tabs are visual cues that pull your attention. If you need to save something for later, bookmark it and close the tab. Your working memory will thank you.</li>
              <li><strong className="text-white">Use a "parking lot" for stray thoughts.</strong> Keep a small notepad next to your keyboard. When an unrelated thought intrudes during deep work ("I need to reply to that email," "I should book a dentist appointment"), jot it on the notepad and return to your task. This captures the thought without derailing your focus.</li>
              <li><strong className="text-white">Set your Slack status and actually honor it.</strong> "Focusing until 11:30" means you do not check Slack until 11:30. No exceptions for "just a quick peek." Every peek costs you minutes of refocusing time.</li>
              <li><strong className="text-white">Batch your meetings.</strong> If you have four 30-minute meetings this week, try to cluster them into one or two days rather than spreading one per day. A day with no meetings is exponentially more productive than a day with one meeting, because the meeting fragments the day into two short blocks that are rarely long enough for deep work.</li>
              <li><strong className="text-white">Use transition rituals between task types.</strong> When you finish a deep work block and move to communication, take 60 seconds to close your work files, open your inbox, and mentally shift gears. This brief, intentional transition reduces attention residue by giving your brain a clear signal that one context is ending and another is beginning.</li>
            </ol>
            <p>
              The compound effect of these changes is substantial. Reducing your daily context switches from fifty to ten does not make you five times more productive in a linear sense, but the quality improvement in your deep work hours — where the most valuable output is generated — can feel transformative. Many remote workers who adopt these practices describe it as feeling like they have gained two or three extra hours in their day, not because they are working longer, but because the hours they work are finally being used at full cognitive capacity.
            </p>
          </section>

          <section className="bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-white mb-2">Try it with NomadBalance</h2>
            <p className="mb-4">
              NomadBalance's focus timer helps you commit to uninterrupted work blocks, track your daily deep work hours, and build the consistency that makes context switching a thing of the past.
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
