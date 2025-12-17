import { motion } from "framer-motion";
import { Lock, Check } from "lucide-react";

type EvolutionTimelineProps = {
  currentStage: number;
  totalFactsMastered: number;
};

const stages = [
  { stage: 1, name: "Baby", factsRequired: 0, description: "Just hatched!" },
  { stage: 2, name: "Toddler", factsRequired: 100, description: "Learning to walk" },
  { stage: 3, name: "Teen", factsRequired: 300, description: "Growing strong" },
];

export function EvolutionTimeline({ currentStage, totalFactsMastered }: EvolutionTimelineProps) {
  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
      {stages.map((stage, index) => {
        const isUnlocked = currentStage >= stage.stage;
        const isCurrent = currentStage === stage.stage;
        const progress = isUnlocked 
          ? 100 
          : index > 0 
            ? Math.min(100, ((totalFactsMastered - stages[index - 1].factsRequired) / (stage.factsRequired - stages[index - 1].factsRequired)) * 100)
            : 0;

        return (
          <div key={stage.stage} className="flex items-center flex-1">
            <motion.div
              className={`relative flex flex-col items-center p-3 rounded-xl min-w-[100px] ${
                isCurrent 
                  ? "bg-lavender-light dark:bg-lavender/20 ring-2 ring-lavender" 
                  : isUnlocked 
                    ? "bg-mint-light dark:bg-mint/20" 
                    : "bg-muted"
              }`}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                isCurrent 
                  ? "bg-lavender text-white" 
                  : isUnlocked 
                    ? "bg-mint text-white" 
                    : "bg-muted-foreground/20 text-muted-foreground"
              }`}>
                {isUnlocked ? (
                  isCurrent ? (
                    <span className="font-display font-bold text-lg">{stage.stage}</span>
                  ) : (
                    <Check className="w-5 h-5" />
                  )
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <span className={`font-display font-semibold text-sm ${
                isUnlocked ? "text-foreground" : "text-muted-foreground"
              }`}>
                {stage.name}
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {stage.factsRequired}+ facts
              </span>
            </motion.div>

            {index < stages.length - 1 && (
              <div className="flex-1 h-1 mx-2 bg-muted rounded-full overflow-hidden min-w-[20px]">
                <motion.div
                  className="h-full bg-gradient-to-r from-lavender to-mint"
                  initial={{ width: 0 }}
                  animate={{ width: `${isUnlocked ? 100 : Math.max(0, progress)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
