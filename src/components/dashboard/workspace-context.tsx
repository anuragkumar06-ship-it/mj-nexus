"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { tasks as taskSeed, standups as standupSeed, type Task } from "@/lib/data";

export interface Standup {
  id: string;
  intern: string;
  completed: string;
  priorities: string;
  challenges: string;
  date: string;
}

interface WorkspaceCtx {
  tasks: Task[];
  standups: Standup[];
  addTask: (t: Task) => void;
  addStandup: (s: Standup) => void;
}

const Ctx = createContext<WorkspaceCtx | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(taskSeed);
  const [standups, setStandups] = useState<Standup[]>(standupSeed);
  const addTask = (t: Task) => setTasks((prev) => [t, ...prev]);
  const addStandup = (s: Standup) => setStandups((prev) => [s, ...prev]);
  return (
    <Ctx.Provider value={{ tasks, standups, addTask, addStandup }}>{children}</Ctx.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
