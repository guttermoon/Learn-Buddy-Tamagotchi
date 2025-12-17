import { motion } from "framer-motion";
import { Heart } from "lucide-react";

type HappinessMeterProps = {
  value: number;
  size?: "sm" | "md" | "lg";
};

export function HappinessMeter({ value, size = "md" }: HappinessMeterProps) {
  const clampedValue = Math.max(0, Math.min(100, value));
  
  const sizeStyles = {
    sm: { width: "w-24", height: "h-2", iconSize: "w-3 h-3" },
    md: { width: "w-40", height: "h-3", iconSize: "w-4 h-4" },
    lg: { width: "w-56", height: "h-4", iconSize: "w-5 h-5" },
  };

  const styles = sizeStyles[size];

  const getColor = () => {
    if (clampedValue >= 70) return "bg-happiness";
    if (clampedValue >= 40) return "bg-xp-gold";
    return "bg-peach";
  };

  return (
    <div className="flex items-center gap-2">
      <Heart 
        className={`${styles.iconSize} ${clampedValue >= 70 ? "text-happiness" : clampedValue >= 40 ? "text-xp-gold" : "text-peach"} ${clampedValue >= 70 ? "fill-happiness" : ""}`}
      />
      <div className={`${styles.width} ${styles.height} bg-muted rounded-full overflow-hidden`}>
        <motion.div
          className={`h-full ${getColor()} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground tabular-nums">
        {clampedValue}%
      </span>
    </div>
  );
}
