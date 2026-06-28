"use client";

import { useState } from "react";
import { CalendarPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useInterviews } from "@/components/dashboard/interviews-context";
import { candidates, type Interview } from "@/lib/data";

const interviewers = ["Neha Kapoor", "Rahul Saxena", "Priya Menon"];
const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

export function ScheduleInterviewButton() {
  const { addInterview } = useInterviews();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [candidate, setCandidate] = useState(candidates[0].name);
  const [interviewer, setInterviewer] = useState(interviewers[0]);
  const [date, setDate] = useState(tomorrow);
  const [time, setTime] = useState("10:30 AM");
  const [mode, setMode] = useState<Interview["mode"]>("Video");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const role = candidates.find((c) => c.name === candidate)?.role ?? "Marketing";
    addInterview({
      id: `i${Date.now()}`,
      candidate,
      role,
      date,
      time,
      interviewer,
      mode,
      status: "Upcoming",
    });
    toast({
      title: "Interview scheduled",
      description: `${candidate} with ${interviewer} on ${date.slice(5)} at ${time}.`,
      type: "success",
    });
    setOpen(false);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => toast({ title: "Calendar synced", description: "Interview calendar is up to date.", type: "info" })}>
        <RefreshCw className="h-4 w-4" /> Sync calendar
      </Button>
      <Button size="sm" onClick={() => setOpen(true)}>
        <CalendarPlus className="h-4 w-4" /> Schedule
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Schedule interview"
        description="Auto-adds reminders and notifies the candidate."
        icon={<CalendarPlus className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submit}><CalendarPlus className="h-4 w-4" /> Schedule</Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Candidate</label>
            <select value={candidate} onChange={(e) => setCandidate(e.target.value)} className={fieldClass}>
              {candidates.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Interviewer</label>
            <select value={interviewer} onChange={(e) => setInterviewer(e.target.value)} className={fieldClass}>
              {interviewers.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Time</label>
              <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:30 AM" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Mode</label>
              <select value={mode} onChange={(e) => setMode(e.target.value as Interview["mode"])} className={fieldClass}>
                <option>Video</option>
                <option>In-person</option>
                <option>Phone</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
