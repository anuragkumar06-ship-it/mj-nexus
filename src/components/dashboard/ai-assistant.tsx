"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg {
  role: "ai" | "user";
  text: string;
}

const greeting: Msg = {
  role: "ai",
  text: "Hi Anurag 👋 I'm your MJ Nexus AI. Ask me about candidates, interns, hiring, or certificates — or pick a suggestion below.",
};

const prompts = [
  "Who are the top candidates this week?",
  "Summarize this month's hiring",
  "Which interns need attention?",
  "How many certificates were issued?",
];

function answer(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("top") || s.includes("best") || s.includes("candidate"))
    return "Your top candidates right now are Ananya Iyer (95), Arjun Kumar (93), and Aarav Sharma (92) — all flagged as Strong Hire by the AI engine. Aarav has an interview scheduled for Jun 27.";
  if (s.includes("hir") || s.includes("summary") || s.includes("month") || s.includes("perform"))
    return "This month: 271 applicants and 24 hires (7.3% conversion). Marketing is converting ~18% faster than last month, and average performance after hire is 88%.";
  if (s.includes("intern") || s.includes("attention") || s.includes("risk"))
    return "Rohan Mehta (81, trending down) and Kabir Singh (76) could use a check-in. Your standout is Ananya Iyer at 96 with a 98 reliability index.";
  if (s.includes("certificate") || s.includes("cert"))
    return "142 certificates have been issued (28 this month) plus 64 recommendation letters. Open the Certificates module to generate a new completion or appreciation certificate.";
  if (s.includes("recommend") || s.includes("letter"))
    return "Sure — go to Certificates → Certificate Studio, choose the recipient, and I'll generate a personalized recommendation letter from their performance data.";
  if (s.includes("interview"))
    return "There are 18 interviews scheduled this week and 7 pending review. Arjun Kumar's last interview scored 91 (Strong Hire).";
  return "Based on current MJ Nexus data, I'd start with the Analytics module for the full picture. You can ask me about candidates, interns, hiring trends, interviews, or certificates.";
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, open]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    const next: Msg[] = [...messages, { role: "user", text: t }];
    setMessages(next);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.text })),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply || answer(t) }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: answer(t) }]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group flex h-10 items-center gap-1.5 rounded-full bg-gradient-brand px-3 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_rgba(29,127,255,0.7)] transition-transform hover:scale-[1.03]"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Ask AI</span>
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <div className="fixed inset-0 z-[95]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setOpen(false)}
                  className="absolute inset-0 bg-navy/50 backdrop-blur-sm"
                />
                <motion.aside
                  initial={{ x: 440 }}
                  animate={{ x: 0 }}
                  exit={{ x: 440 }}
                  transition={{ type: "spring", stiffness: 320, damping: 34 }}
                  className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-[0_0_80px_-10px_rgba(5,11,61,0.5)]"
                >
                  {/* header */}
                  <div className="relative overflow-hidden bg-gradient-navy p-5 grain">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-mjblue/30 blur-2xl" />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-sky">
                          <Bot className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="flex items-center gap-1.5 font-semibold text-white">
                            MJ Nexus AI
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                          </p>
                          <p className="text-xs text-white/55">Always-on talent copilot</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setOpen(false)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                        aria-label="Close"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* messages */}
                  <div className="flex-1 space-y-4 overflow-y-auto bg-offwhite/60 p-4">
                    {messages.map((m, i) => (
                      <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                            m.role === "user"
                              ? "rounded-br-md bg-gradient-brand text-white"
                              : "rounded-bl-md border border-navy/5 bg-white text-navy/80 shadow-sm"
                          )}
                        >
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {typing && (
                      <div className="flex justify-start">
                        <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-navy/5 bg-white px-4 py-3 shadow-sm">
                          {[0, 1, 2].map((d) => (
                            <motion.span
                              key={d}
                              className="h-1.5 w-1.5 rounded-full bg-mjblue/60"
                              animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                              transition={{ duration: 1, repeat: Infinity, delay: d * 0.15 }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.length <= 1 && (
                      <div className="space-y-2 pt-2">
                        <p className="px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Suggested
                        </p>
                        {prompts.map((p) => (
                          <button
                            key={p}
                            onClick={() => send(p)}
                            className="flex w-full items-center gap-2 rounded-xl border border-navy/8 bg-white px-3 py-2.5 text-left text-sm font-medium text-navy/80 transition-colors hover:border-mjblue/30 hover:bg-mjblue-50/50"
                          >
                            <Sparkles className="h-3.5 w-3.5 shrink-0 text-mjblue" />
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                    <div ref={endRef} />
                  </div>

                  {/* input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      send(input);
                    }}
                    className="flex items-center gap-2 border-t border-navy/5 bg-white p-3"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask MJ Nexus AI…"
                      className="h-11 flex-1 rounded-xl border border-navy/10 bg-offwhite/60 px-3.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10"
                    />
                    <button
                      type="submit"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand text-white transition-transform hover:scale-105 active:scale-95"
                      aria-label="Send"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </motion.aside>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
