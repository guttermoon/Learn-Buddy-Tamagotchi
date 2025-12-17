import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

function isDecember(): boolean {
  return new Date().getMonth() === 11;
}

function Snowflake({ delay, duration, left, size }: { delay: number; duration: number; left: number; size: number }) {
  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{ left: `${left}%`, top: -20 }}
      initial={{ y: -20, opacity: 0, rotate: 0 }}
      animate={{ 
        y: "100vh", 
        opacity: [0, 1, 1, 0],
        rotate: 360
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <div 
        className="text-white/80 dark:text-white/60"
        style={{ fontSize: size }}
      >
        *
      </div>
    </motion.div>
  );
}

function FairyLight({ index, total }: { index: number; total: number }) {
  const colors = [
    "bg-red-400",
    "bg-green-400", 
    "bg-yellow-300",
    "bg-blue-400",
    "bg-pink-400",
  ];
  const color = colors[index % colors.length];
  const left = (index / total) * 100;
  
  return (
    <motion.div
      className="fixed top-0 pointer-events-none z-40"
      style={{ left: `${left}%` }}
    >
      <div className="flex flex-col items-center">
        <div className="w-px h-2 bg-green-800 dark:bg-green-600" />
        <motion.div
          className={`w-2 h-3 rounded-full ${color}`}
          animate={{
            opacity: [0.4, 1, 0.4],
            scale: [0.9, 1.1, 0.9],
          }}
          transition={{
            duration: 1.5,
            delay: index * 0.1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            boxShadow: `0 0 8px 2px currentColor`,
          }}
        />
      </div>
    </motion.div>
  );
}

function SnowEffect() {
  const snowflakes = useMemo(() => {
    return Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 6,
      left: Math.random() * 100,
      size: 10 + Math.random() * 14,
    }));
  }, []);

  return (
    <>
      {snowflakes.map((flake) => (
        <Snowflake
          key={flake.id}
          delay={flake.delay}
          duration={flake.duration}
          left={flake.left}
          size={flake.size}
        />
      ))}
    </>
  );
}

function FairyLightsEffect() {
  const lightCount = 20;
  
  return (
    <div className="fixed top-0 left-0 right-0 pointer-events-none z-40">
      <svg 
        className="absolute top-0 w-full h-6" 
        viewBox="0 0 100 6" 
        preserveAspectRatio="none"
      >
        <path
          d="M0,3 Q25,6 50,3 T100,3"
          fill="none"
          stroke="rgb(22 101 52)"
          strokeWidth="0.3"
          className="dark:stroke-green-600"
        />
      </svg>
      {Array.from({ length: lightCount }).map((_, i) => (
        <FairyLight key={i} index={i} total={lightCount} />
      ))}
    </div>
  );
}

export function SeasonalAnimations() {
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    setShowEffects(isDecember());
  }, []);

  if (!showEffects) return null;

  return (
    <>
      <SnowEffect />
      <FairyLightsEffect />
    </>
  );
}
