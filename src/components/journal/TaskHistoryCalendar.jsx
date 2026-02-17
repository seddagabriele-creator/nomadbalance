import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService, daySessionService } from "../../api/services";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, CheckCircle2, Circle, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TaskHistoryCalendar() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get all tasks (for calendar dots AND detail view)
  const { data: allTasksList = [] } = useQuery({
    queryKey: ["allTasksCalendar"],
    queryFn: () => taskService.listAll(),
  });

  // Get recent sessions (for date mapping)
  const { data: sessions = [] } = useQuery({
    queryKey: ["recentSessions"],
    queryFn: () => daySessionService.listRecent(60),
  });

  // Build session -> date map
  const sessionDateMap = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      map[s.id] = s.date;
    });
    return map;
  }, [sessions]);

  // Build date -> session id map (reverse)
  const dateSessionMap = useMemo(() => {
    const map = {};
    sessions.forEach(s => {
      map[s.date] = s.id;
    });
    return map;
  }, [sessions]);

  // Build task completion status per date (for calendar dots)
  const taskStatusByDate = useMemo(() => {
    const byDate = {};
    allTasksList.forEach(task => {
      if (!task.session_id) return;
      const date = sessionDateMap[task.session_id];
      if (!date) return;
      if (!byDate[date]) byDate[date] = { total: 0, completed: 0 };
      byDate[date].total++;
      if (task.completed) byDate[date].completed++;
    });
    return byDate;
  }, [allTasksList, sessionDateMap]);

  // Group ALL tasks by date (via session)
  const allTasksByDate = useMemo(() => {
    const byDate = {};
    allTasksList.forEach(task => {
      if (!task.session_id) return;
      const date = sessionDateMap[task.session_id];
      if (!date) return;
      if (!byDate[date]) byDate[date] = [];
      byDate[date].push(task);
    });
    // Sort each date's tasks by order
    Object.keys(byDate).forEach(date => {
      byDate[date].sort((a, b) => a.order - b.order);
    });
    return byDate;
  }, [allTasksList, sessionDateMap]);

  // Completed tasks for search
  const completedTasks = allTasksList.filter(t => t.completed && t.completed_at);

  // Dates for modifiers (green = all done, red = has incomplete)
  const allDoneDates = [];
  const incompleteDates = [];
  Object.entries(taskStatusByDate).forEach(([dateStr, status]) => {
    if (status.total === 0) return;
    const d = new Date(dateStr);
    if (status.completed === status.total) {
      allDoneDates.push(d);
    } else {
      incompleteDates.push(d);
    }
  });

  // Dates with any tasks (for calendar highlights)
  const datesWithTasks = Object.keys(allTasksByDate).map(d => new Date(d));

  // Get tasks for selected date
  const selectedDateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedDateTasks = selectedDateStr ? (allTasksByDate[selectedDateStr] || []) : [];
  const selectedDateStatus = selectedDateStr ? taskStatusByDate[selectedDateStr] : null;

  // Toggle task completion
  const updateTask = useMutation({
    mutationFn: ({ id, data }) => taskService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasksCalendar"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
    },
  });

  const handleToggleComplete = (task) => {
    updateTask.mutate({
      id: task.id,
      data: {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      },
    });
    toast.success(task.completed ? "Task reopened" : "Task completed!");
  };

  // Search results
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matching = completedTasks.filter(t =>
      t.title.toLowerCase().includes(q)
    );

    const grouped = matching.reduce((acc, task) => {
      const date = task.completed_at.split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
    return { grouped, sortedDates, total: matching.length };
  }, [searchQuery, completedTasks]);

  // Custom DayContent to render dots
  const DayContentWithDots = ({ date, displayMonth, activeModifiers }) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const status = taskStatusByDate[dateStr];

    return (
      <div className="relative flex items-center justify-center w-full h-full">
        <span>{date.getDate()}</span>
        {status && status.total > 0 && (
          <span
            className={`absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
              status.completed === status.total ? "bg-green-400" : "bg-red-400"
            }`}
          />
        )}
      </div>
    );
  };

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
          <span className="text-cyan-400 font-semibold text-sm">{completedTasks.length} completed</span>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search old tasks..."
          className="pl-10 pr-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-cyan-500/50 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search results */}
      {searchResults && (
        <div className="mb-4">
          {searchResults.total > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="text-sm text-cyan-400 font-medium">
                  {searchResults.total} result{searchResults.total > 1 ? "s" : ""} found
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {searchResults.sortedDates.map(dateStr => (
                  <div key={dateStr}>
                    <p className="text-xs text-white/50 font-medium mb-2 uppercase tracking-wide">
                      {format(new Date(dateStr), "MMMM d, yyyy")}
                    </p>
                    <div className="space-y-2">
                      {searchResults.grouped[dateStr].map((task) => (
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
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 rounded-xl bg-white/5 border border-white/10">
              <Search className="w-10 h-10 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No tasks matching "{searchQuery}"</p>
            </div>
          )}
        </div>
      )}

      {/* Calendar date picker (hidden during search) */}
      {!searchResults && (
        <>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                onSelect={(date) => {
                  setSelectedDate(date);
                  setCalendarOpen(false);
                }}
                modifiers={{
                  hasTask: datesWithTasks,
                  allDone: allDoneDates,
                  hasIncomplete: incompleteDates,
                }}
                modifiersStyles={{
                  hasTask: {
                    backgroundColor: "rgba(34, 211, 238, 0.15)",
                    borderRadius: "8px",
                  },
                }}
                components={{
                  IconLeft: ({ className, ...props }) => (
                    <ChevronLeft className={cn("h-4 w-4", className)} {...props} />
                  ),
                  IconRight: ({ className, ...props }) => (
                    <ChevronRight className={cn("h-4 w-4", className)} {...props} />
                  ),
                  DayContent: DayContentWithDots,
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

              {/* Legend */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-xs text-white/50">All done</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-xs text-white/50">Incomplete</span>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {selectedDate && selectedDateTasks.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="text-sm text-cyan-400 font-medium">
                  {selectedDateTasks.length} task{selectedDateTasks.length > 1 ? "s" : ""} on {format(selectedDate, "MMM d")}
                  {selectedDateStatus && selectedDateStatus.completed < selectedDateStatus.total && (
                    <span className="text-red-400 ml-1">
                      ({selectedDateStatus.total - selectedDateStatus.completed} incomplete)
                    </span>
                  )}
                </p>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {selectedDateTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border transition-colors group ${
                      task.completed
                        ? "bg-gradient-to-r from-green-500/10 to-cyan-500/10 border-green-500/20 hover:border-green-500/30"
                        : "bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 hover:border-red-500/30"
                    }`}
                  >
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="mt-0.5 transition-colors"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 group-hover:text-green-300" />
                      ) : (
                        <Circle className="w-5 h-5 text-red-400 group-hover:text-red-300" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-medium block ${
                        task.completed ? "text-white" : "text-white"
                      }`}>
                        {task.title}
                      </span>
                      <span className="text-xs text-white/50 mt-1 block">
                        {task.completed && task.completed_at
                          ? `Completed at ${new Date(task.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                          : "Not completed — tap to complete"
                        }
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      task.completed
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}>
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
              <p className="text-sm text-white/40">No tasks on this date</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
