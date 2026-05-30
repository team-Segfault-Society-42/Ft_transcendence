import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface MotionWrapperProps {
  children: ReactNode;
  hoverScale?: number;
  tapScale?: number;
}

/**
 * Displays a reusable motion wrapper component
 * using Framer Motion animations.
 *
 * Adds:
 * - hover scale animation
 * - tap scale animation
 *
 * Supports custom animation scales.
 */
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