import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { daySessionService, taskService, taskListService, userSettingsService } from "../api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Plus, GripVertical, Trash2, CheckCircle2, Circle, Eye, EyeOff, Clock, ArrowUp, MessageSquare, Save, CheckSquare, X, Pencil, ChevronDown, List, CalendarDays } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { calendarFeatureAvailable, connectGoogleCalendar, syncTaskToCalendar } from "@/lib/googleCalendar";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { createPageUrl, getLocalDateString } from "../utils";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import TaskHistoryCalendar from "../components/journal/TaskHistoryCalendar";
import ProGate from "@/components/ProGate";

// Per-task list picker. Lets an existing task be filed into a list (or
// pulled out of one) without recreating it. Hidden until the user has
// created at least one list, so it adds no clutter by default.
function ListPickerButton({ task, lists, onMove }) {
  if (!lists.length) return null;
  const current = lists.find((l) => l.id === task.list_id) || null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className={`h-7 w-7 ${current ? "text-cyan-400" : "text-white/40"} hover:text-cyan-300 hover:bg-cyan-500/10`}
          aria-label={current ? `In list ${current.name}. Move to another list` : "Add to a list"}
          title={current ? current.name : "Add to a list"}
        >
          <List className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-slate-900 border-white/10 min-w-[11rem]"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem
          onClick={(e) => { e.stopPropagation(); onMove(task, null); }}
          className={`cursor-pointer ${!task.list_id ? "text-cyan-400" : "text-white"} hover:bg-white/10`}
        >
          No list
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/10" />
        {lists.map((l) => (
          <DropdownMenuItem
            key={l.id}
            onClick={(e) => { e.stopPropagation(); onMove(task, l.id); }}
            className={`cursor-pointer ${task.list_id === l.id ? "text-cyan-400" : "text-white"} hover:bg-white/10`}
          >
            <span className="truncate">{l.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function Journal() {
  const queryClient = useQueryClient();
  const today = getLocalDateString();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showWorkDayTasks, setShowWorkDayTasks] = useState(true);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [alarmTime, setAlarmTime] = useState("");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [editingNotes, setEditingNotes] = useState({});
  const [editingTitle, setEditingTitle] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");
  const [selectedPrevTasks, setSelectedPrevTasks] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [showPreviousTasks, setShowPreviousTasks] = useState(false);
  // Selected list filter — null means "All tasks". Persisted so the user
  // lands back on the list they were working in.
  const [activeListId, setActiveListId] = useState(() => localStorage.getItem("nomadbalance:active-list") || null);
  const [creatingList, setCreatingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [calendarPromptTask, setCalendarPromptTask] = useState(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const { data: taskLists = [] } = useQuery({
    queryKey: ["taskLists"],
    queryFn: () => taskListService.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: settingsRows = [] } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => userSettingsService.list(),
  });
  const userSettings = settingsRows[0] || {};
  const calendarConnected = !!userSettings.google_calendar_connected;

  const session = sessions[0] || null;
  const isInWorkDay = session?.status === "active";

  // Get all tasks
  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasks", session?.id],
    queryFn: () => taskService.listAll("-order"),
    enabled: true,
  });

  // A selected list narrows every section below it; "All tasks" (null)
  // also covers tasks that were never assigned to a list.
  const activeList = taskLists.find((l) => l.id === activeListId) || null;
  const scopedTasks = activeList
    ? allTasks.filter((t) => t.list_id === activeList.id)
    : allTasks;

  // Get previous day's uncompleted tasks
  const previousUncompletedTasks = scopedTasks.filter(
    t => t.session_id && t.session_id !== session?.id && !t.completed
  );

  // Filter tasks based on context
  // Without a session: todayTasks is empty, previousTasks shows uncompleted from past sessions
  // With a session: todayTasks shows session tasks, previousTasks shows uncompleted from other sessions
  const todayTasks = isInWorkDay
    ? scopedTasks.filter(t => t.session_id === session?.id)
    : [];

  const previousTasks = isInWorkDay
    ? previousUncompletedTasks
    : scopedTasks.filter(t => t.session_id && !t.completed);

  const sortedTodayTasks = [...todayTasks].sort((a, b) => a.order - b.order);
  const sortedPreviousTasks = [...previousTasks].sort((a, b) => a.order - b.order);

  const createTask = useMutation({
    mutationFn: (data) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      setNewTaskTitle("");
      toast.success("Task added");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => taskService.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allTasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      toast.success("Task deleted");
    },
  });

  const completeAllPreviousTasks = useMutation({
    mutationFn: async () => {
      const promises = previousTasks.map(task =>
        taskService.update(task.id, {
          completed: true,
          completed_at: new Date().toISOString(),
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      toast.success("All previous tasks completed");
    },
  });

  const moveTasksToToday = useMutation({
    mutationFn: async (tasks) => {
      if (!session?.id) return;
      let maxOrder = todayTasks.length > 0 ? Math.max(...todayTasks.map((t) => t.order)) : 0;
      const promises = tasks.map((task, i) =>
        taskService.update(task.id, {
          session_id: session.id,
          order: maxOrder + 1 + i,
          completed: false,
          completed_at: null,
        })
      );
      await Promise.all(promises);
    },
    onSuccess: (_, tasks) => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      setSelectedPrevTasks(new Set());
      toast.success(tasks.length === 1 ? "Task moved to today" : `${tasks.length} tasks moved to today`);
    },
  });

  const handleToggleSelectPrev = (taskId) => {
    setSelectedPrevTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const handleSaveTitle = (task) => {
    const title = editTitleValue.trim();
    if (!title || title === task.title) {
      setEditingTitle(null);
      return;
    }
    updateTask.mutate({ id: task.id, data: { title } });
    setEditingTitle(null);
    toast.success("Task updated");
  };

  const handleSaveNotes = (task) => {
    const notes = editingNotes[task.id];
    if (notes === undefined) return;
    updateTask.mutate({
      id: task.id,
      data: { notes: notes || null },
    });
    setEditingNotes(prev => {
      const next = { ...prev };
      delete next[task.id];
      return next;
    });
    toast.success("Notes saved");
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const maxOrder = todayTasks.length > 0 ? Math.max(...todayTasks.map((t) => t.order)) : 0;
    createTask.mutate({
      session_id: session?.id || null,
      title: newTaskTitle,
      order: maxOrder + 1,
      is_work_day_task: isInWorkDay,
      // New tasks land in whichever list is currently selected
      list_id: activeListId,
    });
  };

  // ── Lists ──
  const createList = useMutation({
    mutationFn: (name) => taskListService.create({ name, position: taskLists.length }),
    onSuccess: (list) => {
      queryClient.invalidateQueries({ queryKey: ["taskLists"] });
      selectList(list.id);
      setCreatingList(false);
      setNewListName("");
      toast.success(`List "${list.name}" created`);
    },
    onError: () => toast.error("Could not create the list"),
  });

  const deleteList = useMutation({
    mutationFn: (id) => taskListService.delete(id),
    onSuccess: (_r, id) => {
      queryClient.invalidateQueries({ queryKey: ["taskLists"] });
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      if (activeListId === id) selectList(null);
      toast.success("List deleted — its tasks moved to All tasks");
    },
    onError: () => toast.error("Could not delete the list"),
  });

  function selectList(id) {
    setActiveListId(id);
    if (id) localStorage.setItem("nomadbalance:active-list", id);
    else localStorage.removeItem("nomadbalance:active-list");
  }

  const handleCreateList = () => {
    const name = newListName.trim();
    if (!name) return;
    createList.mutate(name);
  };

  const handleMoveToList = (task, listId) => {
    updateTask.mutate({ id: task.id, data: { list_id: listId } });
    const target = taskLists.find((l) => l.id === listId);
    toast.success(target ? `Moved to ${target.name}` : "Removed from list");
  };

  // ── Calendar sync (fire-and-forget — never blocks the UI) ──
  const syncCalendar = (taskId, action) => {
    if (!calendarConnected) return;
    syncTaskToCalendar(taskId, { date: today, action });
  };

  const handleDeleteTask = (task) => {
    // Pass the event id explicitly: the task row is about to disappear, so
    // the server can't look it up to find what to remove from the calendar.
    if (calendarConnected && task.google_event_id) {
      syncTaskToCalendar(task.id, { action: "delete", eventId: task.google_event_id });
    }
    deleteTask.mutate(task.id);
  };

  const handleToggleComplete = (task) => {
    updateTask.mutate({
      id: task.id,
      data: {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      },
    });
    // Reflect the tick in the calendar event's title
    if (task.alarm_time) syncCalendar(task.id, "upsert");
  };

  const handleSetAlarm = (task) => {
    if (alarmTime) {
      updateTask.mutate({
        id: task.id,
        data: { alarm_time: alarmTime },
      });
      toast.success("Alarm set");

      if (calendarConnected) {
        syncCalendar(task.id, "upsert");
      } else if (calendarFeatureAvailable && !userSettings.google_calendar_prompt_dismissed) {
        // First time the user schedules something: offer calendar sync once.
        setCalendarPromptTask(task);
      }
    }
    setEditingAlarm(null);
    setAlarmTime("");
  };

  const handleRemoveAlarm = (task) => {
    updateTask.mutate({
      id: task.id,
      data: { alarm_time: null },
    });
    if (task.google_event_id) syncCalendar(task.id, "delete");
    toast.success("Alarm removed");
  };

  const dismissCalendarPrompt = async () => {
    setCalendarPromptTask(null);
    try {
      await userSettingsService.save(
        { ...userSettings, google_calendar_prompt_dismissed: true },
        userSettings.id
      );
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    } catch {
      // Not critical — worst case the prompt shows again next time
    }
  };

  const acceptCalendarPrompt = async () => {
    try {
      sessionStorage.setItem("nomadbalance:calendar-pending-task", calendarPromptTask?.id || "");
      await connectGoogleCalendar(); // navigates to Google
    } catch (err) {
      toast.error(err.message || "Could not connect Google Calendar");
      setCalendarPromptTask(null);
    }
  };

  // Returning from the Google consent screen (/journal?calendar=…)
  useEffect(() => {
    const status = searchParams.get("calendar");
    if (!status) return;

    if (status === "connected") {
      toast.success("Google Calendar connected");
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
      // Push the task that triggered the connection, now that we can
      const pending = sessionStorage.getItem("nomadbalance:calendar-pending-task");
      if (pending) {
        syncTaskToCalendar(pending, { date: today, action: "upsert" });
        sessionStorage.removeItem("nomadbalance:calendar-pending-task");
      }
    } else if (status === "denied") {
      toast("Calendar access was not granted");
    } else {
      toast.error("Could not connect Google Calendar");
    }

    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("calendar");
      return next;
    }, { replace: true });
  }, [searchParams, setSearchParams, queryClient, today]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sameList = source.droppableId === destination.droppableId;

    if (sameList && source.index === destination.index) return;

    const sourceList = source.droppableId === "today" ? sortedTodayTasks : sortedPreviousTasks;
    const destList = destination.droppableId === "today" ? sortedTodayTasks : sortedPreviousTasks;

    if (sameList) {
      // Reorder within same list
      const reordered = Array.from(sourceList);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);

      const orderMap = new Map();
      reordered.forEach((task, index) => { orderMap.set(task.id, index + 1); });

      queryClient.setQueryData(["allTasks", session?.id], (old) => {
        if (!old) return old;
        return old.map(task => {
          const newOrder = orderMap.get(task.id);
          return newOrder !== undefined ? { ...task, order: newOrder } : task;
        });
      });

      const updates = reordered
        .filter((task) => task.order !== orderMap.get(task.id))
        .map((task) => taskService.update(task.id, { order: orderMap.get(task.id) }));

      try { await Promise.all(updates); }
      finally { queryClient.invalidateQueries({ queryKey: ["allTasks"] }); }
    } else {
      // Cross-list move
      const movedTask = sourceList[source.index];
      const newSourceList = Array.from(sourceList);
      newSourceList.splice(source.index, 1);
      const newDestList = Array.from(destList);
      newDestList.splice(destination.index, 0, movedTask);

      // Determine the new session_id for the moved task
      const movingToToday = destination.droppableId === "today";
      const newSessionId = movingToToday ? session?.id : movedTask._original_session_id || null;

      // Build order maps
      const orderMap = new Map();
      newSourceList.forEach((task, i) => { orderMap.set(task.id, i + 1); });
      newDestList.forEach((task, i) => { orderMap.set(task.id, i + 1); });

      // Optimistic update
      queryClient.setQueryData(["allTasks", session?.id], (old) => {
        if (!old) return old;
        return old.map(task => {
          if (task.id === movedTask.id) {
            return { ...task, session_id: movingToToday ? session?.id : task._original_session_id || task.session_id, order: orderMap.get(task.id) ?? task.order };
          }
          const newOrder = orderMap.get(task.id);
          return newOrder !== undefined ? { ...task, order: newOrder } : task;
        });
      });

      // Persist — move task + reorder both lists
      const updates = [];
      if (movingToToday) {
        updates.push(taskService.update(movedTask.id, {
          session_id: session?.id,
          order: orderMap.get(movedTask.id),
          completed: false,
          completed_at: null,
        }));
      } else {
        // Moving from today back to previous — restore original session
        // We need the task's original session. Since previous tasks are from other sessions,
        // we can't easily know which one. For simplicity, just reorder within today.
        // Actually cross-list today→previous doesn't make sense logically, so we skip.
        return;
      }

      // Reorder remaining source list
      newSourceList.forEach((task) => {
        if (task.order !== orderMap.get(task.id)) {
          updates.push(taskService.update(task.id, { order: orderMap.get(task.id) }));
        }
      });
      // Reorder dest list (excluding the moved task already handled)
      newDestList.forEach((task) => {
        if (task.id !== movedTask.id && task.order !== orderMap.get(task.id)) {
          updates.push(taskService.update(task.id, { order: orderMap.get(task.id) }));
        }
      });

      try { await Promise.all(updates); }
      finally { queryClient.invalidateQueries({ queryKey: ["allTasks"] }); }

      toast.success("Task moved to today");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to={createPageUrl("Dashboard")}>
              <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Target className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold">Journal</h1>
            </div>

            {/* List switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 px-2.5 gap-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white"
                  aria-label="Switch task list"
                >
                  <List className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-sm font-medium max-w-[9rem] truncate">
                    {activeList ? activeList.name : "All tasks"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-slate-900 border-white/10 min-w-[13rem]">
                <DropdownMenuItem
                  onClick={() => selectList(null)}
                  className={`cursor-pointer ${!activeListId ? "text-cyan-400" : "text-white"} hover:bg-white/10`}
                >
                  All tasks
                </DropdownMenuItem>
                {taskLists.length > 0 && <DropdownMenuSeparator className="bg-white/10" />}
                {taskLists.map((list) => (
                  <DropdownMenuItem
                    key={list.id}
                    onClick={() => selectList(list.id)}
                    className={`cursor-pointer group ${activeListId === list.id ? "text-cyan-400" : "text-white"} hover:bg-white/10`}
                  >
                    <span className="truncate flex-1">{list.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList.mutate(list.id);
                      }}
                      className="ml-2 opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-opacity"
                      aria-label={`Delete list ${list.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => setCreatingList(true)}
                  className="cursor-pointer text-white/70 hover:bg-white/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-2" />
                  New list
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            {previousTasks.length > 0 && (
              <Button
                onClick={() => setShowCompleteConfirm(true)}
                variant="ghost"
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete {previousTasks.length} old
              </Button>
            )}
            {!isInWorkDay && (
              <Button
                onClick={() => setShowWorkDayTasks(!showWorkDayTasks)}
                variant="ghost"
                className="text-white/60 hover:text-white"
              >
                {showWorkDayTasks ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                {showWorkDayTasks ? "Show all" : "Hide completed work"}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {creatingList && (
            <div className="bg-white/5 backdrop-blur-xl border border-cyan-500/25 rounded-2xl p-4">
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateList();
                    if (e.key === "Escape") { setCreatingList(false); setNewListName(""); }
                  }}
                  placeholder="List name — e.g. Work, Home…"
                  className="bg-white/5 border-white/10 text-white flex-1"
                />
                <Button
                  onClick={handleCreateList}
                  disabled={!newListName.trim() || createList.isPending}
                  className="bg-gradient-to-r from-cyan-600 to-blue-500"
                >
                  Create
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => { setCreatingList(false); setNewListName(""); }}
                  className="text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                placeholder={activeList ? `Add a task to ${activeList.name}…` : "Add a new task..."}
                className="bg-white/5 border-white/10 text-white flex-1"
              />
              <Button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="bg-gradient-to-r from-cyan-600 to-blue-500"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <DragDropContext onDragEnd={handleDragEnd}>
          {(sortedTodayTasks.length > 0 || sortedPreviousTasks.length > 0) && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h2 className="text-lg font-semibold mb-3">Today's Tasks</h2>
                <Droppable droppableId="today">
                  {(provided, dropSnapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex flex-col gap-1.5 min-h-[40px] rounded-xl transition-all ${
                        dropSnapshot.isDraggingOver
                          ? "bg-cyan-500/10 ring-2 ring-cyan-500/30"
                          : ""
                      }`}
                    >
                      {sortedTodayTasks.length === 0 && (
                        <div className={`flex items-center justify-center py-3 rounded-xl border-2 border-dashed transition-colors ${
                          dropSnapshot.isDraggingOver ? "border-cyan-500/40 text-cyan-400" : "border-white/10 text-white/30"
                        }`}>
                          <span className="text-xs">
                            {dropSnapshot.isDraggingOver ? "Drop here to add to today" : "Drag tasks here or add one above"}
                          </span>
                        </div>
                      )}
                      {sortedTodayTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => {
                            const isExpanded = expandedTaskId === task.id && !snapshot.isDragging;
                            const taskRow = (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`flex items-start gap-1.5 px-2 py-1.5 rounded-xl border transition-colors ${
                                  snapshot.isDragging
                                    ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                                    : "bg-white/5 border-white/10"
                                }`}
                              >
                                <div {...provided.dragHandleProps} className="text-white/40 hover:text-white/60 shrink-0 pt-0.5">
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold shrink-0 mt-px">
                                  {index + 1}
                                </div>
                                <button
                                  onClick={() => handleToggleComplete(task)}
                                  className="text-white/40 hover:text-white transition-colors shrink-0 mt-px"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => { if (editingTitle !== task.id) setExpandedTaskId(prev => prev === task.id ? null : task.id); }}
                                >
                                  {editingTitle === task.id ? (
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        autoFocus
                                        value={editTitleValue}
                                        onChange={(e) => setEditTitleValue(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(task); if (e.key === "Escape") setEditingTitle(null); }}
                                        onBlur={() => handleSaveTitle(task)}
                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-cyan-500/50"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`text-sm leading-5 ${
                                        isExpanded ? "whitespace-normal break-words" : "block truncate"
                                      } ${task.completed ? "text-white/40 line-through" : "text-white"}`}
                                    >
                                      {task.title}
                                    </span>
                                  )}
                                  {isExpanded && editingTitle !== task.id && (
                                    <div className="mt-1.5 pt-1.5 border-t border-white/10 space-y-2">
                                      <div className="flex items-center gap-1">
                                        {task.alarm_time && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{task.alarm_time}</span>
                                          </div>
                                        )}
                                        {task.notes && editingNotes[task.id] === undefined && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                                            <MessageSquare className="w-3 h-3" />
                                            <span>Notes</span>
                                          </div>
                                        )}
                                        <div className="flex-1" />
                                        <Popover open={editingAlarm === task.id} onOpenChange={(open) => {
                                          if (!open) { setEditingAlarm(null); setAlarmTime(""); }
                                        }}>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAlarm(task.id);
                                                setAlarmTime(task.alarm_time || "");
                                              }}
                                              className={`h-7 w-7 ${task.alarm_time ? 'text-cyan-400' : 'text-white/40'} hover:text-cyan-300 hover:bg-cyan-500/10`}
                                            >
                                              <Clock className="w-3.5 h-3.5" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-3 bg-slate-900 border-white/10">
                                            <div className="space-y-2">
                                              <Input
                                                type="time"
                                                value={alarmTime}
                                                onChange={(e) => setAlarmTime(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white"
                                              />
                                              <div className="flex gap-2">
                                                {task.alarm_time && (
                                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveAlarm(task)} className="flex-1 text-red-400 hover:text-red-300">Remove</Button>
                                                )}
                                                <Button size="sm" onClick={() => handleSetAlarm(task)} className="flex-1 bg-cyan-600 hover:bg-cyan-700">Set</Button>
                                              </div>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingNotes(prev => prev[task.id] !== undefined
                                              ? (() => { const n = { ...prev }; delete n[task.id]; return n; })()
                                              : { ...prev, [task.id]: task.notes || "" }
                                            );
                                          }}
                                          className={`h-7 w-7 ${task.notes ? 'text-indigo-400' : 'text-white/40'} hover:text-indigo-300 hover:bg-indigo-500/10`}
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => { e.stopPropagation(); setEditingTitle(task.id); setEditTitleValue(task.title); }}
                                          className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <ListPickerButton task={task} lists={taskLists} onMove={handleMoveToList} />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                      {editingNotes[task.id] !== undefined && (
                                        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                          <Textarea
                                            value={editingNotes[task.id]}
                                            onChange={(e) => setEditingNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                                            placeholder="Add notes..."
                                            rows={2}
                                            className="bg-white/5 border-white/10 text-white text-xs resize-none min-h-[48px]"
                                          />
                                          <div className="flex justify-end gap-1.5">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setEditingNotes(prev => { const n = { ...prev }; delete n[task.id]; return n; })}
                                              className="h-6 px-2 text-xs text-white/40 hover:text-white"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={() => handleSaveNotes(task)}
                                              className="h-6 px-2 text-xs bg-indigo-600 hover:bg-indigo-700"
                                            >
                                              <Save className="w-3 h-3 mr-1" />
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      {editingNotes[task.id] === undefined && task.notes && (
                                        <p className="text-xs text-white/50 whitespace-pre-wrap pl-0.5">{task.notes}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {!isExpanded && (
                                  <div className="flex items-center gap-1 shrink-0 mt-px">
                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                                      task.alarm_time ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/20'
                                    }`}>
                                      <Clock className="w-2.5 h-2.5" />
                                      {task.alarm_time && <span>{task.alarm_time}</span>}
                                    </div>
                                    <div className={`flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${
                                      task.notes ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/20'
                                    }`}>
                                      <MessageSquare className="w-2.5 h-2.5" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                            return snapshot.isDragging ? createPortal(taskRow, document.body) : taskRow;
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
            </div>
          )}

          {sortedPreviousTasks.length > 0 && !showPreviousTasks && (
            <button
              onClick={() => setShowPreviousTasks(true)}
              className="w-full bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4 text-left hover:bg-amber-500/10 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-sm font-medium text-amber-400">
                    {sortedPreviousTasks.length} unclosed task{sortedPreviousTasks.length > 1 ? "s" : ""} from previous days
                  </span>
                </div>
                <Eye className="w-4 h-4 text-amber-400/60" />
              </div>
            </button>
          )}

          {sortedPreviousTasks.length > 0 && showPreviousTasks && (
            <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowPreviousTasks(false)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <h2 className="text-lg font-semibold text-amber-400">Previous Tasks</h2>
                  <EyeOff className="w-4 h-4 text-amber-400/40" />
                </button>
                <div className="flex items-center gap-1.5">
                  {selectionMode ? (
                    <>
                      {selectedPrevTasks.size > 0 && (
                        <Button
                          onClick={() => {
                            const tasksToMove = sortedPreviousTasks.filter(t => selectedPrevTasks.has(t.id));
                            moveTasksToToday.mutate(tasksToMove);
                            setSelectionMode(false);
                          }}
                          size="sm"
                          className="h-7 px-2.5 text-xs bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400"
                        >
                          <ArrowUp className="w-3 h-3 mr-1" />
                          Move {selectedPrevTasks.size} to today
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          if (selectedPrevTasks.size === sortedPreviousTasks.length) {
                            setSelectedPrevTasks(new Set());
                          } else {
                            setSelectedPrevTasks(new Set(sortedPreviousTasks.map(t => t.id)));
                          }
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-amber-400 hover:text-amber-300"
                      >
                        {selectedPrevTasks.size === sortedPreviousTasks.length ? "Deselect all" : "Select all"}
                      </Button>
                      <Button
                        onClick={() => { setSelectionMode(false); setSelectedPrevTasks(new Set()); }}
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-white/40 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setSelectionMode(true)}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-white/50 hover:text-white hover:bg-white/10"
                        title="Select tasks"
                      >
                        <CheckSquare className="w-3 h-3 mr-1" />
                        Select
                      </Button>
                      <Button
                        onClick={() => moveTasksToToday.mutate(sortedPreviousTasks)}
                        size="sm"
                        className="h-7 px-2.5 text-xs bg-gradient-to-r from-cyan-600/80 to-blue-500/80 hover:from-cyan-500 hover:to-blue-400"
                      >
                        <ArrowUp className="w-3 h-3 mr-1" />
                        Move all to today
                      </Button>
                    </>
                  )}
                </div>
              </div>
                <Droppable droppableId="previous">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-1.5">
                      {sortedPreviousTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => {
                            const isExpanded = expandedTaskId === task.id && !snapshot.isDragging;
                            const taskRow = (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group flex items-start gap-1.5 px-2 py-1.5 rounded-xl border transition-all ${
                                  snapshot.isDragging
                                    ? "bg-slate-900 border-cyan-500/50 shadow-xl shadow-cyan-500/20 scale-[1.02]"
                                    : selectedPrevTasks.has(task.id)
                                    ? "bg-cyan-500/10 border-cyan-500/30"
                                    : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
                                }`}
                              >
                                {selectionMode && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleToggleSelectPrev(task.id); }}
                                    className={`shrink-0 mt-0.5 w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${
                                      selectedPrevTasks.has(task.id)
                                        ? "bg-cyan-500 border-cyan-500 scale-110"
                                        : "border-white/30 hover:border-cyan-400"
                                    }`}
                                  >
                                    {selectedPrevTasks.has(task.id) && (
                                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                )}
                                <div {...provided.dragHandleProps} className="text-white/40 hover:text-white/60 shrink-0 pt-0.5 cursor-grab active:cursor-grabbing">
                                  <GripVertical className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold shrink-0 mt-px">
                                  {index + 1}
                                </div>
                                <button
                                  onClick={() => handleToggleComplete(task)}
                                  className="text-white/40 hover:text-white transition-colors shrink-0 mt-px"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <Circle className="w-4 h-4" />
                                  )}
                                </button>
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => {
                                    if (editingTitle === task.id) return;
                                    if (selectionMode) {
                                      handleToggleSelectPrev(task.id);
                                    } else {
                                      setExpandedTaskId(prev => prev === task.id ? null : task.id);
                                    }
                                  }}
                                >
                                  {editingTitle === task.id ? (
                                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                      <input
                                        autoFocus
                                        value={editTitleValue}
                                        onChange={(e) => setEditTitleValue(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleSaveTitle(task); if (e.key === "Escape") setEditingTitle(null); }}
                                        onBlur={() => handleSaveTitle(task)}
                                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-amber-500/50"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`text-sm leading-5 ${
                                        isExpanded ? "whitespace-normal break-words" : "block truncate"
                                      } ${task.completed ? "text-white/40 line-through" : "text-white"}`}
                                    >
                                      {task.title}
                                    </span>
                                  )}
                                  {isExpanded && !selectionMode && editingTitle !== task.id && (
                                    <div className="mt-1.5 pt-1.5 border-t border-amber-500/20 space-y-2">
                                      <div className="flex items-center gap-1">
                                        {task.alarm_time && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{task.alarm_time}</span>
                                          </div>
                                        )}
                                        {task.notes && editingNotes[task.id] === undefined && (
                                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                                            <MessageSquare className="w-3 h-3" />
                                            <span>Notes</span>
                                          </div>
                                        )}
                                        <div className="flex-1" />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); moveTasksToToday.mutate([task]); }}
                                          className="h-6 px-2 text-[10px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 gap-1"
                                        >
                                          <ArrowUp className="w-3 h-3" />
                                          Move to today
                                        </Button>
                                        <Popover open={editingAlarm === task.id} onOpenChange={(open) => {
                                          if (!open) { setEditingAlarm(null); setAlarmTime(""); }
                                        }}>
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingAlarm(task.id);
                                                setAlarmTime(task.alarm_time || "");
                                              }}
                                              className={`h-7 w-7 ${task.alarm_time ? 'text-amber-400' : 'text-white/40'} hover:text-amber-300 hover:bg-amber-500/10`}
                                            >
                                              <Clock className="w-3.5 h-3.5" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent className="w-auto p-3 bg-slate-900 border-white/10">
                                            <div className="space-y-2">
                                              <Input
                                                type="time"
                                                value={alarmTime}
                                                onChange={(e) => setAlarmTime(e.target.value)}
                                                className="bg-white/5 border-white/10 text-white"
                                              />
                                              <div className="flex gap-2">
                                                {task.alarm_time && (
                                                  <Button size="sm" variant="ghost" onClick={() => handleRemoveAlarm(task)} className="flex-1 text-red-400 hover:text-red-300">Remove</Button>
                                                )}
                                                <Button size="sm" onClick={() => handleSetAlarm(task)} className="flex-1 bg-amber-600 hover:bg-amber-700">Set</Button>
                                              </div>
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingNotes(prev => prev[task.id] !== undefined
                                              ? (() => { const n = { ...prev }; delete n[task.id]; return n; })()
                                              : { ...prev, [task.id]: task.notes || "" }
                                            );
                                          }}
                                          className={`h-7 w-7 ${task.notes ? 'text-indigo-400' : 'text-white/40'} hover:text-indigo-300 hover:bg-indigo-500/10`}
                                        >
                                          <MessageSquare className="w-3.5 h-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => { e.stopPropagation(); setEditingTitle(task.id); setEditTitleValue(task.title); }}
                                          className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                                        >
                                          <Pencil className="w-3.5 h-3.5" />
                                        </Button>
                                        <ListPickerButton task={task} lists={taskLists} onMove={handleMoveToList} />
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task); }}
                                          className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      </div>
                                      {editingNotes[task.id] !== undefined && (
                                        <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                                          <Textarea
                                            value={editingNotes[task.id]}
                                            onChange={(e) => setEditingNotes(prev => ({ ...prev, [task.id]: e.target.value }))}
                                            placeholder="Add notes..."
                                            rows={2}
                                            className="bg-white/5 border-amber-500/20 text-white text-xs resize-none min-h-[48px]"
                                          />
                                          <div className="flex justify-end gap-1.5">
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => setEditingNotes(prev => { const n = { ...prev }; delete n[task.id]; return n; })}
                                              className="h-6 px-2 text-xs text-white/40 hover:text-white"
                                            >
                                              Cancel
                                            </Button>
                                            <Button
                                              size="sm"
                                              onClick={() => handleSaveNotes(task)}
                                              className="h-6 px-2 text-xs bg-indigo-600 hover:bg-indigo-700"
                                            >
                                              <Save className="w-3 h-3 mr-1" />
                                              Save
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                      {editingNotes[task.id] === undefined && task.notes && (
                                        <p className="text-xs text-white/50 whitespace-pre-wrap pl-0.5">{task.notes}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                                {!selectionMode && !isExpanded && (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); moveTasksToToday.mutate([task]); }}
                                    className="relative shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/15 transition-all group/btn"
                                    title="Move to today"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-slate-800 text-[10px] text-cyan-300 whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none border border-cyan-500/20 shadow-lg">
                                      Move to today
                                    </span>
                                  </button>
                                )}
                                {!selectionMode && !isExpanded && (
                                  <div className="flex items-center gap-1 shrink-0 mt-px">
                                    <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                                      task.alarm_time ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-white/20'
                                    }`}>
                                      <Clock className="w-2.5 h-2.5" />
                                      {task.alarm_time && <span>{task.alarm_time}</span>}
                                    </div>
                                    <div className={`flex items-center px-1.5 py-0.5 rounded-full text-[10px] ${
                                      task.notes ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/20'
                                    }`}>
                                      <MessageSquare className="w-2.5 h-2.5" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                            return snapshot.isDragging ? createPortal(taskRow, document.body) : taskRow;
                          }}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
            </div>
          )}
          </DragDropContext>

          {sortedTodayTasks.length === 0 && sortedPreviousTasks.length === 0 && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-8 text-center">
              <Target className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-white/60">No tasks yet. Add your first goal above!</p>
            </div>
          )}

          {sortedTodayTasks.length > 0 && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Today's Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all"
                      style={{
                        width: `${(sortedTodayTasks.filter((t) => t.completed).length / sortedTodayTasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-cyan-400">
                  {sortedTodayTasks.filter((t) => t.completed).length} / {sortedTodayTasks.length}
                </span>
              </div>
            </div>
          )}

          <ProGate
            title="Task history"
            description="Browse every task you've ever completed, search them, and bring old ones back — your full work memory."
          >
            <TaskHistoryCalendar />
          </ProGate>
        </div>
      </div>

      {/* One-time offer to mirror scheduled tasks into Google Calendar */}
      {calendarPromptTask && createPortal(
        <div className="fixed inset-0 z-[95] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-br from-slate-900/98 to-cyan-950/40 backdrop-blur-xl rounded-3xl border border-cyan-500/25 p-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Sync with Google Calendar?</h2>
                <p className="text-xs text-white/40">You just scheduled a task</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              Connect your calendar and NomadBalance will create an event whenever you
              set a time on a task, and tick it off there when you complete it.
            </p>

            <div className="mt-5 space-y-2">
              <Button
                onClick={acceptCalendarPrompt}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-500 hover:from-cyan-500 hover:to-blue-400 font-semibold"
              >
                Connect Google Calendar
              </Button>
              <button
                onClick={dismissCalendarPrompt}
                className="w-full h-10 rounded-2xl text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation dialog for completing all old tasks */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Complete old tasks?</h3>
            </div>
            <p className="text-white/60 text-sm mb-2">
              This will mark <strong className="text-white">{previousTasks.length} task{previousTasks.length > 1 ? "s" : ""}</strong> as completed:
            </p>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-6 space-y-1.5 max-h-40 overflow-y-auto">
              {previousTasks.slice(0, 5).map((task, i) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <Circle className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
                  <span className="text-white/70 truncate">{task.title}</span>
                </div>
              ))}
              {previousTasks.length > 5 && (
                <p className="text-white/30 text-xs pl-5">...and {previousTasks.length - 5} more</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 h-11 rounded-xl text-white/50 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  completeAllPreviousTasks.mutate();
                  setShowCompleteConfirm(false);
                }}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400"
              >
                Complete all
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}