// Main App Component with Routing
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AuthCallback from './pages/AuthCallback';
import ChatbotPage from './pages/ChatbotPage';
import HerbalRemediesPage from './pages/HerbalRemediesPage';
import MedicalAnalyzerPage from './pages/MedicalAnalyzerPage';
import AboutPage from './pages/AboutPage';
import ProfilePage from './pages/ProfilePage';
import PrivacyPage from './pages/PrivacyPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <ChatProvider>{children}</ChatProvider>;
}

// Public Route (redirects to dashboard if logged in)
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
    return <Navigate to="/chatbot" replace />;
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

      {/* Protected Routes */}
      <Route path="/chatbot" element={
        <ProtectedRoute>
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
      <Route path="/dashboard" element={<Navigate to="/chatbot" replace />} />
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
