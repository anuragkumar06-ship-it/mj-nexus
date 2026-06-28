"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  X,
  Sparkles,
  LogOut,
  CheckCheck,
  UserCheck,
  CalendarCheck,
  Award,
  Repeat,
  ChevronDown,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Avatar } from "@/components/shared/avatar";
import { roleNav } from "@/components/app/roles";
import { useAuth } from "@/components/app/auth";
import { useNotifications } from "@/components/app/notifications";
import { AiAssistant } from "@/components/dashboard/ai-assistant";
import { ROLE_META, type Role } from "@/lib/org";
import { usePeople } from "@/components/app/people";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const ROLES: Role[] = ["intern", "lead", "hr", "management"];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

const NOTIF_STYLE: Record<string, { icon: typeof Sparkles; tone: string }> = {
  request: { icon: Bell, tone: "bg-violet-50 text-violet-600" },
  submission: { icon: UserCheck, tone: "bg-sky-100 text-mjblue-700" },
  success: { icon: CheckCheck, tone: "bg-emerald-50 text-emerald-600" },
  certificate: { icon: Award, tone: "bg-amber-50 text-amber-600" },
  info: { icon: Sparkles, tone: "bg-mjblue-50 text-mjblue" },
};
function notifStyle(type: string) {
  return NOTIF_STYLE[type] ?? NOTIF_STYLE.info;
}
function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  if (isNaN(diff)) return "";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const nav = roleNav[role];

  return (
    <div className="relative flex h-full flex-col">
      <div className="absolute inset-0 grid-dark opacity-40" />
      <div className="relative flex items-center justify-between px-5 py-5">
        <Link href="/" onClick={onNavigate}>
          <Logo theme="dark" />
        </Link>
      </div>

      <div className="relative px-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            {ROLE_META[role].label} workspace
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 py-3">
        <nav className="space-y-1">
          {nav.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * i, duration: 0.4 }}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "text-white" : "text-white/55 hover:text-white"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-xl border border-white/10 bg-white/[0.08]"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gradient-brand" />}
                  <Icon className={cn("relative h-[18px] w-[18px] transition-colors", active ? "text-sky" : "text-white/55 group-hover:text-white")} />
                  <span className="relative flex-1">{item.label}</span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      <div className="relative border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
          <Avatar name={user.name} url={user.avatarUrl} className="h-9 w-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/50">{user.title}</p>
          </div>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="grid h-8 w-8 place-items-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

type Panel = "search" | "bell" | "user" | null;

function Topbar({ onMenu }: { onMenu: () => void }) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, role, setRole, logout, live } = useAuth();
  const { people } = usePeople();
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState("");
  const { notifications: notes, unread, markAllRead, clearAll } = useNotifications();
  const ref = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setPanel(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setPanel("search");
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const personTarget = role === "management" ? "/dashboard/people" : role === "lead" ? "/dashboard/team" : "/dashboard/performance";
  const results = query.trim()
    ? people
        .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 6)
        .map((p) => ({ label: p.name, sub: `${p.title} · ${p.team ?? "—"}`, href: personTarget, avatarUrl: p.avatarUrl }))
    : [];

  const go = (href: string) => {
    setPanel(null);
    setQuery("");
    router.push(href as never);
  };

  const switchRole = (r: Role) => {
    setRole(r);
    setPanel(null);
    toast({ title: `Switched to ${ROLE_META[r].label}`, description: "Now viewing the workspace for this role.", type: "info" });
    router.push("/dashboard");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-navy/5 bg-offwhite/80 backdrop-blur-xl">
      <div ref={ref} className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button onClick={onMenu} className="grid h-10 w-10 place-items-center rounded-xl text-navy hover:bg-navy/5 md:hidden" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="relative hidden w-full max-w-md sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPanel("search"); }}
            onFocus={() => setPanel("search")}
            placeholder="Search people…"
            className="h-10 w-full rounded-xl border border-navy/8 bg-white pl-10 pr-14 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/40 focus:ring-4 focus:ring-mjblue/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center rounded-md border border-navy/10 bg-navy/5 px-1.5 py-0.5 text-[10px] font-semibold text-navy/50 lg:flex">⌘K</kbd>
          <AnimatePresence>
            {panel === "search" && query.trim() && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute left-0 top-12 z-50 w-full overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-[0_20px_50px_-16px_rgba(5,11,61,0.35)]">
                {results.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">No people match “{query}”</p>
                ) : (
                  results.map((r, i) => (
                    <button key={i} onClick={() => go(r.href)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-mjblue-50/60">
                      <Avatar name={r.label} url={r.avatarUrl} className="h-8 w-8" textClassName="text-[10px]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">{r.label}</p>
                        <p className="truncate text-xs text-slate-500">{r.sub}</p>
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <AiAssistant />

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => setPanel(panel === "bell" ? null : "bell")} className="relative grid h-10 w-10 place-items-center rounded-xl text-navy/70 transition-colors hover:bg-navy/5" aria-label="Notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-mjblue ring-2 ring-offwhite" />}
            </button>
            <AnimatePresence>
              {panel === "bell" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-[0_20px_50px_-16px_rgba(5,11,61,0.35)]">
                  <div className="flex items-center justify-between border-b border-navy/5 px-4 py-3">
                    <p className="text-sm font-semibold text-navy">Notifications</p>
                    <div className="flex items-center gap-3">
                      {notes.length > 0 && (
                        <button onClick={() => { clearAll(); toast({ title: "Notifications cleared", type: "success" }); }} className="text-xs font-semibold text-slate-400 transition-colors hover:text-rose-600">
                          Clear all
                        </button>
                      )}
                      <button onClick={() => { markAllRead(); toast({ title: "All caught up", description: "Marked all as read.", type: "success" }); }} className="flex items-center gap-1 text-xs font-semibold text-mjblue hover:underline">
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notes.length === 0 ? (
                      <p className="px-4 py-10 text-center text-sm text-slate-400">You&apos;re all caught up ✨</p>
                    ) : (
                      notes.map((n) => {
                        const st = notifStyle(n.type);
                        const Icon = st.icon;
                        const body = (
                          <>
                            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${st.tone}`}><Icon className="h-4 w-4" /></span>
                            <div className="min-w-0">
                              <p className={cn("text-sm leading-snug", n.read ? "text-navy/60" : "font-medium text-navy")}>{n.text}</p>
                              <p className="mt-0.5 text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                            </div>
                          </>
                        );
                        return n.href ? (
                          <Link key={n.id} href={n.href} onClick={() => setPanel(null)} className="flex gap-3 px-4 py-3 transition-colors hover:bg-offwhite/60">{body}</Link>
                        ) : (
                          <div key={n.id} className="flex gap-3 px-4 py-3">{body}</div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu + role switch */}
          <div className="relative">
            <button onClick={() => setPanel(panel === "user" ? null : "user")} className="ml-1 flex items-center gap-2.5 rounded-full border border-navy/8 bg-white py-1 pl-1 pr-2.5 transition-colors hover:border-mjblue/30">
              <Avatar name={user.name} url={user.avatarUrl} className="h-8 w-8" />
              <div className="hidden leading-tight sm:block">
                <p className="text-left text-xs font-semibold text-navy">{user.name.split(" ")[0]}</p>
                <p className="text-left text-[10px] text-slate-500">{ROLE_META[role].label}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <AnimatePresence>
              {panel === "user" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-navy/5 bg-white shadow-[0_20px_50px_-16px_rgba(5,11,61,0.35)]">
                  <div className="flex items-center gap-3 border-b border-navy/5 p-3">
                    <Avatar name={user.name} url={user.avatarUrl} className="h-10 w-10" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-navy">{user.name}</p>
                      <p className="truncate text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="p-1.5">
                    <Link href="/dashboard/profile" onClick={() => setPanel(null)} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-navy/70 transition-colors hover:bg-navy/5">
                      <Settings className="h-4 w-4" /> Profile settings
                    </Link>
                    {!live && (
                      <>
                        <p className="flex items-center gap-1.5 px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          <Repeat className="h-3 w-3" /> Switch dashboard
                        </p>
                        {ROLES.map((r) => (
                          <button key={r} onClick={() => switchRole(r)} className={cn("flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors", r === role ? "bg-mjblue-50 text-mjblue-700" : "text-navy/70 hover:bg-navy/5")}>
                            {ROLE_META[r].label}
                            {r === role && <span className="h-1.5 w-1.5 rounded-full bg-mjblue" />}
                          </button>
                        ))}
                        <div className="my-1.5 h-px bg-navy/5" />
                      </>
                    )}
                    <button onClick={() => { logout(); router.push("/login"); }} className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Record when the user entered the dashboard today (used by the attendance check-in duration rule).
  useEffect(() => {
    try {
      const key = `mj_session_start_${new Date().toISOString().slice(0, 10)}`;
      if (!localStorage.getItem(key)) localStorage.setItem(key, String(Date.now()));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-offwhite">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy md:block">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm md:hidden" />
            <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: "spring", stiffness: 360, damping: 36 }} className="fixed inset-y-0 left-0 z-50 w-72 bg-navy md:hidden">
              <button onClick={() => setOpen(false)} className="absolute right-3 top-5 z-10 grid h-9 w-9 place-items-center rounded-lg text-white/60 hover:bg-white/10" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="md:pl-64">
        <Topbar onMenu={() => setOpen(true)} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
