"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/** Card with a radial glow that follows the cursor + subtle 3D tilt. */
export function SpotlightCard({
  children,
  className,
  glow = "rgba(29,127,255,0.16)",
  tilt = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: string;
  tilt?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -300, y: -300 });
  const [hover, setHover] = useState(false);

  const rx = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 200, damping: 18 });
  const rotateX = useTransform(rx, (v) => `${v}deg`);
  const rotateY = useTransform(ry, (v) => `${v}deg`);

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setPos({ x, y });
    if (tilt) {
      const px = x / r.width - 0.5;
      const py = y / r.height - 0.5;
      rx.set(-py * 6);
      ry.set(px * 6);
    }
  };

  const reset = () => {
    setHover(false);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={reset}
      style={tilt ? { rotateX, rotateY, transformPerspective: 900 } : undefined}
      className={cn("group/spot relative overflow-hidden", className)}
    >
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: hover ? 1 : 0,
          background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${glow}, transparent 65%)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </motion.div>
  );
}
