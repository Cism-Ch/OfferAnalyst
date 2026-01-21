"use client";

import React from "react";
import { motion } from "framer-motion";
import { useNeon, NeonColor } from "@/components/providers/NeonProvider";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const options: { color: NeonColor; hex: string; name: string }[] = [
  { color: "yellow", hex: "#D4FF00", name: "Lemon" },
  { color: "green", hex: "#00FF00", name: "Acid" },
  { color: "cyan", hex: "#00FFFF", name: "Cyber" },
  { color: "purple", hex: "#BF00FF", name: "Flux" },
];

/**
 * Premium Neon Color Switcher.
 * Uses Framer Motion for selection animations.
 */
export function NeonSwitcher() {
  const { neonColor, setNeonColor } = useNeon();

  return (
    <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-100/50 p-1.5 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/50">
      {options.map((opt) => (
        <button
          key={opt.color}
          onClick={() => setNeonColor(opt.color)}
          className="group relative flex size-8 items-center justify-center rounded-full transition-transform active:scale-90"
          title={opt.name}
        >
          {/* Background Circle */}
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-300",
              neonColor === opt.color
                ? "scale-100 opacity-100"
                : "scale-0 opacity-0 group-hover:scale-50 group-hover:opacity-30",
            )}
            style={{
              backgroundColor: opt.hex,
              boxShadow: `0 0 15px ${opt.hex}66`,
            }}
          />

          {/* Inner Dot */}
          <div
            className={cn(
              "z-10 flex size-3 items-center justify-center rounded-full transition-all duration-300",
              neonColor === opt.color
                ? "scale-100 bg-zinc-950"
                : "bg-zinc-400 group-hover:bg-zinc-300",
            )}
            style={neonColor === opt.color ? {} : { backgroundColor: opt.hex }}
          >
            {neonColor === opt.color && (
              <Check
                size={8}
                className="text-neon"
                style={{ color: opt.hex }}
              />
            )}
          </div>

          {/* Active Animation Ring */}
          {neonColor === opt.color && (
            <motion.div
              layoutId="activeNeon"
              className="absolute -inset-1 rounded-full border-2"
              style={{ borderColor: opt.hex }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
