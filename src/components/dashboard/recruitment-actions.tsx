"use client";

import { useState } from "react";
import { Plus, Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal, fieldClass, labelClass } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { useRecruitment } from "@/components/dashboard/recruitment-context";
import { downloadFile } from "@/lib/utils";
import { burstConfetti } from "@/lib/confetti";
import type { Candidate, Role } from "@/lib/data";

export function AddCandidateButton() {
  const { addCandidate } = useRecruitment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("Marketing");
  const [college, setCollege] = useState("");
  const [state, setState] = useState("");
  const [source, setSource] = useState<Candidate["source"]>("LinkedIn");
  const [skills, setSkills] = useState("");

  const reset = () => {
    setName("");
    setRole("Marketing");
    setCollege("");
    setState("");
    setSource("LinkedIn");
    setSkills("");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const c: Candidate = {
      id: `c${Date.now()}`,
      name: name.trim(),
      role,
      college: college.trim() || "—",
      state: state.trim() || "—",
      source,
      stage: "Applied",
      fitScore: Math.round(68 + Math.random() * 28),
      appliedDate: new Date().toISOString().slice(0, 10),
      experience: "Fresher",
      skills: skills.trim()
        ? skills.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 5)
        : ["General"],
      email: `${name.trim().toLowerCase().replace(/\s+/g, ".")}@example.com`,
    };
    addCandidate(c);
    burstConfetti();
    toast({
      title: "Candidate added",
      description: `${c.name} was added to the Applied stage with a ${c.fitScore} AI fit score.`,
      type: "success",
    });
    reset();
    setOpen(false);
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add candidate
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add candidate"
        description="Create a new candidate in the Applied stage."
        icon={<UserPlus className="h-5 w-5" />}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={submit}>
              <Plus className="h-4 w-4" /> Add candidate
            </Button>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>Full name</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className={fieldClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={fieldClass}>
                <option>Marketing</option>
                <option>Sales</option>
                <option>HR</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as Candidate["source"])}
                className={fieldClass}
              >
                <option>LinkedIn</option>
                <option>Referral</option>
                <option>Naukri</option>
                <option>Campus</option>
                <option>Website</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>College</label>
              <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="e.g. IIM Bangalore" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input value={state} onChange={(e) => setState(e.target.value)} placeholder="e.g. Karnataka" className={fieldClass} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Skills (comma separated)</label>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="SEO, Content, Analytics" className={fieldClass} />
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ExportCandidatesButton() {
  const { candidates } = useRecruitment();
  const { toast } = useToast();

  const exportCsv = () => {
    const headers = ["Name", "Role", "Stage", "Fit Score", "College", "State", "Source", "Experience", "Email", "Applied"];
    const rows = candidates.map((c) =>
      [c.name, c.role, c.stage, c.fitScore, c.college, c.state, c.source, c.experience, c.email, c.appliedDate]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    downloadFile(`mj-nexus-candidates-${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(","), ...rows].join("\n"), "text/csv;charset=utf-8");
    toast({
      title: "Export ready",
      description: `Downloaded ${candidates.length} candidates as CSV.`,
      type: "success",
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={exportCsv}>
      <Download className="h-4 w-4" /> Export
    </Button>
  );
}
