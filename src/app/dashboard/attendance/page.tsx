"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Check, Clock, Users, Gauge } from "lucide-react";
import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { useApp } from "@/components/app/store";
import { usePeople } from "@/components/app/people";
import { AttendanceProvider, useAttendance } from "@/components/dashboard/attendance-context";
import { cn } from "@/lib/utils";

const todayStr = () => new Date().toISOString().slice(0, 10);
function windowDays(offset: number) {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 30 * offset - (29 - i));
    return d.toISOString().slice(0, 10);
  });
}
const STATUS_TONE: Record<string, string> = {
  Present: "bg-emerald-400",
  Leave: "bg-amber-400",
  Absent: "bg-rose-300",
  "—": "bg-navy/10",
};

function AttendanceView() {
  const { user, role } = useAuth();
  const { requests } = useApp();
  const { reportsOf, internsAll, personById } = usePeople();
  const { records, markToday, minPct, setMinPct } = useAttendance();
  const { toast } = useToast();
  const isManagement = role === "management";
  const [pctInput, setPctInput] = useState(minPct);
  useEffect(() => setPctInput(minPct), [minPct]);

  const today = todayStr();
  const recent = windowDays(0);
  const [offset, setOffset] = useState(0);
  const viewDays = windowDays(offset);
  const approvedLeaves = requests.filter((r) => r.status === "Approved" && r.fromDate && r.toDate);
  const presentSet = new Set(records.filter((r) => r.status === "Present").map((r) => `${r.userId}_${r.date}`));

  const onLeave = (userId: string, date: string) => approvedLeaves.some((r) => r.requesterId === userId && date >= (r.fromDate as string) && date <= (r.toDate as string));
  const statusFor = (userId: string, date: string): "Present" | "Leave" | "Absent" | "—" => {
    if (presentSet.has(`${userId}_${date}`)) return "Present";
    if (onLeave(userId, date)) return "Leave";
    if (date < today) return "Absent";
    return "—";
  };
  const presentCount = (userId: string) => recent.filter((d) => statusFor(userId, d) === "Present").length;
  const leaveCount = (userId: string) => recent.filter((d) => statusFor(userId, d) === "Leave").length;
  const rate = (userId: string) => Math.round((presentCount(userId) / recent.length) * 100);
  const meets = (userId: string) => rate(userId) >= minPct;

  const myToday = statusFor(user.id, today);
  const checkedIn = presentSet.has(`${user.id}_${today}`);
  const myCheckIn = records.find((r) => r.id === `${user.id}_${today}`)?.checkIn;

  const team = role === "management" ? internsAll() : role === "lead" || role === "hr" ? reportsOf(user.id) : [];

  const doCheckIn = () => {
    markToday();
    toast({ title: "Checked in ✓", description: "Marked present for today.", type: "success" });
  };

  return (
    <>
      <PageHeader eyebrow="Attendance" title="Attendance" description="Mark your attendance, track your record, and see approved leaves reflected automatically." />

      {isManagement && (
        <Card className="mb-6">
          <CardHeader title="Attendance policy" subtitle="Set the minimum attendance interns must maintain — management only" icon={<Gauge className="h-5 w-5" />} />
          <div className="flex flex-wrap items-center gap-3">
            <input type="number" min={0} max={100} value={pctInput} onChange={(e) => setPctInput(Number(e.target.value))} className="h-11 w-24 rounded-xl border border-navy/10 bg-white px-3 text-sm font-semibold text-navy outline-none transition-all focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10" />
            <span className="text-sm text-slate-500">% minimum attendance</span>
            <Button size="sm" onClick={() => { const v = Math.max(0, Math.min(100, Math.round(pctInput || 0))); setMinPct(v); toast({ title: "Policy updated", description: `Minimum attendance set to ${v}%.`, type: "success" }); }}>Set policy</Button>
          </div>
        </Card>
      )}

      {/* Today + my record */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader title="Today" subtitle={new Date().toDateString()} icon={<CalendarCheck className="h-5 w-5" />} />
          {checkedIn ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
              <Check className="mx-auto h-7 w-7 text-emerald-600" />
              <p className="mt-2 text-sm font-semibold text-navy">You&apos;re marked present</p>
              {myCheckIn && <p className="text-xs text-slate-500">Checked in at {myCheckIn}</p>}
            </div>
          ) : myToday === "Leave" ? (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-center">
              <CalendarCheck className="mx-auto h-7 w-7 text-amber-600" />
              <p className="mt-2 text-sm font-semibold text-navy">On approved leave today</p>
            </div>
          ) : (
            <button onClick={doCheckIn} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand py-4 text-sm font-semibold text-white shadow-card transition-transform hover:scale-[1.01]">
              <Clock className="h-4 w-4" /> Check in for today
            </button>
          )}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-navy/5 bg-offwhite/60 p-3 text-center"><p className="text-2xl font-bold text-navy">{rate(user.id)}%</p><p className="text-xs text-slate-500">Attendance (30d)</p></div>
            <div className="rounded-xl border border-navy/5 bg-offwhite/60 p-3 text-center"><p className="text-2xl font-bold text-navy">{leaveCount(user.id)}</p><p className="text-xs text-slate-500">Leave days (30d)</p></div>
          </div>
          {isManagement ? (
            <p className="mt-3 text-center text-[11px] text-slate-400">Management has no attendance requirement.</p>
          ) : (
            <p className={cn("mt-3 rounded-xl py-2 text-center text-xs font-semibold", meets(user.id) ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
              Requirement {minPct}% · {meets(user.id) ? "On track ✓" : "Below minimum"}
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="My attendance"
            subtitle={`${viewDays[0]} → ${viewDays[viewDays.length - 1]}`}
            icon={<CalendarCheck className="h-5 w-5" />}
            action={
              <div className="flex items-center gap-1.5">
                <button onClick={() => setOffset((o) => o + 1)} className="grid h-7 w-7 place-items-center rounded-lg border border-navy/10 bg-white text-navy/60 transition-colors hover:text-navy" aria-label="Earlier 30 days">‹</button>
                <span className="min-w-[60px] text-center text-[11px] text-slate-400">{offset === 0 ? "This month" : `${offset} mo ago`}</span>
                <button onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} className="grid h-7 w-7 place-items-center rounded-lg border border-navy/10 bg-white text-navy/60 transition-colors hover:text-navy disabled:opacity-40" aria-label="Later 30 days">›</button>
              </div>
            }
          />
          <div className="flex flex-wrap gap-1.5">
            {viewDays.map((d) => {
              const st = statusFor(user.id, d);
              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div className={cn("h-8 w-8 rounded-lg", STATUS_TONE[st], d > today && "opacity-30")} title={`${d} · ${st}`} />
                  <span className="text-[9px] text-slate-400">{d.slice(8)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Present</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Leave</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-rose-300" /> Absent</span>
            </div>
            <span className="font-medium text-navy">
              {viewDays.filter((d) => statusFor(user.id, d) === "Present").length} present · {viewDays.filter((d) => statusFor(user.id, d) === "Leave").length} leave
            </span>
          </div>
        </Card>
      </div>

      {/* Team attendance */}
      {team.length > 0 && (
        <Card className="mt-6">
          <CardHeader title="Team attendance" subtitle={role === "management" ? "All interns" : "Your reports"} icon={<Users className="h-5 w-5" />} action={<Badge tone="navy">{team.length}</Badge>} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy/5 text-xs uppercase tracking-wider text-slate-400">
                  <th className="pb-3 font-semibold">Person</th>
                  <th className="pb-3 font-semibold">Today</th>
                  <th className="pb-3 font-semibold">Last 30 days</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 text-right font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {team.map((p) => {
                  const st = statusFor(p.id, today);
                  return (
                    <tr key={p.id} className="border-b border-navy/[0.04] last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={p.name} url={p.avatarUrl} className="h-8 w-8" textClassName="text-[10px]" />
                          <div><p className="font-medium text-navy">{p.name}</p><p className="text-xs text-slate-400">{p.title}</p></div>
                        </div>
                      </td>
                      <td className="py-3"><Badge tone={st === "Present" ? "green" : st === "Leave" ? "amber" : st === "Absent" ? "red" : "navy"}>{st === "—" ? "Pending" : st}</Badge></td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          {recent.map((d) => <span key={d} className={cn("h-4 w-1.5 rounded-sm", STATUS_TONE[statusFor(p.id, d)])} title={`${d} · ${statusFor(p.id, d)}`} />)}
                        </div>
                      </td>
                      <td className="py-3"><Badge tone={meets(p.id) ? "green" : "red"}>{meets(p.id) ? "On track" : `Below ${minPct}%`}</Badge></td>
                      <td className="py-3 text-right font-bold text-navy tabular-nums">{rate(p.id)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </>
  );
}

export default function AttendancePage() {
  return (
    <RoleGate allow={["intern", "lead", "hr", "management"]}>
      <AttendanceProvider>
        <AttendanceView />
      </AttendanceProvider>
    </RoleGate>
  );
}
