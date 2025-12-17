import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function CreatureLoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="w-44 h-40 rounded-[45%]" />
      <Skeleton className="w-24 h-6" />
      <Skeleton className="w-16 h-4" />
    </div>
  );
}

export function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-20 h-4" />
          </div>
          <Skeleton className="w-16 h-8" />
        </Card>
      ))}
    </div>
  );
}

export function FlashcardLoadingSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between mb-4">
        <Skeleton className="w-24 h-6 rounded-full" />
        <Skeleton className="w-16 h-5" />
      </div>
      <Card className="p-8 min-h-[280px] flex flex-col items-center justify-center">
        <Skeleton className="w-48 h-8 mb-4" />
        <Skeleton className="w-32 h-4" />
      </Card>
    </div>
  );
}

export function QuizLoadingSkeleton() {
  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-6">
        <Skeleton className="w-full h-2 rounded-full mb-2" />
        <Skeleton className="w-24 h-4" />
      </div>
      <Card className="p-6 mb-6">
        <Skeleton className="w-full h-8 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="w-full h-14 rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  );
}

export function LeaderboardLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 p-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <Skeleton className="w-32 h-5 mb-1" />
            <Skeleton className="w-24 h-4" />
          </div>
          <Skeleton className="w-16 h-6" />
        </div>
      ))}
    </div>
  );
}

export function PageLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-lavender border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-display">Loading...</p>
      </div>
    </div>
  );
}
