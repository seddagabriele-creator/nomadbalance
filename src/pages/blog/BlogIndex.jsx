import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, Timer, Droplets, Activity, Target } from "lucide-react";
import { BLOG_POSTS } from "./blogData";

const CATEGORIES = [
  { key: "all", label: "All", icon: Zap },
  { key: "Focus", label: "Focus", icon: Timer },
  { key: "Nutrition", label: "Nutrition", icon: Droplets },
  { key: "Movement", label: "Movement", icon: Activity },
  { key: "Planning", label: "Planning", icon: Target },
];

const COLOR_MAP = {
  violet: { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", badge: "bg-violet-500/20 text-violet-400" },
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", badge: "bg-emerald-500/20 text-emerald-400" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-400" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", badge: "bg-cyan-500/20 text-cyan-400" },
};

export default function BlogIndex() {
  const [filter, setFilter] = useState("all");

  const posts = filter === "all" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO title="Blog: Remote Work Productivity, Focus, Health & Planning" description="Expert articles on remote work productivity, focus techniques, nutrition, desk exercises, and daily planning for digital nomads and remote professionals." />
      <nav className="max-w-4xl mx-auto px-4 py-5 flex items-center justify-between">
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

      <div className="max-w-4xl mx-auto px-4 py-10 pb-20">
        <h1 className="text-3xl font-extrabold mb-2">Blog</h1>
        <p className="text-white/40 text-sm mb-8">Practical guides on focus, nutrition, movement, and planning for remote workers.</p>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const isActive = filter === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setFilter(cat.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive ? "bg-white/10 text-white" : "bg-white/5 text-white/40 hover:text-white/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Guides section */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-white mb-4">Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/guide/pomodoro-focus-timer" className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-5 hover:bg-violet-500/10 transition-colors">
              <span className="text-[10px] font-medium text-violet-400 uppercase tracking-wider">Focus</span>
              <h3 className="text-white font-semibold text-sm mt-2 mb-1">The Pomodoro Technique: A Complete Guide</h3>
              <p className="text-white/40 text-xs">How timed work sessions transform your productivity.</p>
            </Link>
            <Link to="/guide/intermittent-fasting-for-professionals" className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-5 hover:bg-emerald-500/10 transition-colors">
              <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">Nutrition</span>
              <h3 className="text-white font-semibold text-sm mt-2 mb-1">Intermittent Fasting for Professionals</h3>
              <p className="text-white/40 text-xs">Structure eating around your work schedule.</p>
            </Link>
            <Link to="/guide/desk-exercises-remote-workers" className="bg-orange-500/5 border border-orange-500/15 rounded-xl p-5 hover:bg-orange-500/10 transition-colors">
              <span className="text-[10px] font-medium text-orange-400 uppercase tracking-wider">Movement</span>
              <h3 className="text-white font-semibold text-sm mt-2 mb-1">Desk Exercises for Remote Workers</h3>
              <p className="text-white/40 text-xs">Combat sitting with targeted movements.</p>
            </Link>
          </div>
        </div>

        {/* Blog posts grid */}
        <h2 className="text-lg font-bold text-white mb-4">Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map(post => {
            const colors = COLOR_MAP[post.color];
            return (
              <Link
                key={post.slug}
                to={`/blog/${post.slug}`}
                className={`${colors.bg} border ${colors.border} rounded-xl p-5 hover:brightness-125 transition-all`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${colors.badge}`}>{post.category}</span>
                  <span className="text-white/20 text-[10px]">{post.readTime}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1.5 leading-snug">{post.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed">{post.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
