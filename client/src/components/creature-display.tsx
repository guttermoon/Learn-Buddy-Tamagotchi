import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Crown, Eye, Star, Gem } from "lucide-react";
import type { Creature, Accessory } from "@shared/schema";

type EquippedAccessory = {
  accessory: Accessory;
};

type CreatureDisplayProps = {
  creature: Creature | null;
  size?: "sm" | "md" | "lg";
  showSparkles?: boolean;
  isFeeding?: boolean;
  equippedAccessories?: EquippedAccessory[];
  onTap?: () => void;
  hideNameLabel?: boolean;
};

const stageColors = {
  1: { primary: "from-lavender-light to-mint-light", accent: "lavender", glow: "lavender/30" },
  2: { primary: "from-peach-light to-sky-light", accent: "peach", glow: "peach/30" },
  3: { primary: "from-mint-light to-lavender-light", accent: "mint", glow: "mint/30" },
  4: { primary: "from-sky-light to-peach-light", accent: "sky", glow: "sky/40" },
  5: { primary: "from-xp-gold/40 to-lavender", accent: "xp-gold", glow: "xp-gold/50" },
};

const stageNames = {
  1: "Baby",
  2: "Toddler", 
  3: "Teen",
  4: "Adult",
  5: "Master",
};

const stageThresholds = [0, 101, 301, 601, 1001];

export function getStageFromFacts(factsMastered: number): number {
  for (let i = stageThresholds.length - 1; i >= 0; i--) {
    if (factsMastered >= stageThresholds[i]) {
      return i + 1;
    }
  }
  return 1;
}

const healthEmojis = {
  happy: { expression: "^‿^", eyeType: "happy" },
  neutral: { expression: "•_•", eyeType: "neutral" },
  sad: { expression: "•́_•̀", eyeType: "sad" },
  neglected: { expression: "╥﹏╥", eyeType: "crying" },
};

const moodReactions = [
  { icon: Heart, color: "text-peach fill-peach" },
  { icon: Sparkles, color: "text-xp-gold" },
  { icon: Star, color: "text-lavender fill-lavender" },
];

export function CreatureDisplay({
  creature,
  size = "lg",
  showSparkles = false,
  isFeeding = false,
  equippedAccessories = [],
  onTap,
  hideNameLabel = false,
}: CreatureDisplayProps) {
  const [reactions, setReactions] = useState<{ id: number; x: number; y: number; type: number }[]>([]);
  const [reactionCounter, setReactionCounter] = useState(0);
  
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const newId = reactionCounter;
    const type = Math.floor(Math.random() * moodReactions.length);
    
    setReactions(prev => [...prev, { id: newId, x, y, type }]);
    setReactionCounter(prev => prev + 1);
    
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newId));
    }, 1000);
    
    onTap?.();
  }, [reactionCounter, onTap]);

  const stage = creature?.stage || 1;
  const health = creature?.health || "happy";
  const colors = stageColors[stage as keyof typeof stageColors] || stageColors[1];
  
  const equippedHat = equippedAccessories.find(e => e.accessory.category === "hat");
  const equippedGlasses = equippedAccessories.find(e => e.accessory.category === "glasses");
  const equippedNecklace = equippedAccessories.find(e => e.accessory.category === "necklace");

  const sizeClasses = {
    sm: "w-24 h-24",
    md: "w-40 h-40",
    lg: "w-64 h-64",
  };

  const bodySizeClasses = {
    sm: "w-16 h-14",
    md: "w-28 h-24",
    lg: "w-44 h-40",
  };

  const eyeSizeClasses = {
    sm: "w-3 h-3",
    md: "w-5 h-5",
    lg: "w-8 h-8",
  };

  return (
    <div 
      className={`relative ${sizeClasses[size]} flex items-center justify-center cursor-pointer select-none`}
      onClick={handleTap}
      data-testid="creature-display"
    >
      <AnimatePresence>
        {reactions.map(reaction => {
          const ReactionIcon = moodReactions[reaction.type].icon;
          return (
            <motion.div
              key={reaction.id}
              className="absolute pointer-events-none z-50"
              style={{ left: reaction.x, top: reaction.y }}
              initial={{ opacity: 1, scale: 0.5, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <ReactionIcon className={`w-6 h-6 ${moodReactions[reaction.type].color}`} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {showSparkles && (
        <>
          <motion.div
            className="absolute top-2 left-4"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          >
            <Sparkles className="w-4 h-4 text-xp-gold" />
          </motion.div>
          <motion.div
            className="absolute top-8 right-6"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          >
            <Sparkles className="w-3 h-3 text-lavender" />
          </motion.div>
          <motion.div
            className="absolute bottom-10 left-8"
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          >
            <Sparkles className="w-3 h-3 text-mint" />
          </motion.div>
        </>
      )}

      <motion.div
        className={`relative ${bodySizeClasses[size]} bg-gradient-to-br ${colors.primary} rounded-[45%] shadow-lg border-2 border-white/30 dark:border-white/10`}
        animate={
          isFeeding
            ? { scale: [1, 1.1, 1], y: [0, -10, 0] }
            : health === "sad" || health === "neglected"
            ? { y: [0, 2, 0] }
            : { scale: [1, 1.02, 1] }
        }
        transition={
          isFeeding
            ? { duration: 0.5, times: [0, 0.5, 1] }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <div className="absolute inset-0 flex items-center justify-center pt-2">
          <div className="flex gap-3 items-center">
            <CreatureEye health={health} size={size} position="left" />
            <CreatureEye health={health} size={size} position="right" />
          </div>
        </div>

        <div className="absolute bottom-[30%] left-1/2 -translate-x-1/2">
          <CreatureMouth health={health} size={size} />
        </div>

        {health === "happy" && (
          <>
            <div className="absolute left-[15%] top-[45%] w-3 h-2 bg-peach/40 rounded-full blur-[2px]" />
            <div className="absolute right-[15%] top-[45%] w-3 h-2 bg-peach/40 rounded-full blur-[2px]" />
          </>
        )}

        {isFeeding && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0], y: [-10, -30] }}
            transition={{ duration: 1 }}
          >
            <Heart className="w-6 h-6 text-peach fill-peach" />
          </motion.div>
        )}

        {equippedHat && (
          <motion.div
            className="absolute -top-4 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-4 h-4'} rounded-full flex items-center justify-center ${
              equippedHat.accessory.rarity === 'legendary' ? 'bg-xp-gold/30' :
              equippedHat.accessory.rarity === 'epic' ? 'bg-purple-500/30' :
              equippedHat.accessory.rarity === 'rare' ? 'bg-blue-500/30' : 'bg-lavender/30'
            }`}>
              <Crown className={`${size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3'} ${
                equippedHat.accessory.rarity === 'legendary' ? 'text-xp-gold' :
                equippedHat.accessory.rarity === 'epic' ? 'text-purple-500' :
                equippedHat.accessory.rarity === 'rare' ? 'text-blue-500' : 'text-lavender'
              }`} />
            </div>
          </motion.div>
        )}

        {equippedGlasses && size === 'lg' && (
          <div className="absolute top-[35%] left-1/2 -translate-x-1/2 opacity-70">
            <Eye className={`w-10 h-3 ${
              equippedGlasses.accessory.rarity === 'legendary' ? 'text-xp-gold' :
              equippedGlasses.accessory.rarity === 'epic' ? 'text-purple-500' : 'text-foreground'
            }`} />
          </div>
        )}

        {equippedNecklace && (
          <motion.div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className={`${size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-3 h-3'} rounded-full flex items-center justify-center ${
              equippedNecklace.accessory.rarity === 'legendary' ? 'bg-xp-gold/30' :
              equippedNecklace.accessory.rarity === 'epic' ? 'bg-purple-500/30' : 'bg-peach/30'
            }`}>
              <Gem className={`${size === 'lg' ? 'w-4 h-4' : size === 'md' ? 'w-3 h-3' : 'w-2 h-2'} ${
                equippedNecklace.accessory.rarity === 'legendary' ? 'text-xp-gold' :
                equippedNecklace.accessory.rarity === 'epic' ? 'text-purple-500' : 'text-peach'
              }`} />
            </div>
          </motion.div>
        )}
      </motion.div>

      {size === "lg" && creature?.name && !hideNameLabel && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
          <p className="font-display font-semibold text-lg text-foreground">
            {creature.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {stageNames[stage as keyof typeof stageNames]}
          </p>
        </div>
      )}
    </div>
  );
}

function CreatureEye({
  health,
  size,
  position,
}: {
  health: string;
  size: "sm" | "md" | "lg";
  position: "left" | "right";
}) {
  const eyeSizes = {
    sm: { outer: "w-4 h-4", inner: "w-2 h-2", shine: "w-1 h-1" },
    md: { outer: "w-6 h-6", inner: "w-3 h-3", shine: "w-1.5 h-1.5" },
    lg: { outer: "w-9 h-9", inner: "w-4 h-4", shine: "w-2 h-2" },
  };

  const sizes = eyeSizes[size];

  if (health === "happy") {
    return (
      <div className={`${sizes.outer} flex items-end justify-center`}>
        <div className="w-full h-[60%] border-t-[3px] border-foreground/80 rounded-t-full" />
      </div>
    );
  }

  if (health === "sad" || health === "neglected") {
    return (
      <div className={`relative ${sizes.outer} bg-foreground/80 rounded-full`}>
        <div className={`absolute ${sizes.inner} bg-white rounded-full top-1 ${position === "left" ? "left-1" : "right-1"}`}>
          <div className={`absolute ${sizes.shine} bg-foreground/20 rounded-full top-0.5 left-0.5`} />
        </div>
        {health === "neglected" && (
          <motion.div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-2 bg-sky rounded-full"
            animate={{ y: [0, 4], opacity: [1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${sizes.outer} bg-foreground/80 rounded-full`}>
      <div className={`absolute ${sizes.inner} bg-white rounded-full top-1 ${position === "left" ? "left-1" : "right-1"}`}>
        <div className={`absolute ${sizes.shine} bg-foreground/20 rounded-full top-0.5 left-0.5`} />
      </div>
    </div>
  );
}

function CreatureMouth({ health, size }: { health: string; size: "sm" | "md" | "lg" }) {
  const mouthSizes = {
    sm: "w-4",
    md: "w-6",
    lg: "w-8",
  };

  if (health === "happy") {
    return (
      <div className={`${mouthSizes[size]} h-2 border-b-[3px] border-foreground/70 rounded-b-full`} />
    );
  }

  if (health === "sad" || health === "neglected") {
    return (
      <div className={`${mouthSizes[size]} h-2 border-t-[3px] border-foreground/70 rounded-t-full`} />
    );
  }

  return (
    <div className={`${mouthSizes[size]} h-0.5 bg-foreground/60 rounded-full`} />
  );
}
