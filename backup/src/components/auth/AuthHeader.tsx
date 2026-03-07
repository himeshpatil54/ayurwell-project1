import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

interface AuthHeaderProps {
  title?: string;
  subtitle?: string;
}

export const AuthHeader = ({
  title = "Ayur Chat Wellness",
  subtitle = "Personalized Ayurvedic Wellness Guidance",
}: AuthHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center justify-center gap-2 mb-4"
      >
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Leaf className="w-7 h-7 text-primary" />
        </div>
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-2xl font-semibold text-foreground mb-1.5 tracking-tight"
      >
        {title}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.25 }}
        className="text-muted-foreground text-sm"
      >
        {subtitle}
      </motion.p>
    </div>
  );
};
