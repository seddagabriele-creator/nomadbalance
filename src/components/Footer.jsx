import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-sm mt-16">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-white/40 hover:text-white text-sm transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-white/40 hover:text-white text-sm transition-colors">About</Link></li>
              <li><Link to="/blog" className="text-white/40 hover:text-white text-sm transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-white/40 hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Guides</h4>
            <ul className="space-y-2">
              <li><Link to="/guide/pomodoro-focus-timer" className="text-white/40 hover:text-white text-sm transition-colors">Pomodoro Technique</Link></li>
              <li><Link to="/guide/intermittent-fasting-for-professionals" className="text-white/40 hover:text-white text-sm transition-colors">Intermittent Fasting</Link></li>
              <li><Link to="/guide/desk-exercises-remote-workers" className="text-white/40 hover:text-white text-sm transition-colors">Desk Exercises</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-white/40 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/40 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-white/30 text-xs">&copy; {new Date().getFullYear()} NomadBalance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
