"use client";

import { useState } from "react";
import { Plus, Send, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useWorkspace } from "@/components/dashboard/workspace-context";
import { burstConfetti } from "@/lib/confetti";
import { interns, type Task } from "@/lib/data";

const textareaClass =
  "w-full rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm text-navy outline-none transition-all placeholder:text-slate-400 focus:border-mjblue/50 focus:ring-4 focus:ring-mjblue/10";

export function NewTaskButton() {
  const { addTask } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState(interns[0].name);
  const [priority, setPriority] = useState<Task["priority"]>("Medium");
  const [tag, setTag] = useState("Growth");
  const [due, setDue] = useState("This week");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask({
      id: `t${Date.now()}`,
      title: title.trim(),
      assignee,
      status: "To Do",
      priority,
      due: due.trim() || "This week",
      tag: tag.trim() || "General",
    });
    toast({ title: "Task created", description: `“${title.trim()}” added to To Do.`, type: "success" });
    setTitle("");
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> New task
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create task"
        description="Add a task to the workspace board."
        icon={<ListChecks className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit}><Plus className="h-4 w-4" /> Create task</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Task title</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Draft August content calendar" className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Assignee</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={fieldClass}>
                {interns.map((n) => (
                  <option key={n.id}>{n.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])} className={fieldClass}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Tag</label>
              <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Growth" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Due</label>
              <input value={due} onChange={(e) => setDue(e.target.value)} placeholder="Jun 30" className={fieldClass} />
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function SubmitStandupButton() {
  const { addStandup } = useWorkspace();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState("");
  const [priorities, setPriorities] = useState("");
  const [challenges, setChallenges] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completed.trim()) return;
    addStandup({
      id: `s${Date.now()}`,
      intern: "Anurag Kumar",
      completed: completed.trim(),
      priorities: priorities.trim() || "—",
      challenges: challenges.trim() || "None",
      date: "Just now",
    });
    burstConfetti();
    toast({ title: "Standup submitted", description: "Your daily standup is posted to the feed.", type: "success" });
    setCompleted("");
    setPriorities("");
    setChallenges("");
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" /> Submit standup
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Daily standup"
        description="Share what you shipped, what's next, and any blockers."
        icon={<Sparkles className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit}><Send className="h-4 w-4" /> Submit</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>✅ Completed</label>
            <textarea autoFocus rows={2} value={completed} onChange={(e) => setCompleted(e.target.value)} placeholder="What did you finish today?" className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>🎯 Priorities</label>
            <textarea rows={2} value={priorities} onChange={(e) => setPriorities(e.target.value)} placeholder="What are you focusing on next?" className={textareaClass} />
          </div>
          <div>
            <label className={labelClass}>⚠️ Challenges</label>
            <textarea rows={2} value={challenges} onChange={(e) => setChallenges(e.target.value)} placeholder="Any blockers?" className={textareaClass} />
          </div>
        </form>
      </Modal>
    </>
  );
}
