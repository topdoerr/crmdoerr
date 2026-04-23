"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CalendarEventItem {
  id: number;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  color: string;
  isPublic: boolean;
}

interface CalendarViewProps {
  year: number;
  month: number;
  events: CalendarEventItem[];
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function CalendarView({
  year,
  month,
  events,
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] =
    useState<CalendarEventItem | null>(null);

  const { days, prevMonth, prevYear, nextMonth, nextYear } = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const gridStart = new Date(firstDay);
    gridStart.setDate(gridStart.getDate() - firstDay.getDay());

    const cells: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      cells.push(d);
    }

    const prev = new Date(year, month - 1, 1);
    const next = new Date(year, month + 1, 1);

    return {
      days: cells,
      prevMonth: prev.getMonth(),
      prevYear: prev.getFullYear(),
      nextMonth: next.getMonth(),
      nextYear: next.getFullYear(),
    };
  }, [year, month]);

  const today = new Date();

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();
    for (const event of events) {
      const d = new Date(event.startDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    }
    return map;
  }, [events]);

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/calendar?year=${prevYear}&month=${prevMonth}`}>
                Prev
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/calendar">Today</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/calendar?year=${nextYear}&month=${nextMonth}`}>
                Next
              </Link>
            </Button>
          </div>
          <h2 className="text-xl font-semibold">
            {MONTH_NAMES[month]} {year}
          </h2>
          <div className="w-[200px]" />
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border">
          {DAY_NAMES.map((dn) => (
            <div
              key={dn}
              className="bg-muted px-2 py-2 text-xs font-semibold uppercase text-muted-foreground text-center"
            >
              {dn}
            </div>
          ))}

          {days.map((day) => {
            const inMonth = day.getMonth() === month;
            const isToday = sameDay(day, today);
            const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
            const dayEvents = eventsByDay.get(key) ?? [];

            return (
              <div
                key={key}
                className={`bg-background min-h-[110px] p-1.5 ${
                  inMonth ? "" : "bg-muted/30"
                }`}
              >
                <div
                  className={`text-xs mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full ${
                    isToday
                      ? "bg-primary text-primary-foreground font-semibold"
                      : inMonth
                        ? "text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <button
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="w-full text-left text-[11px] px-1.5 py-0.5 rounded truncate hover:opacity-80 transition-opacity"
                      style={{
                        backgroundColor: event.color + "22",
                        borderLeft: `3px solid ${event.color}`,
                      }}
                      title={event.title}
                    >
                      <span
                        className="inline-block h-1.5 w-1.5 rounded-full mr-1"
                        style={{ backgroundColor: event.color }}
                      />
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <p className="text-[10px] text-muted-foreground pl-1.5">
                      +{dayEvents.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Dialog
        open={selectedEvent !== null}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      >
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-3 w-3 rounded-full"
                    style={{ backgroundColor: selectedEvent.color }}
                  />
                  <DialogTitle>{selectedEvent.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {formatFullDate(new Date(selectedEvent.startDate))}
                  {selectedEvent.endDate &&
                    ` — ${formatTime(new Date(selectedEvent.endDate))}`}
                </DialogDescription>
              </DialogHeader>
              {selectedEvent.description && (
                <p className="text-sm whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              )}
              <div>
                {selectedEvent.isPublic ? (
                  <Badge variant="success">Public</Badge>
                ) : (
                  <Badge variant="secondary">Private</Badge>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
