import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Pages
import LandingPage   from '@pages/LandingPage'
import LoginPage     from '@pages/LoginPage'
import SignupPage    from '@pages/SignupPage'
import Dashboard     from '@pages/Dashboard'
import SubjectPage   from '@pages/SubjectPage'
import SubjectsPage  from '@pages/SubjectsPage'
import LevelPage     from '@pages/LevelPage'
import ContestPage    from '@features/contests/pages/ContestPage'
import LeaderboardPage from '@features/leaderboard/pages/LeaderboardPage'
import FriendsPage   from '@features/friends/pages/FriendsPage'
import StorePage        from '@features/store/pages/StorePage'
import AchievementsPage from '@features/achievements/pages/AchievementsPage'
import FightPage     from '@features/fights/pages/FightPage'
import ProgressPage  from '@features/progress/pages/ProgressPage'
import PlanPage      from '@features/plans/pages/PlanPage'
import ProblemsPage  from '@pages/ProblemsPage'
import GamePage      from '@features/game/GamePage'

// Auth
import ProtectedRoute from '@features/auth/ProtectedRoute'
import useAuthStore   from '@store/authStore'

// Gamification
import RewardAnimation from '@features/gamification/components/RewardAnimation'
import useGamificationStore from '@store/gamificationStore'

// Notifications
import GlobalNotificationToast from '@components/ui/NotificationToast'

export default function App() {
  const user        = useAuthStore(s => s.user)
  const isAuth      = useAuthStore(s => s.isAuthenticated)
  const hydrateGami = useGamificationStore(s => s.hydrateFromUser)

  // Hydrate gamification store whenever auth user changes
  useEffect(() => {
    if (isAuth && user) {
      hydrateGami(user)
    }
  }, [user, isAuth])

  return (
    <>
      {/* Global reward animations — rendered outside page tree */}
      <RewardAnimation />

      {/* Global notification toasts */}
      <GlobalNotificationToast />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Public routes */}
          <Route path="/"       element={<LandingPage />} />
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"                          element={<Dashboard />} />
            <Route path="/subjects"                           element={<SubjectsPage />} />
            <Route path="/subject/:subjectId"                 element={<SubjectPage />} />
            <Route path="/subject/:subjectId/level/:levelId"  element={<LevelPage />} />
            <Route path="/contests"                           element={<ContestPage />} />
            <Route path="/leaderboard"                        element={<LeaderboardPage />} />
            <Route path="/friends"                            element={<FriendsPage />} />
            <Route path="/store"                              element={<StorePage />} />
            <Route path="/achievements"                       element={<AchievementsPage />} />
            <Route path="/fight"                               element={<FightPage />} />
            <Route path="/fight/:fightId"                     element={<FightPage />} />
            <Route path="/progress"                           element={<ProgressPage />} />
            <Route path="/plan"                               element={<PlanPage />} />
            <Route path="/problems"                          element={<ProblemsPage />} />
            <Route path="/game"                               element={<GamePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}
