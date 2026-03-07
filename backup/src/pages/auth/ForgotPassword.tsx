import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthHeader, PrivacyText, AnimatedPage } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email"); return; }
    setError("");
    setIsLoading(true);
    const { error: resetError } = await resetPassword(email);
    setIsLoading(false);
    if (resetError) {
      toast({ title: "Error", description: resetError, variant: "destructive" });
    } else {
      setIsSuccess(true);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AnimatedPage>
        <div className="w-full max-w-sm mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/auth/email-login")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </motion.button>

          <AuthHeader title="Forgot Password" subtitle="Enter your email to receive reset instructions" />

          {isSuccess ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-10">
              <CheckCircle2 className="w-14 h-14 text-primary mb-4" />
              <p className="text-lg font-medium text-foreground text-center">Reset Link Sent!</p>
              <p className="text-sm text-muted-foreground mt-1 text-center">Check your email for password reset instructions.</p>
              <Button variant="outline" className="mt-6 rounded-xl" onClick={() => navigate("/auth/email-login")}>Back to Login</Button>
            </motion.div>
          ) : (
            <motion.form
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="h-12 bg-background border-border rounded-xl" />
                {error && <p className="text-sm text-destructive">{error}</p>}
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>) : "Send Reset Link"}
                </Button>
              </motion.div>

              <motion.p variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="text-sm text-muted-foreground text-center">
                Remember your password?{" "}
                <button type="button" onClick={() => navigate("/auth/email-login")} className="text-primary hover:underline font-medium">Login</button>
              </motion.p>
            </motion.form>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <PrivacyText />
          </motion.div>
        </div>
      </AnimatedPage>
    </div>
  );
};

export default ForgotPassword;
