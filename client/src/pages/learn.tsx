import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Layers, HelpCircle, Gamepad2, Video, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Flashcard } from "@/components/flashcard";
import { LearningModeCard } from "@/components/learning-mode-card";
import { FlashcardLoadingSkeleton, PageLoadingSkeleton } from "@/components/loading-skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Fact, Flashcard as FlashcardType } from "@shared/schema";

type FlashcardWithFact = FlashcardType & { fact: Fact };

export default function Learn() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("hub");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const { toast } = useToast();

  const { data: flashcards, isLoading } = useQuery<FlashcardWithFact[]>({
    queryKey: ["/api/flashcards"],
    enabled: activeTab === "flashcards",
  });

  const reviewMutation = useMutation({
    mutationFn: (data: { flashcardId: string; correct: boolean }) =>
      apiRequest("POST", "/api/flashcards/review", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creature"] });
    },
  });

  const handleSwipeRight = () => {
    if (!flashcards || flashcards.length === 0) return;
    const currentCard = flashcards[currentCardIndex];
    reviewMutation.mutate({ flashcardId: currentCard.id, correct: true });
    toast({
      title: "Great job!",
      description: "+10 XP earned",
    });
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      toast({
        title: "Session Complete!",
        description: "You've reviewed all cards. Great work!",
      });
      setCurrentCardIndex(0);
    }
  };

  const handleSwipeLeft = () => {
    if (!flashcards || flashcards.length === 0) return;
    const currentCard = flashcards[currentCardIndex];
    reviewMutation.mutate({ flashcardId: currentCard.id, correct: false });
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const currentCard = flashcards?.[currentCardIndex];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-2xl">Learning Hub</h1>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="hub" className="flex-1" data-testid="tab-hub">
              <BookOpen className="w-4 h-4 mr-2" />
              Hub
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="flex-1" data-testid="tab-flashcards">
              <Layers className="w-4 h-4 mr-2" />
              Flashcards
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="hub" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <LearningModeCard
                  icon={Layers}
                  title="Flashcards"
                  description="Review facts with spaced repetition for better retention"
                  stats="Swipe right if you know it, left to review again"
                  color="lavender"
                  onClick={() => setActiveTab("flashcards")}
                  testId="card-flashcards"
                  badge="Popular"
                />
                <LearningModeCard
                  icon={HelpCircle}
                  title="Quiz Mode"
                  description="Test your knowledge with multiple choice questions"
                  stats="5-10 questions per session"
                  color="mint"
                  onClick={() => setLocation("/quiz")}
                  testId="card-quiz"
                />
                <LearningModeCard
                  icon={Gamepad2}
                  title="Mini Games"
                  description="Learn while playing fun interactive games"
                  stats="Coming soon!"
                  color="peach"
                  onClick={() => {
                    toast({
                      title: "Coming Soon!",
                      description: "Mini games will be available in the next update.",
                    });
                  }}
                  testId="card-minigames"
                  badge="Soon"
                />
                <LearningModeCard
                  icon={Video}
                  title="Training Videos"
                  description="Watch short videos to learn key concepts"
                  stats="3-5 minute microlearning"
                  color="sky"
                  onClick={() => {
                    toast({
                      title: "Coming Soon!",
                      description: "Training videos will be available in the next update.",
                    });
                  }}
                  testId="card-videos"
                  badge="Soon"
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="flashcards" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                {isLoading ? (
                  <FlashcardLoadingSkeleton />
                ) : flashcards && flashcards.length > 0 && currentCard ? (
                  <Flashcard
                    fact={currentCard.fact}
                    currentIndex={currentCardIndex}
                    totalCards={flashcards.length}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                    confidenceLevel={currentCard.confidenceLevel}
                  />
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-lavender-light dark:bg-lavender/20 rounded-full flex items-center justify-center">
                      <Layers className="w-8 h-8 text-lavender" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">
                      No Flashcards Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start learning to unlock flashcards!
                    </p>
                    <Button onClick={() => setLocation("/quiz")} data-testid="button-start-quiz">
                      Take a Quiz First
                    </Button>
                  </div>
                )}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
