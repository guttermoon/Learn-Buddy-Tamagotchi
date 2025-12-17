import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trophy, Clock, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Fact } from "@shared/schema";

type MatchCard = {
  id: string;
  content: string;
  type: "term" | "definition";
  factId: number;
  isFlipped: boolean;
  isMatched: boolean;
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function MatchGame() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const { data: facts, isLoading } = useQuery<Fact[]>({
    queryKey: ["/api/facts"],
  });

  const completeMutation = useMutation({
    mutationFn: (data: { score: number; time: number }) =>
      apiRequest("POST", "/api/minigame/complete", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/creature"] });
    },
  });

  useEffect(() => {
    if (facts && facts.length >= 4) {
      initializeGame();
    }
  }, [facts]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameComplete) {
      timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameComplete]);

  const initializeGame = () => {
    if (!facts) return;
    
    const selectedFacts = shuffleArray(facts).slice(0, 4);
    
    const gameCards: MatchCard[] = [];
    selectedFacts.forEach((fact) => {
      gameCards.push({
        id: `term-${fact.id}`,
        content: fact.title,
        type: "term",
        factId: fact.id,
        isFlipped: false,
        isMatched: false,
      });
      gameCards.push({
        id: `def-${fact.id}`,
        content: fact.content.slice(0, 80) + (fact.content.length > 80 ? "..." : ""),
        type: "definition",
        factId: fact.id,
        isFlipped: false,
        isMatched: false,
      });
    });
    
    setCards(shuffleArray(gameCards));
    setSelectedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameComplete(false);
    setTimeElapsed(0);
    setGameStarted(false);
  };

  const handleCardClick = (cardId: string) => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    
    if (selectedCards.length >= 2) return;
    
    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched) return;
    
    if (selectedCards.includes(cardId)) return;
    
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    
    const newSelected = [...selectedCards, cardId];
    setSelectedCards(newSelected);
    
    if (newSelected.length === 2) {
      setMoves((prev) => prev + 1);
      
      const [firstId, secondId] = newSelected;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);
      
      if (firstCard && secondCard && firstCard.factId === secondCard.factId) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.factId === firstCard.factId ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs((prev) => prev + 1);
          setSelectedCards([]);
          
          if (matchedPairs + 1 === 4) {
            setGameComplete(true);
            const score = Math.max(100 - moves * 5, 10);
            completeMutation.mutate({ score, time: timeElapsed });
            toast({
              title: "Game Complete!",
              description: `You earned ${score} XP with ${moves + 1} moves!`,
            });
          }
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading game...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-lavender-light/10 to-background dark:from-background dark:via-lavender/5 dark:to-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-display font-bold text-2xl">Match Master</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            data-testid="button-restart"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restart
          </Button>
        </motion.div>

        <div className="flex items-center justify-center gap-6 mb-6">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {formatTime(timeElapsed)}
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Trophy className="w-4 h-4 mr-2" />
            {matchedPairs}/4 Matched
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            Moves: {moves}
          </Badge>
        </div>

        <AnimatePresence>
          {gameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Card className="p-6 text-center bg-gradient-to-br from-xp-gold/20 to-lavender/20">
                <Sparkles className="w-12 h-12 mx-auto text-xp-gold mb-3" />
                <h2 className="font-display font-bold text-2xl mb-2">
                  Congratulations!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Completed in {formatTime(timeElapsed)} with {moves} moves
                </p>
                <p className="font-display font-bold text-xl text-xp-gold">
                  +{Math.max(100 - moves * 5, 10)} XP
                </p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: card.isMatched ? 1 : 1.02 }}
              whileTap={{ scale: card.isMatched ? 1 : 0.98 }}
            >
              <Card
                className={`aspect-square flex items-center justify-center p-3 cursor-pointer transition-all ${
                  card.isMatched
                    ? "bg-mint/20 border-mint"
                    : card.isFlipped
                    ? card.type === "term"
                      ? "bg-lavender/20 border-lavender"
                      : "bg-peach/20 border-peach"
                    : "hover-elevate"
                }`}
                onClick={() => handleCardClick(card.id)}
                data-testid={`card-match-${card.id}`}
              >
                {card.isFlipped || card.isMatched ? (
                  <motion.div
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    className="text-center"
                  >
                    <p className={`text-xs ${card.type === "term" ? "font-display font-semibold" : ""}`}>
                      {card.content}
                    </p>
                    {card.type === "term" && (
                      <Badge variant="outline" className="mt-2 text-[10px]">
                        Term
                      </Badge>
                    )}
                  </motion.div>
                ) : (
                  <div className="w-8 h-8 bg-lavender/20 rounded-full flex items-center justify-center">
                    <span className="text-lavender font-display font-bold">?</span>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Card className="p-4">
            <h3 className="font-display font-semibold mb-2">How to Play</h3>
            <p className="text-sm text-muted-foreground">
              Match each retail term with its definition. Tap two cards to flip them.
              If they match, they stay revealed. Complete all matches to earn XP!
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
