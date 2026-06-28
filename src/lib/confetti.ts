/** Lightweight confetti burst — no dependencies, appends to <body>. */
export function burstConfetti(originX = 0.5, originY = 0.32) {
  if (typeof document === "undefined") return;
  const colors = ["#1D7FFF", "#6BC5FF", "#0A6BEF", "#FCD34D", "#34D399", "#FFFFFF"];
  const container = document.createElement("div");
  container.style.cssText =
    "position:fixed;inset:0;pointer-events:none;z-index:120;overflow:hidden";
  document.body.appendChild(container);

  const count = 90;
  for (let i = 0; i < count; i++) {
    const p = document.createElement("div");
    const size = 6 + Math.random() * 7;
    p.style.cssText = `position:absolute;left:${originX * 100}%;top:${originY * 100}%;width:${size}px;height:${size * 0.6}px;background:${colors[i % colors.length]};border-radius:2px;will-change:transform,opacity`;
    container.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 320;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist + 260; // gravity bias
    const rot = Math.random() * 1080 - 540;

    p.animate(
      [
        { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot}deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 1200 + Math.random() * 700,
        easing: "cubic-bezier(0.21,0.7,0.35,1)",
        fill: "forwards",
      }
    );
  }

  setTimeout(() => container.remove(), 2100);
}
