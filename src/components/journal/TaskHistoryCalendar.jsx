import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function TaskHistoryCalendar() {
  const [selectedDate, setSelectedDate] = useState(null);

  // Get all completed tasks from last 30 days
  const { data: allTasks = [] } = useQuery({
    queryKey: ["completedTasks"],
    queryFn: () => base44.entities.Task.list("-completed_at"),
  });

  const completedTasks = allTasks.filter(t => t.completed && t.completed_at);

  // Group tasks by date
  const tasksByDate = completedTasks.reduce((acc, task) => {
    const date = task.completed_at.split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {});

  // Get dates with completed tasks
  const datesWithTasks = Object.keys(tasksByDate).map(d => new Date(d));

  // Get tasks for selected date
  const selectedDateTasks = selectedDate
    ? tasksByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-cyan-400" />
        <h2 className="text-lg font-semibold">Task History</h2>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal bg-white/5 border-white/10 text-white hover:bg-white/10">
            <CalendarDays className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Select a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-slate-900 border-white/10" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasTask: datesWithTasks,
            }}
            modifiersStyles={{
              hasTask: {
                backgroundColor: "rgba(34, 211, 238, 0.2)",
                color: "#22d3ee",
                fontWeight: "bold",
              },
            }}
            modifiersClassNames={{
              hasTask: "text-cyan-400 font-bold",
            }}
            className="rounded-md border-0"
            styles={{
              day: { color: "#e2e8f0" },
              day_selected: { backgroundColor: "#0891b2", color: "white" },
              day_today: { color: "#22d3ee", fontWeight: "bold" },
            }}
          />
        </PopoverContent>
      </Popover>

      {selectedDate && selectedDateTasks.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm text-white/60 mb-2">
            {selectedDateTasks.length} task{selectedDateTasks.length > 1 ? "s" : ""} completed on {format(selectedDate, "PPP")}
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedDateTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10"
              >
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span className="text-sm text-white/80 flex-1">{task.title}</span>
                <span className="text-xs text-white/40">
                  {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDateTasks.length === 0 && (
        <div className="mt-4 text-center py-4">
          <p className="text-sm text-white/40">No tasks completed on this date</p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">Total completed (30 days)</span>
          <span className="text-cyan-400 font-semibold">{completedTasks.length}</span>
        </div>
      </div>
    </div>
  );
}