import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BookOpen, Lightbulb, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Fact } from "@shared/schema";

type DailyFactCardProps = {
  onClick?: () => void;
};

const categoryLabels: Record<string, string> = {
  product_features: "Product Knowledge",
  sales_techniques: "Sales Tips",
  policies: "Store Policies",
  customer_service: "Customer Service",
};

const categoryColors: Record<string, string> = {
  product_features: "bg-lavender text-white",
  sales_techniques: "bg-mint text-white",
  policies: "bg-peach text-white",
  customer_service: "bg-sky text-white",
};

export function DailyFactCard({ onClick }: DailyFactCardProps) {
  const { data: fact, isLoading } = useQuery<Fact>({
    queryKey: ["/api/daily-fact"],
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      </Card>
    );
  }

  if (!fact) {
    return null;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Card 
        className="p-4 hover-elevate cursor-pointer"
        onClick={onClick}
        data-testid="card-daily-fact"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-xp-gold/20 to-xp-gold/10 rounded-xl">
            <Lightbulb className="w-6 h-6 text-xp-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-display font-semibold truncate">{fact.title}</h4>
              <Badge className="bg-xp-gold text-white shrink-0">Daily</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {fact.content}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="outline" 
                className={categoryColors[fact.category] || "bg-muted"}
              >
                {categoryLabels[fact.category] || fact.category}
              </Badge>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
        </div>
      </Card>
    </motion.div>
  );
}
