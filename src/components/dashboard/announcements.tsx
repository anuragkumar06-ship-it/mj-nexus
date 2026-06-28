"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/app/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { ANNOUNCEMENT_SEED, type Announcement } from "@/lib/announcements";

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";
const uuid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `a${Date.now()}`);

export function AnnouncementsBanner() {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const live = isSupabaseConfigured();
  const canPost = role === "management";

  const [items, setItems] = useState<Announcement[]>(live ? [] : ANNOUNCEMENT_SEED);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (!live) return;
    let unsub = () => {};
    (async () => {
      try {
        const m = await import("@/lib/supabase/announcements-data");
        setItems(await m.loadAnnouncements());
        unsub = m.subscribeAnnouncements((type, obj) =>
          setItems((prev) => {
            if (type === "DELETE") return prev.filter((a) => a.id !== (obj as { id: string }).id);
            const o = obj as Announcement;
            const i = prev.findIndex((a) => a.id === o.id);
            if (i >= 0) {
              const c = [...prev];
              c[i] = o;
              return c;
            }
            return [o, ...prev];
          })
        );
      } catch {
        // DB unavailable - stay clean
      }
    })();
    return () => unsub();
  }, [live]);

  const post = () => {
    if (!title.trim()) {
      toast({ title: "Add a title", type: "error" });
      return;
    }
    const a: Announcement = { id: uuid(), title: title.trim(), body: body.trim(), authorId: user.id, authorName: user.name, createdAt: "Just now" };
    setItems((prev) => [a, ...prev]);
    if (live) import("@/lib/supabase/announcements-data").then((m) => m.insertAnnouncement(a)).catch(() => {});
    toast({ title: "Announcement posted", description: "Everyone in your organization will see it.", type: "success" });
    setTitle("");
    setBody("");
    setOpen(false);
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((a) => a.id !== id));
    if (live) import("@/lib/supabase/announcements-data").then((m) => m.deleteAnnouncement(id)).catch(() => {});
  };

  if (items.length === 0 && !canPost) return null;

  return (
    <Card>
      <CardHeader
        title="Announcements"
        subtitle="From management"
        icon={<Megaphone className="h-5 w-5" />}
        action={canPost ? <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Post</Button> : undefined}
      />
      {items.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No announcements yet{canPost ? " - post the first one." : "."}</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 4).map((a) => (
            <div key={a.id} className="rounded-2xl border border-navy/5 bg-offwhite/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy">{a.title}</p>
                  {a.body && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-600">{a.body}</p>}
                  <p className="mt-1.5 text-[11px] text-slate-400">{a.authorName} · {a.createdAt}</p>
                </div>
                {canPost && (
                  <button onClick={() => remove(a.id)} className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label="Delete announcement">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Post an announcement"
        description="This is shown to everyone in your organization."
        icon={<Megaphone className="h-5 w-5" />}
        footer={<><Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button><Button size="sm" onClick={post}><Plus className="h-4 w-4" /> Post</Button></>}
      >
        <div className="space-y-4">
          <div><label className={labelClass}>Title</label><input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Town hall on Friday" className={fieldClass} /></div>
          <div><label className={labelClass}>Message <span className="font-normal text-slate-400">(optional)</span></label><textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Share the details…" className={textareaClass} /></div>
        </div>
      </Modal>
    </Card>
  );
}
