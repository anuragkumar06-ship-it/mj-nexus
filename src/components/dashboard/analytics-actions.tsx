"use client";

import { Download, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { downloadFile } from "@/lib/utils";
import {
  departmentAnalytics,
  collegeAnalytics,
  sourceEffectiveness,
} from "@/lib/data";

export function AnalyticsActions() {
  const { toast } = useToast();

  const exportReport = () => {
    const lines: string[] = ["Nexus Talent OS - Analytics Report (2026)", ""];
    lines.push("Department,Headcount,Avg Performance,Retention %,Open Roles");
    departmentAnalytics.forEach((d) =>
      lines.push(`${d.dept},${d.headcount},${d.avgPerf},${d.retention},${d.openRoles}`)
    );
    lines.push("", "College,Applicants,Selection Rate %,Perf After Hire");
    collegeAnalytics.forEach((c) =>
      lines.push(`${c.college},${c.applicants},${c.selectionRate},${c.perfAfterHire}`)
    );
    lines.push("", "Source,Applicants,Hires");
    sourceEffectiveness.forEach((s) => lines.push(`${s.source},${s.applicants},${s.hires}`));

    downloadFile(
      `nexus-talent-os-analytics-${new Date().toISOString().slice(0, 10)}.csv`,
      lines.join("\n"),
      "text/csv;charset=utf-8"
    );
    toast({ title: "Report exported", description: "Analytics report downloaded as CSV.", type: "success" });
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => toast({ title: "Period: 2026", description: "Showing full-year analytics.", type: "info" })}
      >
        <CalendarRange className="h-4 w-4" /> 2026
      </Button>
      <Button size="sm" onClick={exportReport}>
        <Download className="h-4 w-4" /> Export report
      </Button>
    </>
  );
}
