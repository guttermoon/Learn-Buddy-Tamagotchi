import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";

type EvolutionTimelineProps = {
  currentStage: number;
  totalFactsMastered: number;
};

const stages = [
  { stage: 1, name: "Baby", factsRequired: 0, description: "Just hatched!", 
    currentBg: "bg-lavender-light dark:bg-lavender/20 ring-2 ring-lavender",
    unlockedBg: "bg-lavender-light/50 dark:bg-lavender/10",
    circleCurrent: "bg-lavender text-white",
    circleUnlocked: "bg-lavender/60 text-white" },
  { stage: 2, name: "Toddler", factsRequired: 101, description: "Learning to walk", 
    currentBg: "bg-peach-light dark:bg-peach/20 ring-2 ring-peach",
    unlockedBg: "bg-peach-light/50 dark:bg-peach/10",
    circleCurrent: "bg-peach text-white",
    circleUnlocked: "bg-peach/60 text-white" },
  { stage: 3, name: "Teen", factsRequired: 301, description: "Growing strong", 
    currentBg: "bg-mint-light dark:bg-mint/20 ring-2 ring-mint",
    unlockedBg: "bg-mint-light/50 dark:bg-mint/10",
    circleCurrent: "bg-mint text-white",
    circleUnlocked: "bg-mint/60 text-white" },
  { stage: 4, name: "Adult", factsRequired: 601, description: "Fully grown!", 
    currentBg: "bg-sky-light dark:bg-sky/20 ring-2 ring-sky",
    unlockedBg: "bg-sky-light/50 dark:bg-sky/10",
    circleCurrent: "bg-sky text-white",
    circleUnlocked: "bg-sky/60 text-white" },
  { stage: 5, name: "Master", factsRequired: 1001, description: "Legendary!", 
    currentBg: "bg-xp-gold/20 dark:bg-xp-gold/20 ring-2 ring-xp-gold",
    unlockedBg: "bg-xp-gold/10 dark:bg-xp-gold/10",
    circleCurrent: "bg-xp-gold text-white",
    circleUnlocked: "bg-xp-gold/60 text-white" },
];

export function EvolutionTimeline({ currentStage, totalFactsMastered }: EvolutionTimelineProps) {
  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const isUnlocked = currentStage >= stage.stage;
        const isCurrent = currentStage === stage.stage;
        const nextStage = stages[index + 1];
        const progress = isUnlocked 
          ? 100 
          : index > 0 
            ? Math.min(100, ((totalFactsMastered - stages[index - 1].factsRequired) / (stage.factsRequired - stages[index - 1].factsRequired)) * 100)
            : 0;

        return (
          <motion.div
            key={stage.stage}
            className={`flex items-center gap-3 p-3 rounded-xl ${
              isCurrent 
                ? stage.currentBg 
                : isUnlocked 
                  ? stage.unlockedBg 
                  : "bg-muted/50"
            }`}
            whileHover={{ scale: 1.01 }}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              isCurrent 
                ? stage.circleCurrent 
                : isUnlocked 
                  ? stage.circleUnlocked 
                  : "bg-muted-foreground/20 text-muted-foreground"
            }`}>
              {isUnlocked ? (
                isCurrent ? (
                  <span className="font-display font-bold">{stage.stage}</span>
                ) : (
                  <Check className="w-5 h-5" />
                )
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-display font-semibold text-sm ${
                  isUnlocked ? "text-foreground" : "text-muted-foreground"
                }`}>
                  {stage.name}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {stage.factsRequired}+ facts
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {stage.description}
              </p>
              {!isUnlocked && index > 0 && (
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-lavender to-mint"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(0, progress)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
