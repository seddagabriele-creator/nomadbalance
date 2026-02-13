import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { taskService } from "../../api/services";
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
    queryFn: () => taskService.listCompleted(),
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
    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Task History</h2>
        </div>
        <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30">
          <span className="text-cyan-400 font-semibold text-sm">{completedTasks.length} total</span>
        </div>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full h-12 justify-start text-left font-medium bg-white/10 border-white/20 text-white hover:bg-white/15 hover:border-white/30 transition-all"
          >
            <CalendarDays className="mr-3 h-5 w-5 text-cyan-400" />
            <span className="text-base">{selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date to view tasks"}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4 bg-slate-900/95 backdrop-blur-xl border-white/20 shadow-2xl" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            modifiers={{
              hasTask: datesWithTasks,
            }}
            modifiersStyles={{
              hasTask: {
                backgroundColor: "rgba(34, 211, 238, 0.15)",
                borderRadius: "8px",
              },
            }}
            className="rounded-xl"
            classNames={{
              months: "text-white",
              month: "text-white space-y-4",
              caption: "flex justify-center pt-1 relative items-center mb-4",
              caption_label: "text-white text-base font-semibold",
              nav: "space-x-1 flex items-center",
              nav_button: "h-8 w-8 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell: "text-white/60 rounded-md w-10 font-medium text-xs uppercase",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
              day: "h-10 w-10 p-0 font-medium rounded-lg hover:bg-white/10 transition-colors text-white/90",
              day_selected: "bg-cyan-600 text-white hover:bg-cyan-700 font-bold",
              day_today: "bg-white/20 text-white font-bold",
              day_outside: "text-white/30",
              day_disabled: "text-white/20",
              day_range_middle: "aria-selected:bg-white/10",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>

      {selectedDate && selectedDateTasks.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-sm text-cyan-400 font-medium">
              {selectedDateTasks.length} task{selectedDateTasks.length > 1 ? "s" : ""} on {format(selectedDate, "MMM d")}
            </p>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {selectedDateTasks.map((task, index) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 hover:border-green-500/30 transition-all group"
              >
                <div className="mt-0.5">
                  <CheckCircle2 className="w-5 h-5 text-green-400 group-hover:text-green-300 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-white block">{task.title}</span>
                  <span className="text-xs text-white/50 mt-1 block">
                    Completed at {new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="px-2 py-1 rounded-md bg-green-500/20 text-green-400 text-xs font-semibold">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedDateTasks.length === 0 && (
        <div className="mt-6 text-center py-8 rounded-xl bg-white/5 border border-white/10">
          <CalendarDays className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/40">No tasks completed on this date</p>
        </div>
      )}
    </div>
  );
}