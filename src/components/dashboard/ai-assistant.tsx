"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Send, Bot } from "lucide-react";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { usePeople } from "@/components/app/people";
import { cn } from "@/lib/utils";

interface Msg {
  role: "ai" | "user";
  text: string;
}

const greeting: Msg = {
  role: "ai",
  text: "Hi there 👋 I'm your Nexus Talent OS AI. Ask me about your candidates, interns, tasks, or approvals - I answer from your live data.",
};

const prompts = [
  "Who are the top candidates this week?",
  "Summarize this month's hiring",
  "Which interns need attention?",
  "How many certificates were issued?",
];

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { user, role } = useAuth();
  const { tasks, requests, feedback } = useApp();
  const { people, internsAll, leadsAll, reportsOf } = usePeople();

  const buildContext = () => {
    const L: string[] = [`Signed in as ${user.name} (role: ${role}).`];
    const count = (arr: { status: string }[], s: string) => arr.filter((x) => x.status === s).length;
    if (role === "intern") {
      const mine = tasks.filter((t) => t.assigneeId === user.id);
      L.push(`My tasks: ${mine.length} total - To Do ${count(mine, "To Do")}, In Progress ${count(mine, "In Progress")}, Submitted ${count(mine, "Submitted")}, Approved ${count(mine, "Approved")}.`);
      L.push(`My requests raised: ${requests.filter((r) => r.requesterId === user.id).length}. Feedback received: ${feedback.filter((f) => f.internId === user.id).length}.`);
      L.push(`My performance ${user.performance ?? "n/a"}, reliability ${user.reliability ?? "n/a"}, growth ${user.growth ?? "n/a"}.`);
    } else if (role === "lead") {
      const team = reportsOf(user.id);
      L.push(`My team (${team.length}): ${team.map((t) => t.name).join(", ") || "no interns assigned yet"}.`);
      const subs = tasks.filter((t) => t.assignerId === user.id);
      L.push(`Tasks I assigned: ${subs.length}. Approvals waiting on me: ${requests.filter((r) => r.approverId === user.id && r.status === "Pending").length}.`);
    } else if (role === "hr") {
      L.push(`Interns in the org: ${internsAll().length}. Approvals waiting on me: ${requests.filter((r) => r.approverId === user.id && r.status === "Pending").length}.`);
    } else {
      const interns = internsAll();
      const ranked = [...interns].sort((a, b) => (b.performance ?? 0) - (a.performance ?? 0));
      L.push(`Organization: ${interns.length} interns, ${leadsAll().length} leads, ${people.length} people total.`);
      L.push(`Approvals in my queue: ${requests.filter((r) => r.approverId === user.id && r.status === "Pending").length}.`);
      L.push(ranked.length ? `Top performer: ${ranked[0].name} (${ranked[0].performance ?? "n/a"}). Needs attention: ${ranked[ranked.length - 1].name} (${ranked[ranked.length - 1].performance ?? "n/a"}).` : "No interns added yet.");
    }
    return L.join("\n");
  };

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
          context: buildContext(),
        }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.reply || "I couldn't generate a reply just now - please try again." }]);
    } catch {
      setMessages((m) => [...m, { role: "ai", text: `I couldn't reach the assistant. Here's your live summary:\n\n${buildContext()}` }]);
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
                            Nexus Talent OS AI
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
                      placeholder="Ask Nexus Talent OS AI…"
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
