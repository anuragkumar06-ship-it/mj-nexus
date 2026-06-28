"use client";

import { motion } from "framer-motion";

/**
 * Animates a headline word-by-word (fade + rise). Words listed in `highlight`
 * get the animated gradient treatment. No overflow clipping, so descenders
 * (g, y, p) and gradients render cleanly.
 */
export function TextReveal({
  text,
  className,
  highlight = [],
  delay = 0,
  stagger = 0.07,
}: {
  text: string;
  className?: string;
  highlight?: string[];
  delay?: number;
  stagger?: number;
}) {
  const words = text.split(" ");
  const norm = (w: string) => w.replace(/[^a-zA-Z-]/g, "").toLowerCase();
  const hi = highlight.map((h) => h.toLowerCase());

  return (
    <span className={className}>
      {words.map((w, i) => {
        const isHi = hi.includes(norm(w));
        return (
          <motion.span
            key={i}
            className={isHi ? "text-gradient-animated inline-block" : "inline-block"}
            initial={{ y: "0.5em", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0em", opacity: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.6,
              delay: delay + i * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        );
      })}
    </span>
  );
}
