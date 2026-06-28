"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Users,
  UserCog,
  Crown,
  GraduationCap,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { AuroraBackground } from "@/components/shared/aurora-background";
import { useToast } from "@/components/ui/toast";
import { ROLE_META, ROLE_IDENTITY, personById, initials, type Role } from "@/lib/org";
import { persistRole } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;
const roleList: { id: Role; icon: typeof Users }[] = [
  { id: "intern", icon: GraduationCap },
  { id: "lead", icon: UserCog },
  { id: "hr", icon: Users },
  { id: "management", icon: Crown },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const live = isSupabaseConfigured();

  const [role, setRole] = useState<Role>("hr");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const person = personById(ROLE_IDENTITY[role])!;
  const meta = ROLE_META[role];

  // Demo mode: prefill the demo credentials so it's one click. Live mode: stay empty.
  useEffect(() => {
    if (!live) {
      setEmail(person.email);
      setPassword("demo-password");
    }
  }, [person.email, live]);

  const demoFinish = (label: string) => {
    setLoading(true);
    persistRole(role);
    toast({ title: `Signed in via ${label}`, description: `Welcome, ${person.name} (${meta.label}).`, type: "success" });
    setTimeout(() => router.push("/dashboard"), 600);
  };

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!live) return demoFinish("email");
    if (!email.trim() || !password) {
      toast({ title: "Enter your email and password", type: "error" });
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const signIn = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (signIn.error) {
        // New user? create the account. Existing user + wrong password surfaces a clear error.
        if (/invalid login credentials/i.test(signIn.error.message)) {
          const signUp = await supabase.auth.signUp({ email: email.trim(), password });
          if (signUp.error) {
            toast({ title: "Sign-in failed", description: signUp.error.message, type: "error" });
            setLoading(false);
            return;
          }
        } else {
          toast({ title: "Sign-in failed", description: signIn.error.message, type: "error" });
          setLoading(false);
          return;
        }
      }
      toast({ title: "Signed in", description: "Welcome back to MJ Nexus.", type: "success" });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast({ title: "Sign-in error", description: String(err), type: "error" });
      setLoading(false);
    }
  };

  const google = async () => {
    if (!live) return demoFinish("Google");
    try {
      await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } catch (err) {
      toast({ title: "Google sign-in error", description: String(err), type: "error" });
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <AuroraBackground variant="navy" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <Link href="/"><Logo theme="dark" size={40} /></Link>
          <div className="max-w-md">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }} className="text-4xl font-bold leading-tight tracking-tight text-white">
              One platform. <span className="text-gradient-animated-light">Four roles.</span>
            </motion.h1>
            <p className="mt-4 text-lg leading-relaxed text-white/65">The premium workspace for MJ Marketing Consultancy — recruitment, internships, performance, and growth, all in one place.</p>

            {!live && (
              <AnimatePresence mode="wait">
                <motion.div key={role} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="glass-dark mt-10 flex items-center gap-4 rounded-2xl p-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-brand text-sm font-bold text-white">{initials(person.name)}</div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-sky-200">Demo — you&apos;ll enter as</p>
                    <p className="truncate font-semibold text-white">{person.name}</p>
                    <p className="truncate text-xs text-white/55">{person.title} · {meta.label}</p>
                  </div>
                  <ShieldCheck className="h-5 w-5 text-sky" />
                </motion.div>
              </AnimatePresence>
            )}
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} MJ Marketing Consultancy</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex items-center justify-center bg-offwhite px-6 py-12">
        <AuroraBackground variant="light" />
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease }} className="relative z-10 w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo theme="light" size={40} /></div>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-navy">Sign in to MJ Nexus</h2>
            <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset", live ? "bg-emerald-50 text-emerald-600 ring-emerald-500/20" : "bg-amber-50 text-amber-600 ring-amber-500/20")}>
              {live ? "Live" : "Demo"}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            {live ? "Sign in with your work email or Google to access your workspace." : "Pick a role to preview, then continue — credentials are prefilled."}
          </p>

          {/* Role selection (demo only — in live, your role comes from your account) */}
          {!live && (
            <div className="mt-6">
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Preview as role</p>
              <div className="grid grid-cols-2 gap-2.5">
                {roleList.map((r) => {
                  const Icon = r.icon;
                  const active = role === r.id;
                  return (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)} className={cn("group relative flex items-center gap-2.5 rounded-2xl border p-3 text-left transition-all duration-300", active ? "border-mjblue/40 bg-mjblue-50 shadow-[0_8px_24px_-12px_rgba(29,127,255,0.5)]" : "border-navy/8 bg-white hover:border-mjblue/25")}>
                      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors", active ? "bg-gradient-brand text-white" : "bg-navy/5 text-navy/60")}><Icon className="h-5 w-5" /></span>
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-navy">{ROLE_META[r.id].label}</p><p className="truncate text-[11px] text-slate-500">{ROLE_META[r.id].tagline}</p></div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email + password */}
          <form onSubmit={onEmail} className="mt-6 space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={live ? "you@company.com" : "demo@mjnexus.com"} className="h-12 w-full rounded-2xl border border-navy/10 bg-white pl-10 pr-4 text-sm text-navy outline-none focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type={show ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 w-full rounded-2xl border border-navy/10 bg-white pl-10 pr-11 text-sm text-navy outline-none focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10" />
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="shine flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand font-semibold text-white shadow-[0_10px_30px_-8px_rgba(29,127,255,0.6)] transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-70">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{live ? "Sign in" : `Continue as ${meta.label}`} <ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-navy/10" />
            <span className="text-xs font-medium text-slate-400">or</span>
            <div className="h-px flex-1 bg-navy/10" />
          </div>

          {/* Google */}
          <button onClick={google} disabled={loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-navy/10 bg-white text-sm font-semibold text-navy transition-colors hover:bg-navy/[0.03] disabled:opacity-70">
            <GoogleMark /> Continue with Google
          </button>

          <p className="mt-7 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5" /> {live ? "Secure, role-based access · Supabase Auth" : "Demo mode · add Supabase keys to go live"}
          </p>
        </motion.div>
      </div>
    </main>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}
