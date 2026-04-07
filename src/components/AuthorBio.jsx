import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

export default function AuthorBio({ date }) {
  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">NomadBalance Team</p>
          <p className="text-xs text-white/40 mt-1 leading-relaxed">
            Written by the NomadBalance team. Content is reviewed for accuracy and grounded in peer-reviewed research in neuroscience, exercise science, and nutrition.
          </p>
          {formattedDate && (
            <p className="text-xs text-white/25 mt-2">Last updated: {formattedDate}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <Link to="/about" className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors">About us</Link>
            <Link to="/blog" className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors">More articles</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
