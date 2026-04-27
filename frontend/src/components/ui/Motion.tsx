import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  hoverScale?: number;
  tapScale?: number;
}

export function Motion({
  children,
  hoverScale = 1.05,
  tapScale = 0.95,
}: MotionWrapperProps) {
  return (
    <motion.div
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}>
      {children}
    </motion.div>
  );
}