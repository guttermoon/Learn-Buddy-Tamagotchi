import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuizQuestion } from "@/components/quiz-question";
import { QuizResults } from "@/components/quiz-results";
import { QuizLoadingSkeleton } from "@/components/loading-skeleton";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { QuizQuestion as QuizQuestionType } from "@shared/schema";

type QuizState = "start" | "playing" | "results";

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [quizState, setQuizState] = useState<QuizState>("start");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const { data: questions, isLoading, refetch } = useQuery<QuizQuestionType[]>({
    queryKey: ["/api/quiz/questions"],
    enabled: quizState === "playing",
  });

  const submitMutation = useMutation({
    mutationFn: (data: { score: number; totalQuestions: number }) =>
      apiRequest("POST", "/api/quiz/submit", data),
    onSuccess: (data: any) => {
      setXpEarned(data.xpEarned || 0);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creature"] });
    },
  });

  const handleStartQuiz = () => {
    setQuizState("playing");
    setCurrentQuestionIndex(0);
    setScore(0);
    setXpEarned(0);
    refetch();
  };

  const handleAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!questions) return;

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      submitMutation.mutate({
        score,
        totalQuestions: questions.length,
      });
      setQuizState("results");
    }
  };

  const handlePlayAgain = () => {
    setQuizState("start");
  };

  const handleGoHome = () => {
    setLocation("/");
  };

  const currentQuestion = questions?.[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {quizState !== "results" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 mb-6"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (quizState === "playing") {
                  setQuizState("start");
                } else {
                  setLocation("/");
                }
              }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl">Quiz Mode</h1>
          </motion.div>
        )}

        {quizState === "start" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center pt-12"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-lavender to-mint rounded-full flex items-center justify-center mb-6">
              <Zap className="w-12 h-12 text-white" />
            </div>

            <h2 className="font-display font-bold text-3xl mb-3">
              Ready to Test Your Knowledge?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Answer multiple choice questions to earn XP and feed your buddy!
            </p>

            <Card className="p-6 mb-8 w-full max-w-sm">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-display font-bold text-lavender">5-10</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-bold text-mint">+50</p>
                  <p className="text-sm text-muted-foreground">Max XP</p>
                </div>
              </div>
            </Card>

            <Button
              size="lg"
              onClick={handleStartQuiz}
              className="px-8"
              data-testid="button-start-quiz"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Quiz
            </Button>
          </motion.div>
        )}

        {quizState === "playing" && (
          <>
            {isLoading ? (
              <QuizLoadingSkeleton />
            ) : questions && questions.length > 0 && currentQuestion ? (
              <QuizQuestion
                question={currentQuestion}
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                onAnswer={handleAnswer}
                onNext={handleNext}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No questions available</p>
                <Button onClick={() => setQuizState("start")} className="mt-4">
                  Go Back
                </Button>
              </div>
            )}
          </>
        )}

        {quizState === "results" && questions && (
          <QuizResults
            score={score}
            totalQuestions={questions.length}
            xpEarned={xpEarned}
            onPlayAgain={handlePlayAgain}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </div>
  );
}
