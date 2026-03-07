import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Leaf, Coffee, Brain, ArrowRight, LogIn } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Leaf,
      title: "Personalized Dosha Insights",
      description: "Understand your unique mind-body constitution based on Vata, Pitta, and Kapha principles.",
    },
    {
      icon: Coffee,
      title: "Diet & Lifestyle Guidance",
      description: "Receive tailored recommendations for nutrition, daily routines, and seasonal wellness.",
    },
    {
      icon: Brain,
      title: "Mind & Stress Management",
      description: "Discover traditional practices for mental clarity, emotional balance, and inner peace.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="py-4 px-4 md:px-8 border-b border-border/50"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Leaf className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Ayur Chat Wellness</span>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/auth")}
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login
          </Button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="px-4 md:px-8">
        <section className="max-w-6xl mx-auto py-12 md:py-20">
          <div className="text-center space-y-6">
            {/* Decorative leaf */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex justify-center"
            >
              <motion.div
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-ayurveda-light-sage flex items-center justify-center shadow-lg"
              >
                <Leaf className="h-10 w-10 md:h-12 md:w-12 text-primary" />
              </motion.div>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-3xl md:text-5xl font-bold text-foreground leading-tight"
            >
              Ayur Chat Wellness<br />
              <span className="text-primary">Personalized Ayurvedic Guidance</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Describe your symptoms and lifestyle concerns to receive personalized
              Ayurvedic wellness guidance rooted in 5,000 years of traditional wisdom.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <Button
                onClick={() => navigate("/auth")}
                className="h-14 px-8 text-lg rounded-full bg-primary hover:bg-primary/90 shadow-lg mt-4 group"
              >
                Start Your Wellness Journey
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index + 4}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="bg-card rounded-2xl p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-ayurveda-light-sage flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto py-12 text-center"
        >
          <div className="bg-card/50 rounded-2xl p-6 md:p-8 border border-border/50">
            <p className="text-muted-foreground leading-relaxed italic">
              "Ayurveda teaches us to cherish our innate-nature – to love and honor who we are,
              not as what people think or tell us, who we should be."
            </p>
            <p className="text-sm text-accent mt-3 font-medium">— Prana Gogia</p>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-8 px-4 md:px-8 border-t border-border/50 mt-8"
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-xs md:text-sm text-muted-foreground text-center leading-relaxed">
            This AI provides educational Ayurvedic wellness information only.
            It does not diagnose or treat medical conditions.
            Please consult a qualified Ayurvedic physician for medical advice.
          </p>
          <p className="text-xs text-muted-foreground/70 text-center mt-4">
            © {new Date().getFullYear()} Ayur Chat Wellness. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
