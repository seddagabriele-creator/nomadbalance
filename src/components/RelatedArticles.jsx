import { Link } from "react-router-dom";
import { BLOG_POSTS } from "@/pages/blog/blogData";

const RELATED_MAP = {
  "deep-work-remote-environment": ["context-switching-hidden-cost", "managing-distractions-work-from-home", "ultradian-rhythms-productivity"],
  "binaural-beats-productivity": ["focus-music-work-productivity", "deep-work-remote-environment", "managing-distractions-work-from-home"],
  "managing-distractions-work-from-home": ["deep-work-remote-environment", "context-switching-hidden-cost", "stay-motivated-working-from-home"],
  "ultradian-rhythms-productivity": ["deep-work-remote-environment", "pomodoro-vs-time-blocking", "daily-planning-remote-productivity"],
  "context-switching-hidden-cost": ["deep-work-remote-environment", "task-prioritization-methods", "managing-distractions-work-from-home"],
  "remote-work-productivity-tips": ["morning-routine-remote-workers", "best-apps-remote-workers", "daily-planning-remote-productivity"],
  "focus-music-work-productivity": ["binaural-beats-productivity", "deep-work-remote-environment", "managing-distractions-work-from-home"],
  "pomodoro-vs-time-blocking": ["ultradian-rhythms-productivity", "deep-work-remote-environment", "daily-planning-remote-productivity"],
  "blood-sugar-focus-connection": ["meal-timing-remote-workers", "caffeine-strategy-productivity", "intermittent-fasting-beginners"],
  "meal-timing-remote-workers": ["blood-sugar-focus-connection", "intermittent-fasting-beginners", "hydration-cognitive-performance"],
  "caffeine-strategy-productivity": ["blood-sugar-focus-connection", "hydration-cognitive-performance", "morning-routine-remote-workers"],
  "hydration-cognitive-performance": ["caffeine-strategy-productivity", "blood-sugar-focus-connection", "meal-timing-remote-workers"],
  "intermittent-fasting-beginners": ["meal-timing-remote-workers", "blood-sugar-focus-connection", "hydration-cognitive-performance"],
  "sitting-disease-remote-work": ["back-pain-sitting-all-day", "micro-exercises-desk-workers", "ergonomic-home-office-setup"],
  "ergonomic-home-office-setup": ["back-pain-sitting-all-day", "posture-correction-guide", "eye-strain-computer-screen"],
  "micro-exercises-desk-workers": ["sitting-disease-remote-work", "posture-correction-guide", "back-pain-sitting-all-day"],
  "posture-correction-guide": ["ergonomic-home-office-setup", "back-pain-sitting-all-day", "micro-exercises-desk-workers"],
  "back-pain-sitting-all-day": ["posture-correction-guide", "ergonomic-home-office-setup", "sitting-disease-remote-work"],
  "eye-strain-computer-screen": ["ergonomic-home-office-setup", "micro-exercises-desk-workers", "back-pain-sitting-all-day"],
  "daily-planning-remote-productivity": ["task-prioritization-methods", "morning-routine-remote-workers", "pomodoro-vs-time-blocking"],
  "task-prioritization-methods": ["daily-planning-remote-productivity", "context-switching-hidden-cost", "preventing-burnout-remote-workers"],
  "end-of-day-ritual-remote-work": ["work-life-balance-digital-nomads", "preventing-burnout-remote-workers", "morning-routine-remote-workers"],
  "preventing-burnout-remote-workers": ["work-life-balance-digital-nomads", "end-of-day-ritual-remote-work", "stay-motivated-working-from-home"],
  "work-life-balance-digital-nomads": ["preventing-burnout-remote-workers", "end-of-day-ritual-remote-work", "morning-routine-remote-workers"],
  "morning-routine-remote-workers": ["daily-planning-remote-productivity", "caffeine-strategy-productivity", "end-of-day-ritual-remote-work"],
  "best-apps-remote-workers": ["remote-work-productivity-tips", "daily-planning-remote-productivity", "focus-music-work-productivity"],
  "stay-motivated-working-from-home": ["preventing-burnout-remote-workers", "managing-distractions-work-from-home", "work-life-balance-digital-nomads"],
};

const colorMap = {
  violet: "border-violet-500/20 hover:border-violet-500/40",
  emerald: "border-emerald-500/20 hover:border-emerald-500/40",
  orange: "border-orange-500/20 hover:border-orange-500/40",
  cyan: "border-cyan-500/20 hover:border-cyan-500/40",
};

const badgeMap = {
  violet: "bg-violet-500/20 text-violet-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  orange: "bg-orange-500/20 text-orange-400",
  cyan: "bg-cyan-500/20 text-cyan-400",
};

export default function RelatedArticles({ currentSlug }) {
  const relatedSlugs = RELATED_MAP[currentSlug];
  if (!relatedSlugs) return null;

  const articles = relatedSlugs
    .map((slug) => BLOG_POSTS.find((p) => p.slug === slug))
    .filter(Boolean);

  if (articles.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <h3 className="text-lg font-bold text-white mb-4">Related Articles</h3>
      <div className="grid gap-3">
        {articles.map((post) => (
          <Link
            key={post.slug}
            to={`/blog/${post.slug}`}
            className={`block rounded-xl p-4 border bg-white/[0.02] transition-colors ${colorMap[post.color] || "border-white/10 hover:border-white/20"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badgeMap[post.color] || ""}`}>
                {post.category}
              </span>
              <span className="text-white/30 text-[10px]">{post.readTime}</span>
            </div>
            <p className="text-white/80 text-sm font-medium">{post.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
