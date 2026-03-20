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
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import CookiePolicy from '@/pages/CookiePolicy';
import TermsOfService from '@/pages/TermsOfService';
import ErrorBoundary from '@/components/ErrorBoundary';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AppRoutes = () => {
  const { isLoadingAuth, isAuthenticated, isRecovery } = useAuth();

  // Show loading spinner while checking auth
  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Password recovery flow → show update password page
  if (isRecovery && isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/update-password" replace />} />
        <Route path="/update-password" element={<UpdatePassword />} />
      </Routes>
    );
  }

  // Not logged in → public routes (landing + login + legal pages)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        {/* Redirect any authenticated route to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Authenticated → app routes + legal pages still accessible
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {/* Redirect /login to dashboard if already authenticated */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      {/* Legal pages always accessible */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
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


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <AppRoutes />
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
