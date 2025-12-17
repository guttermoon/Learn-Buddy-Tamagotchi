import { useState } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Check, RefreshCw } from "lucide-react";
import type { Fact } from "@shared/schema";

type FlashcardProps = {
  fact: Fact;
  currentIndex: number;
  totalCards: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  confidenceLevel: number;
};

const categoryColors: Record<string, string> = {
  product_features: "bg-lavender text-white",
  sales_techniques: "bg-mint text-white",
  policies: "bg-peach text-white",
  customer_service: "bg-sky text-white",
};

const categoryLabels: Record<string, string> = {
  product_features: "Product Features",
  sales_techniques: "Sales Techniques",
  policies: "Policies",
  customer_service: "Customer Service",
};

export function Flashcard({
  fact,
  currentIndex,
  totalCards,
  onSwipeLeft,
  onSwipeRight,
  confidenceLevel,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragDirection, setDragDirection] = useState<"left" | "right" | null>(null);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      onSwipeRight();
      setIsFlipped(false);
    } else if (info.offset.x < -threshold) {
      onSwipeLeft();
      setIsFlipped(false);
    }
    setDragDirection(null);
  };

  const handleDrag = (_: any, info: PanInfo) => {
    if (info.offset.x > 50) {
      setDragDirection("right");
    } else if (info.offset.x < -50) {
      setDragDirection("left");
    } else {
      setDragDirection(null);
    }
  };

  const confidenceDots = Array.from({ length: 5 }, (_, i) => (
    <div
      key={i}
      className={`w-2 h-2 rounded-full ${
        i < confidenceLevel ? "bg-mint" : "bg-muted"
      }`}
    />
  ));

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Badge className={categoryColors[fact.category] || "bg-muted"}>
          {categoryLabels[fact.category] || fact.category}
        </Badge>
        <span className="text-sm text-muted-foreground font-medium tabular-nums">
          {currentIndex + 1} / {totalCards}
        </span>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-muted-foreground">Confidence:</span>
        <div className="flex gap-1">{confidenceDots}</div>
      </div>

      <motion.div
        className="relative perspective-1000"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isFlipped ? "back" : "front"}
            initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`p-8 min-h-[280px] flex flex-col cursor-pointer transition-all ${
                dragDirection === "right"
                  ? "ring-4 ring-mint/50 bg-mint-light dark:bg-mint/10"
                  : dragDirection === "left"
                  ? "ring-4 ring-peach/50 bg-peach-light dark:bg-peach/10"
                  : ""
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
              data-testid="card-flashcard"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {!isFlipped ? (
                  <>
                    <h3 className="font-display font-semibold text-xl mb-4">
                      {fact.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Tap to reveal answer
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg leading-relaxed">{fact.content}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFlipped(false);
                      }}
                      className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Flip back
                    </button>
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="flex items-center justify-between mt-6 gap-4">
        <Button
          variant="outline"
          className="flex-1 border-peach text-peach hover:bg-peach/10"
          onClick={() => {
            onSwipeLeft();
            setIsFlipped(false);
          }}
          data-testid="button-review-again"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Review Again
        </Button>
        <Button
          className="flex-1 bg-mint hover:bg-mint/90 text-white"
          onClick={() => {
            onSwipeRight();
            setIsFlipped(false);
          }}
          data-testid="button-got-it"
        >
          <Check className="w-4 h-4 mr-2" />
          Got It!
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        Or swipe the card left/right
      </p>
    </div>
  );
}
