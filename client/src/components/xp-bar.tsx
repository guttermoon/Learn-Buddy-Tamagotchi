import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type XpBarProps = {
  currentXp: number;
  xpToNextLevel: number;
  level: number;
  showLabel?: boolean;
};

export function XpBar({ currentXp, xpToNextLevel, level, showLabel = true }: XpBarProps) {
  const progress = Math.min((currentXp / xpToNextLevel) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 bg-lavender-light dark:bg-lavender/20 px-2.5 py-1 rounded-full">
        <Sparkles className="w-4 h-4 text-lavender" />
        <span className="font-display font-semibold text-sm text-lavender">
          Lv. {level}
        </span>
      </div>
      <div className="flex-1">
        <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-lavender to-mint rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        </div>
        {showLabel && (
          <p className="text-xs text-muted-foreground mt-1">
            {currentXp} / {xpToNextLevel} XP
          </p>
        )}
      </div>
    </div>
  );
}
