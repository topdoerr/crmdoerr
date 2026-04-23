"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startTimer, stopTimer } from "./actions";

interface TimerWidgetProps {
  tasks: { id: number; name: string }[];
  staff: { id: number; name: string }[];
  activeTimer: {
    id: number;
    taskId: number;
    startTime: string;
    note: string;
  } | null;
}

function formatElapsed(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function TimerWidget({
  tasks,
  staff,
  activeTimer,
}: TimerWidgetProps) {
  const [isPending, startTransition] = useTransition();
  const [collapsed, setCollapsed] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [taskId, setTaskId] = useState<string>(
    activeTimer ? String(activeTimer.taskId) : ""
  );
  const [staffId, setStaffId] = useState<string>(
    staff[0] ? String(staff[0].id) : ""
  );
  const [rate, setRate] = useState<string>("");
  const [note, setNote] = useState<string>(activeTimer?.note ?? "");

  useEffect(() => {
    if (!activeTimer) {
      setElapsed(0);
      return;
    }
    const start = new Date(activeTimer.startTime).getTime();
    setElapsed(Date.now() - start);
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimer]);

  const handleStart = () => {
    if (!taskId || !staffId) return;
    startTransition(async () => {
      await startTimer(
        Number(taskId),
        Number(staffId),
        rate ? Number(rate) : undefined,
        note || undefined
      );
    });
  };

  const handleStop = () => {
    if (!activeTimer) return;
    startTransition(async () => {
      await stopTimer(activeTimer.id);
    });
  };

  return (
    <Card className="fixed bottom-6 right-6 z-40 w-80 p-4 shadow-xl border-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${
              activeTimer ? "bg-green-500 animate-pulse" : "bg-slate-400"
            }`}
          />
          <h3 className="text-sm font-semibold">
            {activeTimer ? "Timer Running" : "Timer"}
          </h3>
        </div>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {activeTimer ? (
        <div className="space-y-3">
          <p className="text-3xl font-mono font-bold text-center tabular-nums">
            {formatElapsed(elapsed)}
          </p>
          {!collapsed && (
            <>
              <div className="text-xs text-muted-foreground text-center">
                {tasks.find((t) => t.id === activeTimer.taskId)?.name ??
                  `Task #${activeTimer.taskId}`}
              </div>
              {activeTimer.note && (
                <p className="text-xs text-muted-foreground italic text-center">
                  {activeTimer.note}
                </p>
              )}
            </>
          )}
          <Button
            onClick={handleStop}
            disabled={isPending}
            variant="destructive"
            className="w-full"
          >
            Stop Timer
          </Button>
        </div>
      ) : (
        !collapsed && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Task</Label>
              <Select value={taskId} onValueChange={setTaskId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {tasks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Staff</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Hourly Rate</Label>
              <Input
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="0.00"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Note</Label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What are you working on?"
                className="h-9"
              />
            </div>
            <Button
              onClick={handleStart}
              disabled={isPending || !taskId || !staffId}
              className="w-full"
            >
              Start Timer
            </Button>
          </div>
        )
      )}
    </Card>
  );
}
