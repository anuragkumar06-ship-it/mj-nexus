"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
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
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // isSupabaseConfigured() is a build-time constant, so this branch is stable.
  return isSupabaseConfigured() ? <LiveAuth>{children}</LiveAuth> : <DemoAuth>{children}</DemoAuth>;
}

/* ---------- Demo mode (no Supabase): role picker + switcher ---------- */
function DemoAuth({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("hr");
  useEffect(() => {
    try {
      const s = localStorage.getItem(KEY) as Role | null;
      if (s && ROLES.includes(s)) setRoleState(s);
    } catch {}
  }, []);
  const setRole = (r: Role) => {
    setRoleState(r);
    try {
      localStorage.setItem(KEY, r);
    } catch {}
  };
  const logout = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {}
  };
  const user = personById(ROLE_IDENTITY[role])!;
  return <Ctx.Provider value={{ user, role, live: false, setRole, logout }}>{children}</Ctx.Provider>;
}

/* ---------- Live mode (Supabase): real session + role from profile ---------- */
function LiveAuth({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<Role | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) {
          if (active) {
            setRole(null);
            setLoading(false);
          }
          return;
        }
        let r: Role = "intern";
        let nm = session.user.email ?? "User";
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("role, name")
            .eq("id", session.user.id)
            .single();
          if (prof?.role && ROLES.includes(prof.role as Role)) r = prof.role as Role;
          if (prof?.name) nm = prof.name as string;
        } catch {
          // profile missing / RLS — safe default to intern
        }
        if (active) {
          setRole(r);
          setName(nm);
          setEmail(session.user.email ?? "");
          setLoading(false);
        }
      } catch {
        if (active) {
          setRole("intern");
          setLoading(false);
        }
      }
    };

    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setRole(null);
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

  if (loading) return <BrandLoader />;
  if (!role) return <SignInRequired />;

  const persona = personById(ROLE_IDENTITY[role])!;
  const user: Person = { ...persona, name: name || persona.name, email: email || persona.email };

  return (
    <Ctx.Provider value={{ user, role, live: true, setRole: () => {}, logout }}>
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

/** Persist the chosen role in demo mode (ignored in live mode). */
export function persistRole(r: Role) {
  try {
    localStorage.setItem(KEY, r);
  } catch {}
}
