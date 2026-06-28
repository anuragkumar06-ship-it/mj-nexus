"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Save, Mail, Phone, Users, CalendarDays, Gauge, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "@/components/shared/charts";
import { Avatar } from "@/components/shared/avatar";
import { useAuth } from "@/components/app/auth";
import { usePeople } from "@/components/app/people";
import { useToast } from "@/components/ui/toast";
import { uploadFile } from "@/lib/supabase/storage";
import { ROLE_META } from "@/lib/org";

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-navy/5 bg-offwhite/60 px-3 py-2.5">
      <span className="text-mjblue">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-400">{label}</p>
        <p className="truncate text-sm font-medium text-navy">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-navy/10 bg-white px-3.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10"
      />
    </div>
  );
}

export default function ProfilePage() {
  const { user, role, updateUser } = useAuth();
  const { personById } = usePeople();
  const { toast } = useToast();

  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title);
  const [phone, setPhone] = useState(user.phone);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const manager = user.managerId ? personById(user.managerId) : undefined;
  const dirty = name !== user.name || title !== user.title || phone !== user.phone;
  const hasStats = user.performance != null || user.reliability != null;

  const onPick = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Pick an image", type: "error" });
      return;
    }
    setUploading(true);
    try {
      const att = await uploadFile(file);
      if (att.url) {
        await updateUser({ avatarUrl: att.url });
        toast({ title: "Photo updated", type: "success" });
      } else {
        toast({ title: "Upload failed", description: "Try a smaller image.", type: "error" });
      }
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateUser({ name: name.trim() || user.name, title: title.trim(), phone: phone.trim() });
      toast({ title: "Profile saved", description: "Your details were updated.", type: "success" });
    } finally {
      setSaving(false);
    }
  };

  const removePhoto = async () => {
    await updateUser({ avatarUrl: "" });
    toast({ title: "Photo removed", type: "info" });
  };

  return (
    <>
      <PageHeader eyebrow="Account" title="Profile Settings" description="Manage your photo and details, and see your role, team and stats." />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity */}
        <Card className="lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <Avatar name={user.name} url={user.avatarUrl} className="h-28 w-28" textClassName="text-3xl" />
              <button onClick={() => fileRef.current?.click()} className="absolute bottom-0 right-0 grid h-9 w-9 place-items-center rounded-full bg-gradient-brand text-white shadow-card ring-2 ring-white" aria-label="Change photo">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPick(e.target.files?.[0])} />
            </div>
            <p className="mt-4 text-lg font-bold text-navy">{user.name}</p>
            <p className="text-sm text-slate-500">{user.title}</p>
            <div className="mt-2"><Badge tone="blue">{ROLE_META[role].label}</Badge></div>
            {user.avatarUrl && (
              <button onClick={removePhoto} className="mt-3 text-xs font-semibold text-slate-400 transition-colors hover:text-rose-600">Remove photo</button>
            )}

            <div className="mt-5 w-full space-y-2 text-left">
              <Row icon={<Mail className="h-4 w-4" />} label="Email" value={user.email || "—"} />
              {user.phone && <Row icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />}
              {user.team && <Row icon={<Users className="h-4 w-4" />} label="Team" value={user.team} />}
              {manager && <Row icon={<ShieldCheck className="h-4 w-4" />} label="Reports to" value={manager.name} />}
              {user.joined && <Row icon={<CalendarDays className="h-4 w-4" />} label="Member since" value={user.joined} />}
              {(user.internStart || user.internEnd) && (
                <Row icon={<CalendarDays className="h-4 w-4" />} label="Internship" value={`${user.internStart ?? "—"} → ${user.internEnd ?? "—"}`} />
              )}
            </div>
          </div>
        </Card>

        {/* Editable details + stats */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Edit details" subtitle="Update how you appear across MJ Nexus" icon={<Save className="h-5 w-5" />} />
            <div className="space-y-4">
              <Field label="Full name" value={name} onChange={setName} placeholder="Your name" />
              <Field label="Title / headline" value={title} onChange={setTitle} placeholder="e.g. Marketing Intern" />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 …" />
              <div className="flex justify-end">
                <Button size="sm" onClick={save} disabled={!dirty || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
                </Button>
              </div>
            </div>
          </Card>

          {hasStats && (
            <Card>
              <CardHeader title="Your indices" subtitle="As tracked by your team" icon={<Gauge className="h-5 w-5" />} />
              <div className="space-y-3">
                <ScoreBar label="Performance" value={user.performance ?? 0} />
                <ScoreBar label="Reliability" value={user.reliability ?? 0} />
                <ScoreBar label="Growth" value={user.growth ?? 0} />
                <ScoreBar label="Attendance" value={user.attendance ?? 0} />
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
