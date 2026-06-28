"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ROLE_IDENTITY, personById, type Person, type Role } from "@/lib/org";

const KEY = "mj_nexus_role";
const ROLES: Role[] = ["intern", "lead", "hr", "management"];

interface AuthCtx {
  user: Person;
  role: Role;
  setRole: (r: Role) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>("hr");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Role | null;
      if (saved && ROLES.includes(saved)) setRoleState(saved);
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

  return <Ctx.Provider value={{ user, role, setRole, logout }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/** Persist the chosen role from outside the dashboard tree (e.g. the login page). */
export function persistRole(r: Role) {
  try {
    localStorage.setItem(KEY, r);
  } catch {}
}
