"use client";

import { useState } from "react";
import {
  BookOpen,
  GraduationCap,
  PlayCircle,
  Trophy,
  Plus,
  Search,
  Trash2,
  CheckCircle2,
  FileText,
  Loader2,
} from "lucide-react";
import { RoleGate } from "@/components/app/role-gate";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardHeader, Badge } from "@/components/ui/card";
import { Reveal } from "@/components/shared/reveal";
import { SpotlightCard } from "@/components/shared/spotlight-card";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { LearningProvider, useLearning, type LearningItem } from "@/components/dashboard/learning-context";
import { VideoPlayer } from "@/components/dashboard/video-player";
import { type LearningType, type LearningLevel } from "@/lib/learning";
import { burstConfetti } from "@/lib/confetti";
import { cn } from "@/lib/utils";

const TYPE_ICON: Record<LearningType, typeof PlayCircle> = {
  Video: PlayCircle,
  Article: FileText,
  Course: GraduationCap,
  Doc: BookOpen,
};

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";

function LearningHub() {
  const { items, categories, addResource, removeResource, setProgress } = useLearning();
  const { role } = useAuth();
  const { toast } = useToast();
  const canManage = role === "management" || role === "lead";

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [folderFilter, setFolderFilter] = useState("All");
  const [addOpen, setAddOpen] = useState(false);
  const [player, setPlayer] = useState<LearningItem | null>(null);
  const [f, setF] = useState<{ title: string; description: string; type: LearningType; url: string; category: string; folder: string; level: LearningLevel }>({
    title: "",
    description: "",
    type: "Video",
    url: "",
    category: "",
    folder: "",
    level: "Beginner",
  });

  const folders = Array.from(new Set(items.map((i) => i.folder).filter(Boolean))) as string[];

  const filtered = items.filter(
    (it) =>
      (cat === "All" || it.category === cat) &&
      (folderFilter === "All" || it.folder === folderFilter) &&
      (!q.trim() || `${it.title} ${it.description} ${it.category} ${it.folder ?? ""}`.toLowerCase().includes(q.toLowerCase()))
  );

  const completed = items.filter((i) => i.progress >= 100).length;
  const inProgress = items.filter((i) => i.progress > 0 && i.progress < 100).length;
  const avg = items.length ? Math.round(items.reduce((s, i) => s + i.progress, 0) / items.length) : 0;

  const doAdd = () => {
    if (!f.title.trim()) {
      toast({ title: "Add a title", type: "error" });
      return;
    }
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `lr${Date.now()}`;
    addResource({
      id,
      title: f.title.trim(),
      description: f.description.trim(),
      type: f.type,
      url: f.url.trim(),
      category: f.category.trim() || "General",
      folder: f.folder.trim() || undefined,
      level: f.level,
    });
    toast({ title: "Resource added", description: `${f.title.trim()} is now in the Learning Hub.`, type: "success" });
    setF({ title: "", description: "", type: "Video", url: "", category: "", folder: "", level: "Beginner" });
    setAddOpen(false);
  };

  const watch = (it: LearningItem) => {
    if (!it.url) {
      toast({ title: "No link attached", description: "This material has no video or link to play.", type: "error" });
      return;
    }
    setPlayer(it);
  };
  const complete = (it: LearningItem) => {
    const done = it.progress >= 100;
    setProgress(it.id, done ? 0 : 100);
    if (!done) {
      burstConfetti();
      toast({ title: "Marked complete 🎉", description: it.title, type: "success" });
    }
  };
  const remove = (it: LearningItem) => {
    if (typeof window !== "undefined" && !window.confirm(`Remove "${it.title}" from the Learning Hub?`)) return;
    removeResource(it.id);
    toast({ title: "Removed", description: it.title, type: "info" });
  };

  const stats = [
    { label: "Materials", value: items.length, icon: BookOpen },
    { label: "Completed", value: completed, icon: Trophy },
    { label: "In progress", value: inProgress, icon: Loader2 },
    { label: "My progress", value: `${avg}%`, icon: PlayCircle },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Learning"
        title="Learning Hub"
        description="Curated videos and training materials — your progress is tracked toward your growth index."
        actions={canManage ? <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add material</Button> : undefined}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Reveal key={s.label} delay={0.05 * i}>
              <Card>
                <Icon className="h-5 w-5 text-mjblue" />
                <p className="mt-3 text-2xl font-bold text-navy">{s.value}</p>
                <p className="text-sm text-slate-500">{s.label}</p>
              </Card>
            </Reveal>
          );
        })}
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search materials…"
            className="h-10 w-full rounded-xl border border-navy/8 bg-white pl-10 pr-4 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/40 focus:ring-4 focus:ring-mjblue/10"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {folders.length > 0 && (
            <select value={folderFilter} onChange={(e) => setFolderFilter(e.target.value)} className="h-9 rounded-full border border-navy/8 bg-white px-3 text-sm font-semibold text-navy/70 outline-none transition-colors focus:border-mjblue/40">
              <option value="All">All folders</option>
              {folders.map((fl) => <option key={fl} value={fl}>{fl}</option>)}
            </select>
          )}
          {["All", ...categories].map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-semibold transition-all",
                cat === c ? "bg-navy text-white shadow-card" : "border border-navy/8 bg-white text-navy/60 hover:text-navy"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-mjblue-50 text-mjblue"><GraduationCap className="h-7 w-7" /></div>
            <h3 className="text-lg font-bold text-navy">No learning materials yet</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              {canManage ? "Add your first video or training material so your team can start learning." : "Your team hasn't added materials yet — check back soon."}
            </p>
            {canManage && <Button size="sm" className="mt-5" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" /> Add material</Button>}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card><p className="py-12 text-center text-sm text-slate-400">No materials match your search.</p></Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it, i) => {
            const Icon = TYPE_ICON[it.type] ?? BookOpen;
            const done = it.progress >= 100;
            return (
              <Reveal key={it.id} delay={(i % 3) * 0.08}>
                <SpotlightCard className="gradient-ring flex h-full flex-col rounded-3xl border border-navy/5 bg-white p-6 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand text-white"><Icon className="h-6 w-6" /></span>
                    <div className="flex items-center gap-1.5">
                      <Badge tone="navy">{it.level}</Badge>
                      {canManage && (
                        <button onClick={() => remove(it)} className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Remove material">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-mjblue-50 px-1.5 py-0.5 text-[10px] font-semibold text-mjblue-700">{it.type}</span>
                    <span className="text-[11px] font-medium text-slate-400">{it.category}</span>
                    {it.folder && <span className="rounded-md bg-navy/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-navy/60">📁 {it.folder}</span>}
                  </div>
                  <h3 className="mt-2 text-lg font-semibold leading-snug tracking-tight text-navy">{it.title}</h3>
                  {it.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{it.description}</p>}

                  <div className="mt-4">
                    <div className="mb-1 flex justify-between text-xs"><span className="text-slate-500">Progress</span><span className="font-semibold text-navy">{it.progress}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-navy/[0.06]"><div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500" style={{ width: `${it.progress}%` }} /></div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => watch(it)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy/5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-navy/10"
                    >
                      <PlayCircle className="h-4 w-4" /> {it.progress > 0 ? "Resume" : "Watch"}
                    </button>
                    <button
                      onClick={() => complete(it)}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all",
                        done ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-gradient-brand text-white hover:scale-[1.02]"
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" /> {done ? "Completed" : "Complete"}
                    </button>
                  </div>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      )}

      {/* Add material modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add learning material"
        description="Add a video, course or document for your team."
        icon={<Plus className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={doAdd}><Plus className="h-4 w-4" /> Add material</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div><label className={labelClass}>Title</label><input autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Intro to Performance Marketing" className={fieldClass} /></div>
          <div><label className={labelClass}>Link (YouTube, article, doc…)</label><input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://…" className={fieldClass} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelClass}>Type</label><select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as LearningType })} className={fieldClass}><option>Video</option><option>Article</option><option>Course</option><option>Doc</option></select></div>
            <div><label className={labelClass}>Level</label><select value={f.level} onChange={(e) => setF({ ...f, level: e.target.value as LearningLevel })} className={fieldClass}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
          </div>
          <div><label className={labelClass}>Category</label><input value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} placeholder="e.g. Marketing, Sales, Branding" className={fieldClass} /></div>
          <div>
            <label className={labelClass}>Folder <span className="font-normal text-slate-400">(optional — group related materials)</span></label>
            <input value={f.folder} onChange={(e) => setF({ ...f, folder: e.target.value })} placeholder="e.g. Marketing Foundations" list="mj-learning-folders" className={fieldClass} />
            <datalist id="mj-learning-folders">{folders.map((fl) => <option key={fl} value={fl} />)}</datalist>
          </div>
          <div><label className={labelClass}>Description <span className="font-normal text-slate-400">(optional)</span></label><textarea rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What will they learn?" className={textareaClass} /></div>
        </div>
      </Modal>

      <VideoPlayer
        open={!!player}
        url={player?.url ?? ""}
        title={player?.title ?? ""}
        initialProgress={player?.progress ?? 0}
        onProgress={(p) => {
          if (player) setProgress(player.id, Math.max(player.progress, p));
        }}
        onComplete={() => {
          if (player) {
            setProgress(player.id, 100);
            burstConfetti();
            toast({ title: "Marked complete 🎉", description: player.title, type: "success" });
          }
          setPlayer(null);
        }}
        onClose={() => setPlayer(null)}
      />
    </>
  );
}

export default function LearningPage() {
  return (
    <RoleGate allow={["intern", "lead", "hr", "management"]}>
      <LearningProvider>
        <LearningHub />
      </LearningProvider>
    </RoleGate>
  );
}
