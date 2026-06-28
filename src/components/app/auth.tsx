"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Lock } from "lucide-react";
import { ROLE_IDENTITY, personById, type Person, type Role } from "@/lib/org";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/shared/logo";

const KEY = "mj_nexus_role";
const ROLES: Role[] = ["intern", "lead", "hr", "management"];

interface AuthCtx {
  user: Person;
  role: Role;
  live: boolean;
  setRole: (r: Role) => void;
  logout: () => void | Promise<void>;
  updateUser: (patch: Partial<Person>) => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  return isSupabaseConfigured() ? <LiveAuth>{children}</LiveAuth> : <DemoAuth>{children}</DemoAuth>;
}

function titleFor(role?: string) {
  if (role === "management") return "Management";
  if (role === "lead") return "Team Lead";
  if (role === "hr") return "HR Associate";
  return "Intern";
}

/* ---------- Demo mode (no Supabase): role picker + seed identity ---------- */
function DemoAuth({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("hr");
  const [override, setOverride] = useState<Partial<Person>>({});
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY) as Role | null;
      if (s && ROLES.includes(s)) setRoleState(s);
    } catch {}
  }, []);
  const setRole = (r: Role) => {
    setRoleState(r);
    setOverride({});
    try {
      localStorage.setItem(KEY, r);
    } catch {}
  };
  const logout = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };
  const updateUser = async (patch: Partial<Person>) => {
    setOverride((o) => ({ ...o, ...patch }));
  };
  const user = { ...personById(ROLE_IDENTITY[role])!, ...override };
  return <Ctx.Provider value={{ user, role, live: false, setRole, logout, updateUser }}>{children}</Ctx.Provider>;
}

/* ---------- Live mode (Supabase): the real signed-in account ---------- */
function LiveAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [person, setPerson] = useState<Person | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) {
          if (active) {
            setPerson(null);
            setLoading(false);
          }
          return;
        }
        const base: Person = {
          id: session.user.id,
          name: session.user.email?.split("@")[0] ?? "User",
          email: session.user.email ?? "",
          phone: "",
          role: "intern",
          title: "Intern",
          joined: "",
        };
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role,name,team,manager_id,title,performance,reliability,growth,attendance,avatar_url,phone")
            .eq("id", session.user.id)
            .single();
          if (prof) {
            base.role = ROLES.includes(prof.role as Role) ? (prof.role as Role) : "intern";
            base.name = prof.name ?? base.name;
            base.title = prof.title ?? titleFor(prof.role);
            base.team = prof.team ?? undefined;
            base.managerId = prof.manager_id ?? undefined;
            base.performance = prof.performance ?? undefined;
            base.reliability = prof.reliability ?? undefined;
            base.growth = prof.growth ?? undefined;
            base.attendance = prof.attendance ?? undefined;
            base.avatarUrl = prof.avatar_url ?? undefined;
            base.phone = prof.phone ?? base.phone;
          }
        } catch {
          // no profile row yet — stays a clean intern
        }
        // Auto-link: if this email was added as a candidate, adopt their name.
        try {
          const em = session.user.email;
          const defaultName = (em ?? "").split("@")[0];
          if (em && (!base.name || base.name === defaultName)) {
            const { data: cands } = await supabase.from("candidates").select("name").ilike("email", em).limit(1);
            const candName = cands?.[0]?.name as string | undefined;
            if (candName) {
              base.name = candName;
              await supabase.from("profiles").update({ name: candName }).eq("id", session.user.id);
            }
          }
        } catch {}
        // Access gate (safe): elevated roles + admin allowlist always allowed; interns
        // must be on the candidate allowlist. Fail-open so no one is ever locked out.
        let allowed = true;
        try {
          const email = (session.user.email ?? "").toLowerCase();
          const adminList = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "founder@mjconsultancy.com")
            .toLowerCase()
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (base.role === "management" || base.role === "hr" || base.role === "lead") {
            allowed = true;
          } else if (email && adminList.includes(email)) {
            allowed = true;
          } else {
            const { data: cands, error } = await supabase.from("candidates").select("email");
            if (error) allowed = true; // can't read the allowlist (table missing) — don't lock anyone out
            else allowed = (cands ?? []).some((c: { email?: string }) => (c.email ?? "").toLowerCase() === email);
          }
        } catch {
          allowed = true;
        }
        if (active) {
          setDenied(!allowed);
          setPerson(base);
          setLoading(false);
        }
      } catch {
        if (active) {
          setPerson(null);
          setLoading(false);
        }
      }
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setPerson(null);
        setLoading(false);
      } else {
        load();
      }
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await createClient().auth.signOut();
    } catch {}
  };

  const updateUser = async (patch: Partial<Person>) => {
    setPerson((p) => (p ? { ...p, ...patch } : p));
    const id = person?.id;
    if (!id) return;
    try {
      const { updateProfile } = await import("@/lib/supabase/profiles");
      await updateProfile(id, { name: patch.name, title: patch.title, phone: patch.phone, avatarUrl: patch.avatarUrl });
    } catch {}
  };

  if (loading) return <BrandLoader />;
  if (denied) return <AccessDenied />;
  if (!person) return <SignInRequired />;

  return (
    <Ctx.Provider value={{ user: person, role: person.role, live: true, setRole: () => {}, logout, updateUser }}>
      {children}
    </Ctx.Provider>
  );
}

function BrandLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-offwhite">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-pulse">
          <Logo theme="light" size={44} />
        </div>
        <div className="h-1 w-32 overflow-hidden rounded-full bg-navy/10">
          <div className="h-full w-1/2 animate-[marquee_1.1s_linear_infinite] rounded-full bg-gradient-brand" />
        </div>
      </div>
    </div>
  );
}

function AccessDenied() {
  const signOut = async () => {
    try {
      await createClient().auth.signOut();
    } catch {}
    if (typeof window !== "undefined") window.location.href = "/login";
  };
  return (
    <div className="grid min-h-screen place-items-center bg-offwhite px-6">
      <div className="max-w-sm rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-xl font-bold text-navy">Access not authorized</h1>
        <p className="mt-2 text-sm text-slate-500">
          This email isn&apos;t on the approved list yet. Ask your MJ Nexus administrator to add you as a candidate, then sign in again.
        </p>
        <button
          onClick={signOut}
          className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(29,127,255,0.6)]"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function SignInRequired() {
  return (
    <div className="grid min-h-screen place-items-center bg-offwhite px-6">
      <div className="max-w-sm rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 flex justify-center">
          <Logo theme="light" size={40} />
        </div>
        <h1 className="text-xl font-bold text-navy">Please sign in</h1>
        <p className="mt-2 text-sm text-slate-500">
          You&apos;re not signed in (or your session ended). Sign in to access your workspace.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(29,127,255,0.6)]"
        >
          Go to sign in
        </Link>
      </div>
    </div>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function persistRole(r: Role) {
  try {
    localStorage.setItem(KEY, r);
  } catch {}
}
