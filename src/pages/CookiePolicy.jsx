import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
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

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-10 pb-20">
        <h1 className="text-3xl font-extrabold mb-2">Cookie Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: March 20, 2026</p>

        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">What are cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences and understand how you interact with it. 
              Some cookies are essential for the site to work, while others help us improve your experience or serve relevant ads.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Cookies we use</h2>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-white mb-2">Essential cookies</h3>
              <p className="mb-2">These cookies are necessary for NomadBalance to function. They cannot be disabled.</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                <p><strong className="text-white">Supabase auth cookies</strong> — Maintain your login session. Without these, you would need to log in on every page load. Duration: session / up to 7 days with "remember me".</p>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-base font-semibold text-white mb-2">Advertising cookies</h3>
              <p className="mb-2">These cookies are set by Google AdSense and are only loaded after you give consent.</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
                <p><strong className="text-white">Google AdSense cookies</strong> — Used to serve ads relevant to your interests. Google may also use these cookies to track the number of times you see an ad, measure ad performance, and show ads based on your visits to this and other websites. Duration: varies (up to 2 years).</p>
                <p className="mt-2">
                  Google's advertising cookies include identifiers such as _gads, _gac, _ga, IDE, and others. 
                  For a complete list, see <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google's cookie information page</a>.
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white mb-2">Preference cookies</h3>
              <p className="mb-2">These cookies store your choices on NomadBalance.</p>
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p><strong className="text-white">nb-cookie-consent</strong> — Stores your cookie consent preference (accepted or declined). Duration: 365 days. This cookie is set regardless of your choice so we remember not to ask again.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">How to manage cookies</h2>
            <p className="mb-3">
              When you first visit NomadBalance, a cookie banner will ask for your consent before any non-essential cookies are loaded. 
              You can change your preference at any time by clicking "Cookie settings" in the footer of any page.
            </p>
            <p className="mb-3">
              You can also manage cookies through your browser settings. Most browsers allow you to block or delete cookies. 
              Note that blocking essential cookies may prevent NomadBalance from functioning correctly.
            </p>
            <p>
              To opt out of Google's personalized advertising across all websites, visit <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ads Settings</a> or <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">aboutads.info</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Third-party cookies</h2>
            <p>
              We do not control the cookies set by third parties (Google AdSense). These third parties have their own privacy and cookie policies. 
              We encourage you to review <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google's Privacy Policy</a> for details on how they handle data collected through cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">Changes to this policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. 
              For questions, contact us at <a href="mailto:privacy@nomadbalance.app" className="text-cyan-400 hover:underline">privacy@nomadbalance.app</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
