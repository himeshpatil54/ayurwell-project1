import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import AuthLanding from "./pages/auth/AuthLanding";
import EmailSignup from "./pages/auth/EmailSignup";
import EmailLogin from "./pages/auth/EmailLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import MagicLinkLogin from "./pages/auth/MagicLinkLogin";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthLanding />} />
            <Route path="/auth/email-signup" element={<EmailSignup />} />
            <Route path="/auth/email-login" element={<EmailLogin />} />
            <Route path="/auth/magic-link" element={<MagicLinkLogin />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
