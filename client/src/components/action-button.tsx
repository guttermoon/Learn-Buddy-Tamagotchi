import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "accent";
  disabled?: boolean;
  testId: string;
};

const variantStyles = {
  primary: "bg-lavender text-white",
  secondary: "bg-mint text-white",
  accent: "bg-peach text-white",
};

export function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "primary",
  disabled = false,
  testId,
}: ActionButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl ${variantStyles[variant]} shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]`}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      data-testid={testId}
    >
      <Icon className="w-7 h-7" />
      <span className="font-display font-semibold text-sm">{label}</span>
    </motion.button>
  );
}
