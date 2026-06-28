"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useAuth } from "@/components/app/auth";
import { ROLE_META, type Role } from "@/lib/org";

export function RoleGate({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { role } = useAuth();
  if (allow.includes(role)) return <>{children}</>;

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-md rounded-3xl border border-navy/5 bg-white p-8 text-center shadow-card">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-500">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-navy">Access restricted</h2>
        <p className="mt-2 text-sm text-slate-500">
          This workspace is available to{" "}
          <span className="font-semibold text-navy">
            {allow.map((r) => ROLE_META[r].label).join(", ")}
          </span>
          . You're signed in as <span className="font-semibold text-navy">{ROLE_META[role].label}</span>.
        </p>
        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(29,127,255,0.6)]"
        >
          Back to my dashboard
        </Link>
      </div>
    </div>
  );
}
