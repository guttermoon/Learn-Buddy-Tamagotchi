import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import type { QuizQuestion as QuizQuestionType } from "@shared/schema";

type QuizQuestionProps = {
  question: QuizQuestionType;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
};

export function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onNext,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  const handleSelectAnswer = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
    setHasAnswered(true);
    onAnswer(index === question.correctAnswer);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setHasAnswered(false);
    onNext();
  };

  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm font-medium text-lavender tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="p-6 mb-6">
        <h2 className="font-display font-semibold text-xl leading-relaxed mb-6">
          {question.question}
        </h2>

        <div className="space-y-3">
          {(question.options as string[]).map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === question.correctAnswer;
            const showCorrect = hasAnswered && isCorrect;
            const showIncorrect = hasAnswered && isSelected && !isCorrect;

            return (
              <motion.button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={hasAnswered}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
                  showCorrect
                    ? "border-mint bg-mint-light dark:bg-mint/10"
                    : showIncorrect
                    ? "border-destructive bg-destructive/10"
                    : isSelected
                    ? "border-lavender bg-lavender-light dark:bg-lavender/10"
                    : "border-border hover:border-lavender/50"
                } ${hasAnswered && !isSelected && !isCorrect ? "opacity-50" : ""}`}
                whileHover={!hasAnswered ? { scale: 1.01 } : {}}
                whileTap={!hasAnswered ? { scale: 0.99 } : {}}
                data-testid={`button-answer-${index}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option}</span>
                  {showCorrect && <Check className="w-5 h-5 text-mint" />}
                  {showIncorrect && <X className="w-5 h-5 text-destructive" />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      {hasAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {question.explanation && (
            <Card className={`p-4 ${
              selectedAnswer === question.correctAnswer 
                ? "bg-mint-light dark:bg-mint/10 border-mint/30" 
                : "bg-peach-light dark:bg-peach/10 border-peach/30"
            }`}>
              <p className="text-sm">
                <span className="font-semibold">
                  {selectedAnswer === question.correctAnswer ? "Great job! " : "Not quite. "}
                </span>
                {question.explanation}
              </p>
            </Card>
          )}

          <Button
            onClick={handleNext}
            className="w-full"
            data-testid="button-next-question"
          >
            {currentIndex < totalQuestions - 1 ? "Next Question" : "See Results"}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
