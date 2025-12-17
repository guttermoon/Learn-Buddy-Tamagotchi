import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Sparkles, ArrowRight } from "lucide-react";

type QuizResultsProps = {
  score: number;
  totalQuestions: number;
  xpEarned: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
};

export function QuizResults({
  score,
  totalQuestions,
  xpEarned,
  onPlayAgain,
  onGoHome,
}: QuizResultsProps) {
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPerfect = score === totalQuestions;
  const isGood = percentage >= 70;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 0.2 }}
        className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
          isPerfect
            ? "bg-xp-gold"
            : isGood
            ? "bg-mint"
            : "bg-lavender"
        }`}
      >
        {isPerfect ? (
          <Trophy className="w-12 h-12 text-white" />
        ) : isGood ? (
          <Star className="w-12 h-12 text-white" />
        ) : (
          <Sparkles className="w-12 h-12 text-white" />
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="font-display font-bold text-3xl mb-2">
          {isPerfect
            ? "Perfect Score!"
            : isGood
            ? "Great Job!"
            : "Keep Learning!"}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isPerfect
            ? "You're a knowledge master!"
            : isGood
            ? "You're doing really well!"
            : "Practice makes perfect!"}
        </p>
      </motion.div>

      <Card className="p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-lavender tabular-nums">
              {score}/{totalQuestions}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Correct Answers
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-display font-bold text-xp-gold tabular-nums">
              +{xpEarned}
            </div>
            <div className="text-sm text-muted-foreground mt-1">XP Earned</div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-center gap-2">
            <div className="w-full bg-muted rounded-full h-3">
              <motion.div
                className={`h-full rounded-full ${
                  isPerfect
                    ? "bg-xp-gold"
                    : isGood
                    ? "bg-mint"
                    : "bg-lavender"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: 0.5 }}
              />
            </div>
            <span className="text-sm font-semibold tabular-nums min-w-[45px]">
              {percentage}%
            </span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        <Button onClick={onPlayAgain} variant="outline" data-testid="button-play-again">
          Try Another Quiz
        </Button>
        <Button onClick={onGoHome} data-testid="button-go-home">
          Back to Home
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
