import { useNavigate } from "react-router-dom";
import { Mail, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AuthHeader, PrivacyText, GoogleLoginButton, AnimatedPage } from "@/components/auth";
import { lovable } from "@/integrations/lovable/index";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const AuthLanding = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/chat" replace />;
  }

  const handleEmailLogin = () => {
    navigate("/auth/email-login");
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (error) {
        toast({ title: "Google login failed", description: error.message, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Something went wrong", description: "Please try again", variant: "destructive" });
    } finally {
      setGoogleLoading(false);
    }
  };

  const stagger = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AnimatedPage>
        <div className="w-full max-w-sm mx-auto">
          <AuthHeader />

          <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
            <motion.div variants={fadeUp}>
              <Button
                className="w-full h-12 gap-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                onClick={handleEmailLogin}
              >
                <Mail className="w-5 h-5" />
                Continue with Email
              </Button>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button
                variant="outline"
                className="w-full h-12 gap-3 rounded-xl"
                onClick={() => navigate("/auth/magic-link")}
              >
                <Wand2 className="w-5 h-5" />
                Continue with Magic Link
              </Button>
            </motion.div>

            <motion.div variants={fadeUp} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground">Or</span>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <GoogleLoginButton onClick={handleGoogleLogin} isLoading={googleLoading} />
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/auth/email-signup")} className="text-primary hover:underline font-medium">
                Sign up
              </button>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            <PrivacyText />
          </motion.div>
        </div>
      </AnimatedPage>
    </div>
  );
};

export default AuthLanding;
