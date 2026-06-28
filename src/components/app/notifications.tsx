"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import type { AppNotification } from "@/lib/supabase/notifications-data";

interface NotificationsCtx {
  notifications: AppNotification[];
  unread: number;
  markAllRead: () => void;
  clearAll: () => void;
  live: boolean;
}

const Ctx = createContext<NotificationsCtx | null>(null);

// Demo-only seed (shown when Supabase isn't configured).
const DEMO: AppNotification[] = [
  { id: "n1", userId: "demo", type: "request", text: "New leave request from Rohan Mehta", read: false, createdAt: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: "n2", userId: "demo", type: "submission", text: 'New submission: "Launch hero A/B test"', read: false, createdAt: new Date(Date.now() - 42 * 60000).toISOString() },
  { id: "n3", userId: "demo", type: "certificate", text: "Certificate issued to Ananya Iyer", read: true, createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
];

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const live = isSupabaseConfigured();
  const [notifications, setNotifications] = useState<AppNotification[]>(live ? [] : DEMO);

  useEffect(() => {
    if (!live || !user?.id) return;
    let unsub = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/notifications-data");
        setNotifications(await m.loadNotifications(user.id));
        unsub = m.subscribeNotifications(user.id, (type, obj) =>
          setNotifications((prev) => {
            if (type === "DELETE") return prev.filter((n) => n.id !== (obj as { id: string }).id);
            const o = obj as AppNotification;
            const i = prev.findIndex((n) => n.id === o.id);
            if (i >= 0) {
              const c = [...prev];
              c[i] = o;
              return c;
            }
            return [o, ...prev];
          })
        );
      } catch {
        // table missing / offline - stay empty
      }
    })();
    return () => unsub();
  }, [live, user?.id]);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    if (live && user?.id) import("@/lib/supabase/notifications-data").then((m) => m.markAllRead(user.id)).catch(() => {});
  };
  const clearAll = () => {
    setNotifications([]);
    if (live && user?.id) import("@/lib/supabase/notifications-data").then((m) => m.clearAll(user.id)).catch(() => {});
  };

  return <Ctx.Provider value={{ notifications, unread, markAllRead, clearAll, live }}>{children}</Ctx.Provider>;
}

export function useNotifications() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useNotifications must be used within NotificationsProvider");
  return c;
}
