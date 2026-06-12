import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Login from '@/pages/Login';
import LandingPage from '@/pages/LandingPage';
import UpdatePassword from '@/pages/UpdatePassword';
import AuthCallback from '@/pages/AuthCallback';
import ErrorBoundary from '@/components/ErrorBoundary';
import { debugLog } from '@/lib/debugLog';
import { BLOG_ROUTES, GUIDE_ROUTES } from '@/pages/blog/blogRoutes';

// Content pages are lazy-loaded: they're for visitors/SEO, not the daily app
// flow, so they shouldn't weigh down the main bundle.
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const BlogIndex = lazy(() => import('@/pages/blog/BlogIndex'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
    <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
  </div>
);

// Public content routes (blog, guides, legal, about) — shared between the
// authenticated and unauthenticated route trees.
const contentRoutes = [
  <Route key="privacy" path="/privacy" element={<PrivacyPolicy />} />,
  <Route key="cookies" path="/cookies" element={<CookiePolicy />} />,
  <Route key="terms" path="/terms" element={<TermsOfService />} />,
  <Route key="about" path="/about" element={<AboutPage />} />,
  <Route key="contact" path="/contact" element={<ContactPage />} />,
  <Route key="blog" path="/blog" element={<BlogIndex />} />,
  ...Object.entries(GUIDE_ROUTES).map(([slug, GuidePage]) => (
    <Route key={`guide-${slug}`} path={`/guide/${slug}`} element={<GuidePage />} />
  )),
  ...Object.entries(BLOG_ROUTES).map(([slug, ArticlePage]) => (
    <Route key={`blog-${slug}`} path={`/blog/${slug}`} element={<ArticlePage />} />
  )),
];

const AppRoutes = () => {
  const { isLoadingAuth, isAuthenticated, isRecovery } = useAuth();

  if (isLoadingAuth) {
    return <PageLoader />;
  }

  // Password recovery flow → show update password page
  if (isRecovery && isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="*" element={<Navigate to="/update-password" replace />} />
      </Routes>
    );
  }

  // Not logged in → public routes (landing + login + content pages)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        {contentRoutes}
        {/* Redirect any authenticated route to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated → app routes + content pages still accessible
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Redirect /login to dashboard if already authenticated */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      {contentRoutes}
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path.toLowerCase()}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


// Log unhandled promise rejections (e.g. failed Supabase calls that nobody
// caught). These survive page reload via the debugLog ring buffer.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    debugLog("error", "unhandledrejection", {
      message: e.reason?.message || String(e.reason),
      stack: e.reason?.stack?.slice(0, 300),
    });
  });
}

function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <AppRoutes />
            </Suspense>
          </Router>
          <Toaster />
          <SonnerToaster
            position="top-center"
            theme="dark"
            richColors
            duration={2000}
            className="!fixed !top-1/2 !-translate-y-1/2 !left-1/2 !-translate-x-1/2"
            toastOptions={{
              className: "!pointer-events-none",
              style: {
                background: "rgba(30, 41, 59, 0.45)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "rgba(241, 245, 249, 0.9)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              },
            }}
          />
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
