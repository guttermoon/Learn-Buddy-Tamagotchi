import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  color?: "lavender" | "mint" | "peach" | "sky";
};

const colorStyles = {
  lavender: "text-lavender bg-lavender-light dark:bg-lavender/20",
  mint: "text-mint bg-mint-light dark:bg-mint/20",
  peach: "text-peach bg-peach-light dark:bg-peach/20",
  sky: "text-sky bg-sky-light dark:bg-sky/20",
};

export function StatCard({ icon: Icon, label, value, subtext, color = "lavender" }: StatCardProps) {
  return (
    <Card className="p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className={`p-2 rounded-lg ${colorStyles[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-display font-bold tabular-nums">{value}</span>
        {subtext && <span className="text-sm text-muted-foreground">{subtext}</span>}
      </div>
    </Card>
  );
}
