"use client";

import { useAuth } from "@/components/app/auth";
import { ROLE_META, initials } from "@/lib/org";

export function Greeting({ subtitle }: { subtitle?: string }) {
  const { user, role } = useAuth();
  const first = user.name.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-navy p-6 grain sm:p-7">
      <div className="absolute inset-0 grid-dark opacity-50" />
      <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-mjblue/25 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.name} className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/15" />
          ) : (
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-lg font-bold text-white ring-1 ring-white/15">
              {initials(user.name)}
            </div>
          )}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {ROLE_META[role].label} workspace
            </span>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {first} 👋
            </h1>
            <p className="mt-1 text-sm text-white/60">{subtitle ?? ROLE_META[role].tagline}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
