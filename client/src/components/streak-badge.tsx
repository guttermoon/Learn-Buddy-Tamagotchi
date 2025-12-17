import { Flame } from "lucide-react";
import { motion } from "framer-motion";

type StreakBadgeProps = {
  streak: number;
  size?: "sm" | "md" | "lg";
};

export function StreakBadge({ streak, size = "md" }: StreakBadgeProps) {
  const sizeStyles = {
    sm: { container: "px-2 py-0.5", icon: "w-3 h-3", text: "text-xs" },
    md: { container: "px-3 py-1", icon: "w-4 h-4", text: "text-sm" },
    lg: { container: "px-4 py-1.5", icon: "w-5 h-5", text: "text-base" },
  };

  const styles = sizeStyles[size];

  return (
    <motion.div
      className={`flex items-center gap-1.5 bg-peach-light dark:bg-peach/20 rounded-full ${styles.container}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <motion.div
        animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <Flame className={`${styles.icon} text-peach ${streak > 0 ? "fill-peach" : ""}`} />
      </motion.div>
      <span className={`font-display font-semibold ${styles.text} text-peach tabular-nums`}>
        {streak}
      </span>
    </motion.div>
  );
}
