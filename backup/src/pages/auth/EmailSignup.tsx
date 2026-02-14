import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthHeader, PrivacyText, AnimatedPage } from "@/components/auth";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const EmailSignup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Please enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!agreeToTerms) newErrors.terms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    setIsLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error, variant: "destructive" });
    } else {
      setIsSuccess(true);
      toast({ title: "Account created!", description: "Please check your email to verify your account." });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const formItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <AnimatedPage>
        <div className="w-full max-w-sm mx-auto">
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/auth")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </motion.button>

          <AuthHeader title="Create Account" subtitle="Join Ayur Chat Wellness today" />

          {isSuccess ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center py-10">
              <CheckCircle2 className="w-14 h-14 text-primary mb-4" />
              <p className="text-lg font-medium text-foreground">Account Created!</p>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                Please check your email to verify your account before logging in.
              </p>
              <Button variant="outline" className="mt-6 rounded-xl" onClick={() => navigate("/auth/email-login")}>
                Go to Login
              </Button>
            </motion.div>
          ) : (
            <motion.form
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } } }}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <motion.div variants={formItem} className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" type="text" placeholder="Enter your full name" value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)} className="h-12 bg-background border-border rounded-xl" />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </motion.div>

              <motion.div variants={formItem} className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)} className="h-12 bg-background border-border rounded-xl" />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </motion.div>

              <motion.div variants={formItem} className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a password" value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)} className="h-12 bg-background border-border pr-10 rounded-xl" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              </motion.div>

              <motion.div variants={formItem} className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password"
                    value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="h-12 bg-background border-border pr-10 rounded-xl" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </motion.div>

              <motion.div variants={formItem} className="flex items-start gap-2">
                <Checkbox id="terms" checked={agreeToTerms} onCheckedChange={(checked) => {
                  setAgreeToTerms(checked as boolean);
                  if (errors.terms) setErrors((p) => ({ ...p, terms: "" }));
                }} className="mt-1" />
                <Label htmlFor="terms" className="text-sm text-muted-foreground font-normal leading-relaxed cursor-pointer">
                  I agree to the <span className="text-primary hover:underline">Terms of Service</span> and{" "}
                  <span className="text-primary hover:underline">Privacy Policy</span>
                </Label>
              </motion.div>
              {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}

              <motion.div variants={formItem}>
                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90 rounded-xl" disabled={isLoading}>
                  {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Account...</>) : "Create Account"}
                </Button>
              </motion.div>

              <motion.p variants={formItem} className="text-sm text-muted-foreground text-center">
                Already have an account?{" "}
                <button type="button" onClick={() => navigate("/auth/email-login")} className="text-primary hover:underline font-medium">Login</button>
              </motion.p>
            </motion.form>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <PrivacyText />
          </motion.div>
        </div>
      </AnimatedPage>
    </div>
  );
};

export default EmailSignup;
