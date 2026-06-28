"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, X } from "lucide-react";

type ToastType = "success" | "info" | "error";

interface ToastData {
  id: number;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastInput {
  title: string;
  description?: string;
  type?: ToastType;
}

const ToastContext = createContext<{ toast: (t: ToastInput) => void } | null>(null);

const meta: Record<ToastType, { icon: ReactNode; ring: string; bg: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    ring: "ring-emerald-500/20",
    bg: "bg-emerald-50",
  },
  info: {
    icon: <Info className="h-5 w-5 text-mjblue" />,
    ring: "ring-mjblue/20",
    bg: "bg-mjblue-50",
  },
  error: {
    icon: <AlertTriangle className="h-5 w-5 text-rose-500" />,
    ring: "ring-rose-500/20",
    bg: "bg-rose-50",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = (t: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type: "success", ...t }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 3800);
  };

  const remove = (id: number) => setToasts((prev) => prev.filter((x) => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(92vw,370px)] flex-col gap-2.5">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-navy/5 bg-white/90 p-4 shadow-[0_18px_50px_-16px_rgba(5,11,61,0.35)] backdrop-blur-xl"
            >
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${meta[t.type].bg} ${meta[t.type].ring}`}>
                {meta[t.type].icon}
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-navy">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => remove(t.id)}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-navy/5 hover:text-navy"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? { toast: () => {} };
}
