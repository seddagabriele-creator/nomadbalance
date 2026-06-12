// Central slug → lazy component map for all blog articles.
// Lazy imports keep ~9,500 lines of article JSX out of the main bundle:
// each article becomes its own chunk, fetched only when the route is visited.
//
// NOTE: scripts/generate-static-pages.js parses this file to map slugs to
// source files for static HTML generation — keep the one-entry-per-line
// `"slug": lazy(() => import("./File"))` format.

import { lazy } from "react";

export const BLOG_ROUTES = {
  "deep-work-remote-environment": lazy(() => import("./DeepWorkRemote")),
  "binaural-beats-productivity": lazy(() => import("./BinauralBeatsProductivity")),
  "managing-distractions-work-from-home": lazy(() => import("./ManagingDistractions")),
  "ultradian-rhythms-productivity": lazy(() => import("./UltradianRhythms")),
  "context-switching-hidden-cost": lazy(() => import("./ContextSwitching")),
  "blood-sugar-focus-connection": lazy(() => import("./BloodSugarFocus")),
  "meal-timing-remote-workers": lazy(() => import("./MealTimingRemote")),
  "caffeine-strategy-productivity": lazy(() => import("./CaffeineStrategy")),
  "hydration-cognitive-performance": lazy(() => import("./HydrationPerformance")),
  "sitting-disease-remote-work": lazy(() => import("./SittingDisease")),
  "ergonomic-home-office-setup": lazy(() => import("./ErgonomicSetup")),
  "micro-exercises-desk-workers": lazy(() => import("./MicroExercises")),
  "posture-correction-guide": lazy(() => import("./PostureCorrection")),
  "daily-planning-remote-productivity": lazy(() => import("./DailyPlanning")),
  "task-prioritization-methods": lazy(() => import("./TaskPrioritization")),
  "end-of-day-ritual-remote-work": lazy(() => import("./EndOfDayRitual")),
  "preventing-burnout-remote-workers": lazy(() => import("./PreventingBurnout")),
  "work-life-balance-digital-nomads": lazy(() => import("./WorkLifeBalance")),
  "morning-routine-remote-workers": lazy(() => import("./MorningRoutineRemoteWorkers")),
  "remote-work-productivity-tips": lazy(() => import("./RemoteWorkProductivityTips")),
  "focus-music-work-productivity": lazy(() => import("./FocusMusicWorkProductivity")),
  "pomodoro-vs-time-blocking": lazy(() => import("./PomodoroVsTimeBlocking")),
  "best-apps-remote-workers": lazy(() => import("./BestAppsRemoteWorkers")),
  "back-pain-sitting-all-day": lazy(() => import("./BackPainSittingAllDay")),
  "intermittent-fasting-beginners": lazy(() => import("./IntermittentFastingBeginners")),
  "eye-strain-computer-screen": lazy(() => import("./EyeStrainComputerScreen")),
  "stay-motivated-working-from-home": lazy(() => import("./StayMotivatedWorkingFromHome")),
  "sleep-optimization-remote-workers": lazy(() => import("./SleepOptimization")),
  "standing-desk-benefits-guide": lazy(() => import("./StandingDeskGuide")),
  "digital-detox-after-work": lazy(() => import("./DigitalDetox")),
  "home-office-lighting-productivity": lazy(() => import("./HomeOfficeLighting")),
  "meal-prep-remote-workers": lazy(() => import("./MealPrepRemoteWorkers")),
  "vitamin-d-remote-workers": lazy(() => import("./VitaminDRemoteWork")),
  "time-blocking-method-guide": lazy(() => import("./TimeBlockingGuide")),
  "work-from-home-boundaries": lazy(() => import("./WorkFromHomeBoundaries")),
  "gut-health-brain-focus": lazy(() => import("./GutHealthFocus")),
  "home-office-noise-management": lazy(() => import("./HomeOfficeNoise")),
  "walking-meetings-creativity-boost": lazy(() => import("./WalkingMeetings")),
  "remote-work-loneliness-solutions": lazy(() => import("./RemoteWorkLoneliness")),
  "mindfulness-focus-remote-work": lazy(() => import("./MindfulnessFocus")),
  "power-naps-productivity-science": lazy(() => import("./PowerNaps")),
  "brain-fog-causes-solutions": lazy(() => import("./BrainFog")),
  "weekend-recovery-routines": lazy(() => import("./WeekendRecovery")),
  "wrist-pain-typing-prevention": lazy(() => import("./WristPainTyping")),
  "remote-work-anxiety-coping": lazy(() => import("./RemoteWorkAnxiety")),
  "cold-exposure-productivity": lazy(() => import("./ColdExposureProductivity")),
  "desk-yoga-office-routines": lazy(() => import("./DeskYoga")),
};

export const GUIDE_ROUTES = {
  "pomodoro-focus-timer": lazy(() => import("../guides/PomodoroGuide")),
  "intermittent-fasting-for-professionals": lazy(() => import("../guides/FastingGuide")),
  "desk-exercises-remote-workers": lazy(() => import("../guides/DeskExercisesGuide")),
};
