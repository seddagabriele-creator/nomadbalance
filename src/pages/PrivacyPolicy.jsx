import React from "react";
import useSEO from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function PrivacyPolicy() {
  useSEO({ title: "Privacy Policy", description: "NomadBalance privacy policy. Learn how we collect, use, and protect your personal data." });

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
        <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: March 20, 2026</p>

        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Data Controller</h2>
            <p>
              NomadBalance is operated by Gabriele Sedda, based in Sardinia, Italy.
              For any privacy-related questions, you can contact us at: <a href="mailto:privacy@nomadbalance.app" className="text-cyan-400 hover:underline">privacy@nomadbalance.app</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. What data we collect</h2>
            <p className="mb-3">When you use NomadBalance, we may collect the following categories of data:</p>
            <p className="mb-2"><strong className="text-white">Account data:</strong> Email address and authentication credentials (managed through Supabase Auth). We do not store passwords directly — authentication is handled by Supabase's secure infrastructure.</p>
            <p className="mb-2"><strong className="text-white">App usage data:</strong> Focus sessions, fasting windows, exercise completions, tasks, and preferences you enter into the app. This data is stored in your personal account and is necessary for the app to function.</p>
            <p className="mb-2"><strong className="text-white">Technical data:</strong> Browser type, device type, and general location (country-level) for analytics and performance monitoring. We do not track precise geolocation.</p>
            <p><strong className="text-white">Advertising data:</strong> Google AdSense may collect data through cookies and similar technologies to serve personalized or non-personalized ads. See section 5 (Cookies) and our Cookie Policy for details.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. How we use your data</h2>
            <p className="mb-2">We use the collected data for the following purposes:</p>
            <p className="mb-1">— To provide and maintain the NomadBalance service (focus timer, fasting tracker, exercise scheduling, task planning).</p>
            <p className="mb-1">— To authenticate your account and keep your data secure.</p>
            <p className="mb-1">— To improve the app's performance and user experience.</p>
            <p>— To serve advertisements through Google AdSense, which supports the free availability of the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Legal basis for processing (GDPR)</h2>
            <p className="mb-2">We process your personal data on the following legal bases under the GDPR:</p>
            <p className="mb-1"><strong className="text-white">Contractual necessity (Art. 6(1)(b)):</strong> Account data and app usage data are processed to provide you with the NomadBalance service.</p>
            <p className="mb-1"><strong className="text-white">Consent (Art. 6(1)(a)):</strong> Advertising cookies and analytics cookies are only activated after you provide consent through our cookie banner.</p>
            <p><strong className="text-white">Legitimate interest (Art. 6(1)(f)):</strong> Basic technical data for security, fraud prevention, and service stability.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Cookies and advertising</h2>
            <p className="mb-3">
              NomadBalance uses cookies for authentication (essential) and for advertising through Google AdSense (non-essential). 
              Non-essential cookies are only loaded after you give consent through our cookie banner.
            </p>
            <p className="mb-3">
              Google AdSense may use cookies to serve ads based on your prior visits to this or other websites. 
              Google's use of advertising cookies enables it and its partners to serve ads based on your visit to NomadBalance and/or other sites on the Internet.
            </p>
            <p>
              You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Ads Settings</a>. 
              For more details, please read our <Link to="/cookies" className="text-cyan-400 hover:underline">Cookie Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Data storage and security</h2>
            <p className="mb-3">
              Your data is stored on Supabase's infrastructure with row-level security (RLS) enabled — only you can access your own sessions, tasks, and settings. 
              Supabase servers are located in the EU (Frankfurt, Germany).
            </p>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Third-party services</h2>
            <p className="mb-2">NomadBalance uses the following third-party services:</p>
            <p className="mb-1"><strong className="text-white">Supabase</strong> — Authentication and data storage (EU servers). <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Supabase Privacy Policy</a>.</p>
            <p className="mb-1"><strong className="text-white">Google AdSense</strong> — Advertising. <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Google Privacy Policy</a>.</p>
            <p><strong className="text-white">Vercel</strong> — Hosting and deployment. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Vercel Privacy Policy</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Your rights under GDPR</h2>
            <p className="mb-2">As an EU resident, you have the following rights:</p>
            <p className="mb-1">— <strong className="text-white">Right of access:</strong> Request a copy of your personal data.</p>
            <p className="mb-1">— <strong className="text-white">Right to rectification:</strong> Correct inaccurate data.</p>
            <p className="mb-1">— <strong className="text-white">Right to erasure:</strong> Request deletion of your data ("right to be forgotten").</p>
            <p className="mb-1">— <strong className="text-white">Right to restrict processing:</strong> Limit how we use your data.</p>
            <p className="mb-1">— <strong className="text-white">Right to data portability:</strong> Receive your data in a structured, machine-readable format.</p>
            <p className="mb-1">— <strong className="text-white">Right to object:</strong> Object to processing based on legitimate interest.</p>
            <p className="mb-3">— <strong className="text-white">Right to withdraw consent:</strong> Withdraw cookie consent at any time via the cookie settings.</p>
            <p>
              To exercise any of these rights, email us at <a href="mailto:privacy@nomadbalance.app" className="text-cyan-400 hover:underline">privacy@nomadbalance.app</a>. 
              We will respond within 30 days. You also have the right to lodge a complaint with the Italian Data Protection Authority (Garante per la Protezione dei Dati Personali) at <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">garanteprivacy.it</a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Data retention</h2>
            <p>
              We retain your personal data for as long as your account is active. If you delete your account, all associated data (sessions, tasks, settings) is permanently removed within 30 days. 
              Anonymized analytics data may be retained for longer for service improvement purposes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Children's privacy</h2>
            <p>
              NomadBalance is not directed at children under 16 years of age. We do not knowingly collect personal data from children under 16. 
              If you become aware that a child has provided us with personal data, please contact us and we will delete that information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Changes to this policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last updated" date. 
              Continued use of NomadBalance after changes constitutes acceptance of the updated policy.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
}
