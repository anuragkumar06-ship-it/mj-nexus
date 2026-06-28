"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle2, Info } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

type Parsed = { kind: "youtube" | "drive" | "file" | "iframe"; src: string; ytId?: string };

export function parseVideoUrl(url: string): Parsed {
  const u = (url || "").trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return { kind: "youtube", ytId: yt[1], src: `https://www.youtube.com/embed/${yt[1]}?enablejsapi=1&rel=0&modestbranding=1` };
  const dr = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (dr) return { kind: "drive", src: `https://drive.google.com/file/d/${dr[1]}/preview` };
  const dr2 = u.match(/drive\.google\.com\/open\?id=([\w-]+)/);
  if (dr2) return { kind: "drive", src: `https://drive.google.com/file/d/${dr2[1]}/preview` };
  if (/\.(mp4|webm|ogg|ogv|mov|m4v)(\?|#|$)/i.test(u)) return { kind: "file", src: u };
  return { kind: "iframe", src: u };
}

function loadYouTubeApi(): Promise<any> {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT);
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(window.YT);
    };
    if (!document.getElementById("yt-iframe-api")) {
      const s = document.createElement("script");
      s.id = "yt-iframe-api";
      s.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(s);
    }
  });
}

export function VideoPlayer({
  open,
  url,
  title,
  initialProgress,
  onProgress,
  onComplete,
  onClose,
}: {
  open: boolean;
  url: string;
  title: string;
  initialProgress: number;
  onProgress: (pct: number) => void;
  onComplete: () => void;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [livePct, setLivePct] = useState(initialProgress);
  const sent = useRef<Set<number>>(new Set());
  const ytPlayerId = useRef("yt-player-" + Math.random().toString(36).slice(2)).current;

  const parsed = parseVideoUrl(url);

  useEffect(() => setMounted(true), []);

  // Reset tracking each time a new video opens.
  useEffect(() => {
    if (open) {
      setLivePct(initialProgress);
      sent.current = new Set();
    }
  }, [open, url, initialProgress]);

  // Close on Escape + lock scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const report = (pct: number) => {
    const r = Math.max(0, Math.min(100, Math.round(pct)));
    setLivePct((p) => Math.max(p, r));
    if (r >= 95) {
      if (!sent.current.has(100)) {
        sent.current.add(100);
        onProgress(100);
      }
      return;
    }
    const milestone = Math.floor(r / 10) * 10;
    if (milestone > 0 && !sent.current.has(milestone)) {
      sent.current.add(milestone);
      onProgress(milestone);
    }
  };

  // YouTube IFrame API — real watch-progress tracking.
  useEffect(() => {
    if (!open || parsed.kind !== "youtube" || !parsed.ytId) return;
    let player: any;
    let interval: any;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled || !document.getElementById(ytPlayerId)) return;
      player = new YT.Player(ytPlayerId, {
        videoId: parsed.ytId,
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: () => {
            interval = setInterval(() => {
              try {
                const d = player.getDuration?.() ?? 0;
                const c = player.getCurrentTime?.() ?? 0;
                if (d > 0) report((c / d) * 100);
              } catch {
                /* ignore */
              }
            }, 1500);
          },
          onStateChange: (e: any) => {
            if (window.YT && e.data === window.YT.PlayerState.ENDED) report(100);
          },
        },
      });
    });
    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
      try {
        player?.destroy?.();
      } catch {
        /* ignore */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, parsed.kind, parsed.ytId]);

  if (!mounted) return null;

  const tracked = parsed.kind === "youtube" || parsed.kind === "file";

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-navy/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-navy/10 bg-white shadow-[0_40px_100px_-30px_rgba(5,11,61,0.6)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-navy/5 p-4">
              <p className="truncate text-sm font-semibold text-navy">{title}</p>
              <button onClick={onClose} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-navy/5 hover:text-navy" aria-label="Close player">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black">
              {parsed.kind === "youtube" && <div id={ytPlayerId} className="h-full w-full" />}
              {parsed.kind === "file" && (
                <video
                  src={parsed.src}
                  controls
                  autoPlay
                  className="h-full w-full"
                  onTimeUpdate={(e) => {
                    const v = e.currentTarget;
                    if (v.duration > 0) report((v.currentTime / v.duration) * 100);
                  }}
                  onEnded={() => report(100)}
                />
              )}
              {(parsed.kind === "drive" || parsed.kind === "iframe") && (
                <iframe
                  src={parsed.src}
                  title={title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              )}
            </div>

            {/* Live progress */}
            <div className="px-4 pt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">Your progress</span>
                <span className="font-semibold text-navy">{Math.round(livePct)}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-navy/[0.06]">
                <div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500" style={{ width: `${livePct}%` }} />
              </div>
              {!tracked && (
                <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Info className="h-3 w-3" /> This source plays in-app but can&apos;t auto-track progress — mark complete when you finish.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 p-4">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-navy/10 bg-white px-3 py-2 text-xs font-semibold text-navy/70 transition-colors hover:text-navy"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open in new tab
              </a>
              <button
                onClick={onComplete}
                className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-brand px-3.5 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Mark complete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
