import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import PageLayout from '../layouts/PageLayout';
import { authService } from '../services/authService';
import { Loader2 } from 'lucide-react';

// Import all pages
import LandingPage from '../pages/LandingPage';
import AuthEntrance from '../pages/AuthEntrance';
import OnboardingWizard from '../pages/OnboardingWizard';
import Dashboard from '../pages/Dashboard';
import AssessmentRoom from '../pages/AssessmentRoom';
import AssessmentResults from '../pages/AssessmentResults';
import LessonRoom from '../pages/LessonRoom';
import ExerciseRoom from '../pages/ExerciseRoom';
import VocabularyList from '../pages/VocabularyList';
import FlashcardDeck from '../pages/FlashcardDeck';
import AICabin from '../pages/AICabin';
import PronunciationClinic from '../pages/PronunciationClinic';
import Leaderboard from '../pages/Leaderboard';
import ProfileCabin from '../pages/ProfileCabin';

// Admin CMS pages
import AdminDashboard from '../pages/AdminDashboard';
import SystemGateways from '../pages/SystemGateways';

// Route guard for Students
function StudentGuard({ children }: { children: React.ReactNode }) {
  const { role, user } = useAppStore();
  const location = useLocation();

  if (role === 'Visitor') {
    return <Navigate to="/auth" replace />;
  }

  // Force onboarding if student has not completed it (cefr is 'N/A', 'None' or falsy)
  const isOnboardingOrAssessment = ["/onboarding", "/assessment", "/assessment-results"].includes(location.pathname);
  const isCefrIncomplete = !user?.cefr || user.cefr === 'N/A' || user.cefr === 'None';
  if (role === 'Student' && isCefrIncomplete && !isOnboardingOrAssessment) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

// Route guard for Admin
function AdminGuard({ children }: { children: React.ReactNode }) {
  const { role } = useAppStore();
  if (role !== 'Admin') {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 flex items-center justify-center rounded-full mx-auto text-2xl font-bold">
          🛡️
        </div>
        <h2 className="text-xl font-bold text-slate">Truy Cập Bị Từ Chối</h2>
        <p className="text-sm text-slate-500">
          Khu vực này chỉ dành riêng cho Quản Trị Viên Ranger.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-slate text-white text-xs font-semibold rounded-control cursor-pointer"
        >
          Quay Lại
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  const { role, login, logout, darkMode } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token && role === 'Visitor') {
        try {
          const user = await authService.getMe();
          const mappedRole = user.role === 'Admin' ? 'Admin' : 'Student';
          const refreshToken = localStorage.getItem('refresh_token') || undefined;
          login(mappedRole, user, token, refreshToken);
        } catch (error) {
          console.error("Failed to re-authenticate", error);
          logout();
        }
      }
      setIsInitializing(false);
    };

    initAuth();
  }, [role, login, logout]);

  if (isInitializing) {
    return (
      <div 
        className="h-screen w-full flex items-center justify-center transition-colors duration-200"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <Loader2 className="w-10 h-10 animate-spin text-meadow" />
      </div>
    );
  }

  return (
    <PageLayout>
      <Routes>
        {/* Visitor / Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthEntrance />} />
        <Route path="/ranger/gateways" element={<SystemGateways />} />

        {/* Student Pages */}
        <Route path="/onboarding" element={<StudentGuard><OnboardingWizard /></StudentGuard>} />
        <Route path="/dashboard" element={<StudentGuard><Dashboard /></StudentGuard>} />
        <Route path="/assessment" element={<StudentGuard><AssessmentRoom /></StudentGuard>} />
        <Route path="/assessment-results" element={<StudentGuard><AssessmentResults /></StudentGuard>} />
        <Route path="/lesson/:id" element={<StudentGuard><LessonRoom /></StudentGuard>} />
        <Route path="/exercise/:id" element={<StudentGuard><ExerciseRoom /></StudentGuard>} />
        <Route path="/vocabulary" element={<StudentGuard><VocabularyList /></StudentGuard>} />
        <Route path="/flashcards" element={<StudentGuard><FlashcardDeck /></StudentGuard>} />
        <Route path="/ai-cabin" element={<StudentGuard><AICabin /></StudentGuard>} />
        <Route path="/pronunciation" element={<StudentGuard><PronunciationClinic /></StudentGuard>} />
        <Route path="/leaderboard" element={<StudentGuard><Leaderboard /></StudentGuard>} />
        <Route path="/profile" element={<StudentGuard><ProfileCabin /></StudentGuard>} />

        {/* Admin Ranger Pages */}
        <Route path="/ranger" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/ranger/translations" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/ranger/users" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/ranger/curriculum" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/ranger/vocabulary-badges" element={<AdminGuard><AdminDashboard /></AdminGuard>} />

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  );
}
