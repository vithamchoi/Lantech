import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import ActiveLessonExercise from './pages/ActiveLessonExercise';
import AdminDashboardEvergreen from './pages/AdminDashboardEvergreen';
import AiAssistantHubEvergreen from './pages/AiAssistantHubEvergreen';
import AuthenticationLoginEvergreen from './pages/AuthenticationLoginEvergreen';
import CmsExercisesEvergreen from './pages/CmsExercisesEvergreen';
import CmsLearningPathsEvergreen from './pages/CmsLearningPathsEvergreen';
import FlashcardStudyRoom from './pages/FlashcardStudyRoom';
import LantechLandingPageEvergreen from './pages/LantechLandingPageEvergreen';
import Leaderboard from './pages/Leaderboard';
import LearningPathDashboard from './pages/LearningPathDashboard';
import LearningPathDashboard from './pages/LearningPathDashboard';
import OnboardingWizardEvergreen from './pages/OnboardingWizardEvergreen';
import PlacementTestEvergreen from './pages/PlacementTestEvergreen';
import PlacementTestListeningEvergreen from './pages/PlacementTestListeningEvergreen';
import PlacementTestListeningEvergreen from './pages/PlacementTestListeningEvergreen';
import PlacementTestReadingEvergreen from './pages/PlacementTestReadingEvergreen';
import PlacementTestSpeakingEvergreen from './pages/PlacementTestSpeakingEvergreen';
import PlacementTestWritingEvergreen from './pages/PlacementTestWritingEvergreen';
import ProfileAchievements from './pages/ProfileAchievements';
import PronunciationMasterSync from './pages/PronunciationMasterSync';
import PronunciationPracticeEvergreen from './pages/PronunciationPracticeEvergreen';
import UserManagementEvergreen from './pages/UserManagementEvergreen';

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
    className="w-full h-full flex flex-col flex-grow"
  >
    {children}
  </motion.div>
);

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* App Pages wrapped in Global Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<PageWrapper><LantechLandingPageEvergreen /></PageWrapper>} />
          <Route path="authentication-login-evergreen" element={<PageWrapper><AuthenticationLoginEvergreen /></PageWrapper>} />
          <Route path="authentication-login-evergreen" element={<PageWrapper><AuthenticationLoginEvergreen /></PageWrapper>} />
          <Route path="onboarding-wizard-evergreen" element={<PageWrapper><OnboardingWizardEvergreen /></PageWrapper>} />
          <Route path="learning-path-dashboard" element={<PageWrapper><LearningPathDashboard /></PageWrapper>} />
          <Route path="active-lesson-exercise" element={<PageWrapper><ActiveLessonExercise /></PageWrapper>} />
          <Route path="admin-dashboard-evergreen" element={<PageWrapper><AdminDashboardEvergreen /></PageWrapper>} />
          <Route path="ai-assistant-hub-evergreen" element={<PageWrapper><AiAssistantHubEvergreen /></PageWrapper>} />
          <Route path="cms-exercises-evergreen" element={<PageWrapper><CmsExercisesEvergreen /></PageWrapper>} />
          <Route path="cms-learning-paths-evergreen" element={<PageWrapper><CmsLearningPathsEvergreen /></PageWrapper>} />
          <Route path="flashcard-study-room" element={<PageWrapper><FlashcardStudyRoom /></PageWrapper>} />
          <Route path="leaderboard" element={<PageWrapper><Leaderboard /></PageWrapper>} />
          <Route path="placement-test-evergreen" element={<PageWrapper><PlacementTestEvergreen /></PageWrapper>} />
          <Route path="placement-test-listening-evergreen" element={<PageWrapper><PlacementTestListeningEvergreen /></PageWrapper>} />
          <Route path="placement-test-listening-evergreen" element={<PageWrapper><PlacementTestListeningEvergreen /></PageWrapper>} />
          <Route path="placement-test-reading-evergreen" element={<PageWrapper><PlacementTestReadingEvergreen /></PageWrapper>} />
          <Route path="placement-test-speaking-evergreen" element={<PageWrapper><PlacementTestSpeakingEvergreen /></PageWrapper>} />
          <Route path="placement-test-writing-evergreen" element={<PageWrapper><PlacementTestWritingEvergreen /></PageWrapper>} />
          <Route path="profile-achievements" element={<PageWrapper><ProfileAchievements /></PageWrapper>} />
          <Route path="pronunciation-master-sync" element={<PageWrapper><PronunciationMasterSync /></PageWrapper>} />
          <Route path="pronunciation-practice-evergreen" element={<PageWrapper><PronunciationPracticeEvergreen /></PageWrapper>} />
          <Route path="user-management-evergreen" element={<PageWrapper><UserManagementEvergreen /></PageWrapper>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
