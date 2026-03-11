// Main App Component with Routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import PredictionPage from './pages/PredictionPage';
import ChatbotPage from './pages/ChatbotPage';
import UserDashboardPage from './pages/UserDashboardPage';
import HerbalRemediesPage from './pages/HerbalRemediesPage';
import MedicalAnalyzerPage from './pages/MedicalAnalyzerPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPage from './pages/PrivacyPage';

// Protected Route Component
function ProtectedRoute({ children, withChat = false }) {
  const { user, loading } = useAuth();
  const location = window.location.pathname;

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: location } }} replace />;
  }

  if (withChat) {
    return <ChatProvider>{children}</ChatProvider>;
  }

  return children;
}

// Public Route (redirects to predict if logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/predict" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Auth Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <AuthPage />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected Routes — Prediction is primary */}
      <Route path="/predict" element={
        <ProtectedRoute>
          <PredictionPage />
        </ProtectedRoute>
      } />
      <Route path="/user-dashboard" element={
        <ProtectedRoute>
          <UserDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/chatbot" element={
        <ProtectedRoute withChat>
          <ChatbotPage />
        </ProtectedRoute>
      } />
      <Route path="/herbal-remedies" element={
        <ProtectedRoute>
          <HerbalRemediesPage />
        </ProtectedRoute>
      } />
      <Route path="/medical-analyzer" element={
        <ProtectedRoute>
          <MedicalAnalyzerPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Legacy redirects */}
      <Route path="/dashboard" element={<Navigate to="/predict" replace />} />
      <Route path="/reports" element={<Navigate to="/herbal-remedies" replace />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
