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
import AuthCallback from '@/pages/AuthCallback';
import ErrorBoundary from '@/components/ErrorBoundary';

import BlogIndex from '@/pages/blog/BlogIndex';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
// Guide pages
import PomodoroGuide from '@/pages/guides/PomodoroGuide';
import FastingGuide from '@/pages/guides/FastingGuide';
import DeskExercisesGuide from '@/pages/guides/DeskExercisesGuide';
// Blog articles
import DeepWorkRemote from '@/pages/blog/DeepWorkRemote';
import BinauralBeatsProductivity from '@/pages/blog/BinauralBeatsProductivity';
import ManagingDistractions from '@/pages/blog/ManagingDistractions';
import UltradianRhythms from '@/pages/blog/UltradianRhythms';
import ContextSwitching from '@/pages/blog/ContextSwitching';
import BloodSugarFocus from '@/pages/blog/BloodSugarFocus';
import MealTimingRemote from '@/pages/blog/MealTimingRemote';
import CaffeineStrategy from '@/pages/blog/CaffeineStrategy';
import HydrationPerformance from '@/pages/blog/HydrationPerformance';
import SittingDisease from '@/pages/blog/SittingDisease';
import ErgonomicSetup from '@/pages/blog/ErgonomicSetup';
import MicroExercises from '@/pages/blog/MicroExercises';
import PostureCorrection from '@/pages/blog/PostureCorrection';
import DailyPlanning from '@/pages/blog/DailyPlanning';
import TaskPrioritization from '@/pages/blog/TaskPrioritization';
import EndOfDayRitual from '@/pages/blog/EndOfDayRitual';
import PreventingBurnout from '@/pages/blog/PreventingBurnout';
import WorkLifeBalance from '@/pages/blog/WorkLifeBalance';
// SEO Power articles
import MorningRoutineRemoteWorkers from '@/pages/blog/MorningRoutineRemoteWorkers';
import RemoteWorkProductivityTips from '@/pages/blog/RemoteWorkProductivityTips';
import FocusMusicWorkProductivity from '@/pages/blog/FocusMusicWorkProductivity';
import PomodoroVsTimeBlocking from '@/pages/blog/PomodoroVsTimeBlocking';
import BestAppsRemoteWorkers from '@/pages/blog/BestAppsRemoteWorkers';
import BackPainSittingAllDay from '@/pages/blog/BackPainSittingAllDay';
import IntermittentFastingBeginners from '@/pages/blog/IntermittentFastingBeginners';
import EyeStrainComputerScreen from '@/pages/blog/EyeStrainComputerScreen';
import StayMotivatedWorkingFromHome from '@/pages/blog/StayMotivatedWorkingFromHome';
// Batch 2 articles
import WalkingMeetings from '@/pages/blog/WalkingMeetings';
import RemoteWorkLoneliness from '@/pages/blog/RemoteWorkLoneliness';
import MindfulnessFocus from '@/pages/blog/MindfulnessFocus';
import PowerNaps from '@/pages/blog/PowerNaps';
import BrainFog from '@/pages/blog/BrainFog';
// Batch 3 articles
import WeekendRecovery from '@/pages/blog/WeekendRecovery';
import WristPainTyping from '@/pages/blog/WristPainTyping';
import RemoteWorkAnxiety from '@/pages/blog/RemoteWorkAnxiety';
import ColdExposureProductivity from '@/pages/blog/ColdExposureProductivity';
import DeskYoga from '@/pages/blog/DeskYoga';

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
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="*" element={<Navigate to="/update-password" replace />} />
      </Routes>
    );
  }

  // Not logged in → public routes (landing + login + legal pages)
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/guide/pomodoro-focus-timer" element={<PomodoroGuide />} />
        <Route path="/guide/intermittent-fasting-for-professionals" element={<FastingGuide />} />
        <Route path="/guide/desk-exercises-remote-workers" element={<DeskExercisesGuide />} />
        {/* Blog articles */}
        <Route path="/blog/deep-work-remote-environment" element={<DeepWorkRemote />} />
        <Route path="/blog/binaural-beats-productivity" element={<BinauralBeatsProductivity />} />
        <Route path="/blog/managing-distractions-work-from-home" element={<ManagingDistractions />} />
        <Route path="/blog/ultradian-rhythms-productivity" element={<UltradianRhythms />} />
        <Route path="/blog/context-switching-hidden-cost" element={<ContextSwitching />} />
        <Route path="/blog/blood-sugar-focus-connection" element={<BloodSugarFocus />} />
        <Route path="/blog/meal-timing-remote-workers" element={<MealTimingRemote />} />
        <Route path="/blog/caffeine-strategy-productivity" element={<CaffeineStrategy />} />
        <Route path="/blog/hydration-cognitive-performance" element={<HydrationPerformance />} />
        <Route path="/blog/sitting-disease-remote-work" element={<SittingDisease />} />
        <Route path="/blog/ergonomic-home-office-setup" element={<ErgonomicSetup />} />
        <Route path="/blog/micro-exercises-desk-workers" element={<MicroExercises />} />
        <Route path="/blog/posture-correction-guide" element={<PostureCorrection />} />
        <Route path="/blog/daily-planning-remote-productivity" element={<DailyPlanning />} />
        <Route path="/blog/task-prioritization-methods" element={<TaskPrioritization />} />
        <Route path="/blog/end-of-day-ritual-remote-work" element={<EndOfDayRitual />} />
        <Route path="/blog/preventing-burnout-remote-workers" element={<PreventingBurnout />} />
        <Route path="/blog/work-life-balance-digital-nomads" element={<WorkLifeBalance />} />
        <Route path="/blog/morning-routine-remote-workers" element={<MorningRoutineRemoteWorkers />} />
        <Route path="/blog/remote-work-productivity-tips" element={<RemoteWorkProductivityTips />} />
        <Route path="/blog/focus-music-work-productivity" element={<FocusMusicWorkProductivity />} />
        <Route path="/blog/pomodoro-vs-time-blocking" element={<PomodoroVsTimeBlocking />} />
        <Route path="/blog/best-apps-remote-workers" element={<BestAppsRemoteWorkers />} />
        <Route path="/blog/back-pain-sitting-all-day" element={<BackPainSittingAllDay />} />
        <Route path="/blog/intermittent-fasting-beginners" element={<IntermittentFastingBeginners />} />
        <Route path="/blog/eye-strain-computer-screen" element={<EyeStrainComputerScreen />} />
        <Route path="/blog/stay-motivated-working-from-home" element={<StayMotivatedWorkingFromHome />} />
        <Route path="/blog/walking-meetings-creativity-boost" element={<WalkingMeetings />} />
        <Route path="/blog/remote-work-loneliness-solutions" element={<RemoteWorkLoneliness />} />
        <Route path="/blog/mindfulness-focus-remote-work" element={<MindfulnessFocus />} />
        <Route path="/blog/power-naps-productivity-science" element={<PowerNaps />} />
        <Route path="/blog/brain-fog-causes-solutions" element={<BrainFog />} />
        <Route path="/blog/weekend-recovery-routines" element={<WeekendRecovery />} />
        <Route path="/blog/wrist-pain-typing-prevention" element={<WristPainTyping />} />
        <Route path="/blog/remote-work-anxiety-coping" element={<RemoteWorkAnxiety />} />
        <Route path="/blog/cold-exposure-productivity" element={<ColdExposureProductivity />} />
        <Route path="/blog/desk-yoga-office-routines" element={<DeskYoga />} />
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
      <Route path="/auth/callback" element={<AuthCallback />} />
      {/* Redirect /login to dashboard if already authenticated */}
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      {/* Public pages always accessible */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/cookies" element={<CookiePolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/guide/pomodoro-focus-timer" element={<PomodoroGuide />} />
      <Route path="/guide/intermittent-fasting-for-professionals" element={<FastingGuide />} />
      <Route path="/guide/desk-exercises-remote-workers" element={<DeskExercisesGuide />} />
      {/* Blog articles */}
      <Route path="/blog/deep-work-remote-environment" element={<DeepWorkRemote />} />
      <Route path="/blog/binaural-beats-productivity" element={<BinauralBeatsProductivity />} />
      <Route path="/blog/managing-distractions-work-from-home" element={<ManagingDistractions />} />
      <Route path="/blog/ultradian-rhythms-productivity" element={<UltradianRhythms />} />
      <Route path="/blog/context-switching-hidden-cost" element={<ContextSwitching />} />
      <Route path="/blog/blood-sugar-focus-connection" element={<BloodSugarFocus />} />
      <Route path="/blog/meal-timing-remote-workers" element={<MealTimingRemote />} />
      <Route path="/blog/caffeine-strategy-productivity" element={<CaffeineStrategy />} />
      <Route path="/blog/hydration-cognitive-performance" element={<HydrationPerformance />} />
      <Route path="/blog/sitting-disease-remote-work" element={<SittingDisease />} />
      <Route path="/blog/ergonomic-home-office-setup" element={<ErgonomicSetup />} />
      <Route path="/blog/micro-exercises-desk-workers" element={<MicroExercises />} />
      <Route path="/blog/posture-correction-guide" element={<PostureCorrection />} />
      <Route path="/blog/daily-planning-remote-productivity" element={<DailyPlanning />} />
      <Route path="/blog/task-prioritization-methods" element={<TaskPrioritization />} />
      <Route path="/blog/end-of-day-ritual-remote-work" element={<EndOfDayRitual />} />
      <Route path="/blog/preventing-burnout-remote-workers" element={<PreventingBurnout />} />
      <Route path="/blog/work-life-balance-digital-nomads" element={<WorkLifeBalance />} />
      <Route path="/blog/morning-routine-remote-workers" element={<MorningRoutineRemoteWorkers />} />
      <Route path="/blog/remote-work-productivity-tips" element={<RemoteWorkProductivityTips />} />
      <Route path="/blog/focus-music-work-productivity" element={<FocusMusicWorkProductivity />} />
      <Route path="/blog/pomodoro-vs-time-blocking" element={<PomodoroVsTimeBlocking />} />
      <Route path="/blog/best-apps-remote-workers" element={<BestAppsRemoteWorkers />} />
      <Route path="/blog/back-pain-sitting-all-day" element={<BackPainSittingAllDay />} />
      <Route path="/blog/intermittent-fasting-beginners" element={<IntermittentFastingBeginners />} />
      <Route path="/blog/eye-strain-computer-screen" element={<EyeStrainComputerScreen />} />
      <Route path="/blog/stay-motivated-working-from-home" element={<StayMotivatedWorkingFromHome />} />
      <Route path="/blog/walking-meetings-creativity-boost" element={<WalkingMeetings />} />
      <Route path="/blog/remote-work-loneliness-solutions" element={<RemoteWorkLoneliness />} />
      <Route path="/blog/mindfulness-focus-remote-work" element={<MindfulnessFocus />} />
      <Route path="/blog/power-naps-productivity-science" element={<PowerNaps />} />
      <Route path="/blog/brain-fog-causes-solutions" element={<BrainFog />} />
      <Route path="/blog/weekend-recovery-routines" element={<WeekendRecovery />} />
      <Route path="/blog/wrist-pain-typing-prevention" element={<WristPainTyping />} />
      <Route path="/blog/remote-work-anxiety-coping" element={<RemoteWorkAnxiety />} />
      <Route path="/blog/cold-exposure-productivity" element={<ColdExposureProductivity />} />
      <Route path="/blog/desk-yoga-office-routines" element={<DeskYoga />} />
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
