import React from "react";
import useSEO from "@/hooks/useSEO";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function TermsOfService() {
  useSEO({ title: "Terms of Service", description: "NomadBalance terms of service. Read the terms and conditions for using our productivity and wellness app." });

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
        <h1 className="text-3xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: March 20, 2026</p>

        <div className="space-y-8 text-white/70 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of terms</h2>
            <p>
              By accessing or using NomadBalance ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use the Service. The Service is operated by Gabriele Sedda, based in Sardinia, Italy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of service</h2>
            <p>
              NomadBalance is a free Progressive Web App (PWA) designed to help desk workers maintain healthy habits during the workday. 
              The Service includes a focus timer with binaural audio, an intermittent fasting tracker, guided exercise breaks, and a task planner. 
              The Service is provided "as is" and may change over time as we add or modify features.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. User accounts</h2>
            <p className="mb-2">
              To use NomadBalance, you must create an account using a valid email address. You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.
            </p>
            <p>
              You must be at least 16 years old to create an account and use the Service. By creating an account, you confirm that you are at least 16 years of age.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Acceptable use</h2>
            <p className="mb-2">You agree not to:</p>
            <p className="mb-1">— Use the Service for any unlawful purpose or in violation of any applicable laws.</p>
            <p className="mb-1">— Attempt to gain unauthorized access to any part of the Service or its systems.</p>
            <p className="mb-1">— Interfere with or disrupt the Service or its infrastructure.</p>
            <p className="mb-1">— Use automated tools (bots, scrapers) to access the Service without our permission.</p>
            <p>— Attempt to reverse-engineer, decompile, or extract the source code of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Health disclaimer</h2>
            <p className="mb-2">
              NomadBalance is a wellness and productivity tool. It is <strong className="text-white">not a medical device</strong> and does not provide medical advice, diagnosis, or treatment.
            </p>
            <p className="mb-2">
              The exercise recommendations included in the Service are general stretches and movements designed for healthy adults who work at a desk. 
              They are not intended to treat or prevent any medical condition.
            </p>
            <p>
              Always consult a qualified healthcare professional before starting any exercise program, especially if you have pre-existing health conditions, injuries, or concerns. 
              You use the exercise features at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Advertising</h2>
            <p>
              NomadBalance is a free service supported by advertising through Google AdSense. By using the Service, you acknowledge that ads may be displayed during your use. 
              You may control cookie preferences through our cookie banner. Ad content is provided by Google and we do not control or endorse the products or services advertised.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Intellectual property</h2>
            <p>
              All content, design, code, and features of NomadBalance are owned by Gabriele Sedda unless otherwise noted. 
              You may not copy, modify, distribute, or create derivative works based on the Service without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Your data</h2>
            <p>
              Your use of the Service is also governed by our <Link to="/privacy" className="text-cyan-400 hover:underline">Privacy Policy</Link> and <Link to="/cookies" className="text-cyan-400 hover:underline">Cookie Policy</Link>. 
              You retain ownership of any personal data you input into the Service (tasks, preferences, session logs). 
              We do not sell your personal data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Service availability</h2>
            <p>
              We strive to keep NomadBalance available at all times, but we do not guarantee uninterrupted access. 
              The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. 
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time without prior notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by applicable law, NomadBalance and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, 
              or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Account termination</h2>
            <p>
              You may delete your account at any time. Upon deletion, all your personal data will be permanently removed within 30 days. 
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Governing law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of Italy. Any disputes arising from the use of the Service shall be subject to the exclusive jurisdiction of the courts of Cagliari, Italy — 
              without prejudice to any mandatory consumer protection provisions that may apply in your country of residence under EU law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">13. Changes to these terms</h2>
            <p>
              We may modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. 
              Continued use of the Service after changes constitutes acceptance of the updated terms. 
              For questions, contact us at <a href="mailto:privacy@nomadbalance.app" className="text-cyan-400 hover:underline">privacy@nomadbalance.app</a>.
            </p>
          </section>
        </div>
      </article>
      <Footer />
    </div>
  );
}
