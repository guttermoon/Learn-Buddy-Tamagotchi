import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon, ArrowRight } from "lucide-react";

type LearningModeCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  stats?: string;
  color: "lavender" | "mint" | "peach" | "sky";
  onClick: () => void;
  testId: string;
  badge?: string;
};

const colorStyles = {
  lavender: {
    iconBg: "bg-lavender-light dark:bg-lavender/20",
    iconColor: "text-lavender",
    buttonBg: "bg-lavender hover:bg-lavender/90",
  },
  mint: {
    iconBg: "bg-mint-light dark:bg-mint/20",
    iconColor: "text-mint",
    buttonBg: "bg-mint hover:bg-mint/90",
  },
  peach: {
    iconBg: "bg-peach-light dark:bg-peach/20",
    iconColor: "text-peach",
    buttonBg: "bg-peach hover:bg-peach/90",
  },
  sky: {
    iconBg: "bg-sky-light dark:bg-sky/20",
    iconColor: "text-sky",
    buttonBg: "bg-sky hover:bg-sky/90",
  },
};

export function LearningModeCard({
  icon: Icon,
  title,
  description,
  stats,
  color,
  onClick,
  testId,
  badge,
}: LearningModeCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400 }}>
      <Card className="p-5 h-full flex flex-col" data-testid={testId}>
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${styles.iconBg}`}>
            <Icon className={`w-6 h-6 ${styles.iconColor}`} />
          </div>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>

        <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 flex-1">{description}</p>

        {stats && (
          <p className="text-xs text-muted-foreground mb-4">{stats}</p>
        )}

        <Button
          onClick={onClick}
          className={`w-full ${styles.buttonBg} text-white`}
          data-testid={`${testId}-start`}
        >
          Start
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Card>
    </motion.div>
  );
}
