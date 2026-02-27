import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { daySessionService, taskService } from "../api/services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Plus, GripVertical, Trash2, CheckCircle2, Circle, Eye, EyeOff, Clock } from "lucide-react";
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

export default function Journal() {
  const queryClient = useQueryClient();
  const today = getLocalDateString();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showWorkDayTasks, setShowWorkDayTasks] = useState(true);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [alarmTime, setAlarmTime] = useState("");
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => daySessionService.getByDate(today),
  });

  const session = sessions[0] || null;
  const isInWorkDay = session?.status === "active";

  // Get all tasks
  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasks", session?.id],
    queryFn: () => taskService.listAll("-order"),
    enabled: true,
  });

  // Get previous day's uncompleted tasks
  const previousUncompletedTasks = allTasks.filter(
    t => t.session_id && t.session_id !== session?.id && !t.completed
  );

  // Filter tasks based on context
  const todayTasks = isInWorkDay
    ? allTasks.filter(t => t.session_id === session?.id)
    : allTasks.filter(t => !t.session_id);

  const previousTasks = isInWorkDay
    ? previousUncompletedTasks
    : [];

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
      const promises = previousUncompletedTasks.map(task =>
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

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const maxOrder = todayTasks.length > 0 ? Math.max(...todayTasks.map((t) => t.order)) : 0;
    createTask.mutate({
      session_id: session?.id || null,
      title: newTaskTitle,
      order: maxOrder + 1,
      is_work_day_task: isInWorkDay,
    });
  };

  const handleToggleComplete = (task) => {
    updateTask.mutate({
      id: task.id,
      data: {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      },
    });
  };

  const handleSetAlarm = (task) => {
    if (alarmTime) {
      updateTask.mutate({
        id: task.id,
        data: { alarm_time: alarmTime },
      });
      toast.success("Alarm set");
    }
    setEditingAlarm(null);
    setAlarmTime("");
  };

  const handleRemoveAlarm = (task) => {
    updateTask.mutate({
      id: task.id,
      data: { alarm_time: null },
    });
    toast.success("Alarm removed");
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const listId = result.source.droppableId;
    const tasksList = listId === "today" ? sortedTodayTasks : sortedPreviousTasks;

    const reordered = Array.from(tasksList);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    // Build order map for optimistic update
    const orderMap = new Map();
    reordered.forEach((task, index) => {
      orderMap.set(task.id, index + 1);
    });

    // Optimistic update — instantly reflect new order in UI
    queryClient.setQueryData(["allTasks", session?.id], (old) => {
      if (!old) return old;
      return old.map(task => {
        const newOrder = orderMap.get(task.id);
        return newOrder !== undefined ? { ...task, order: newOrder } : task;
      });
    });

    // Persist to backend (bypass mutation to avoid per-item invalidation)
    const updates = reordered
      .filter((task, index) => task.order !== index + 1)
      .map((task, index) => {
        const newOrder = orderMap.get(task.id);
        return taskService.update(task.id, { order: newOrder });
      });

    try {
      await Promise.all(updates);
    } finally {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
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
          </div>

          <div className="flex items-center gap-2">
            {previousUncompletedTasks.length > 0 && isInWorkDay && (
              <Button
                onClick={() => setShowCompleteConfirm(true)}
                variant="ghost"
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete {previousUncompletedTasks.length} old
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
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <div className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="Add a new task..."
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

          {sortedTodayTasks.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
              <h2 className="text-lg font-semibold mb-3">Today's Tasks</h2>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="today">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-1.5">
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
                                  onClick={() => setExpandedTaskId(prev => prev === task.id ? null : task.id)}
                                >
                                  <span
                                    className={`text-sm leading-5 ${
                                      isExpanded ? "whitespace-normal break-words" : "block truncate"
                                    } ${task.completed ? "text-white/40 line-through" : "text-white"}`}
                                  >
                                    {task.title}
                                  </span>
                                  {isExpanded && (
                                    <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-white/10">
                                      {task.alarm_time && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                          <Clock className="w-3 h-3" />
                                          <span>{task.alarm_time}</span>
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
                                        onClick={(e) => { e.stopPropagation(); deleteTask.mutate(task.id); }}
                                        className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {!isExpanded && task.alarm_time && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] shrink-0 mt-px">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{task.alarm_time}</span>
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
              </DragDropContext>
            </div>
          )}

          {sortedPreviousTasks.length > 0 && (
            <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-4">
              <h2 className="text-lg font-semibold mb-3 text-amber-400">Previous Tasks</h2>
              <DragDropContext onDragEnd={handleDragEnd}>
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
                                className={`flex items-start gap-1.5 px-2 py-1.5 rounded-xl border transition-colors ${
                                  snapshot.isDragging
                                    ? "bg-slate-900 border-amber-500/50 shadow-lg shadow-amber-500/10"
                                    : "bg-amber-500/5 border-amber-500/20"
                                }`}
                              >
                                <div {...provided.dragHandleProps} className="text-white/40 hover:text-white/60 shrink-0 pt-0.5">
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
                                  onClick={() => setExpandedTaskId(prev => prev === task.id ? null : task.id)}
                                >
                                  <span
                                    className={`text-sm leading-5 ${
                                      isExpanded ? "whitespace-normal break-words" : "block truncate"
                                    } ${task.completed ? "text-white/40 line-through" : "text-white"}`}
                                  >
                                    {task.title}
                                  </span>
                                  {isExpanded && (
                                    <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-amber-500/20">
                                      {task.alarm_time && (
                                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                          <Clock className="w-3 h-3" />
                                          <span>{task.alarm_time}</span>
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
                                        onClick={(e) => { e.stopPropagation(); deleteTask.mutate(task.id); }}
                                        className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {!isExpanded && task.alarm_time && (
                                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] shrink-0 mt-px">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{task.alarm_time}</span>
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
              </DragDropContext>
            </div>
          )}

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

          <TaskHistoryCalendar />
        </div>
      </div>

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
              This will mark <strong className="text-white">{previousUncompletedTasks.length} task{previousUncompletedTasks.length > 1 ? "s" : ""}</strong> as completed:
            </p>
            <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-6 space-y-1.5 max-h-40 overflow-y-auto">
              {previousUncompletedTasks.slice(0, 5).map((task, i) => (
                <div key={task.id} className="flex items-center gap-2 text-sm">
                  <Circle className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
                  <span className="text-white/70 truncate">{task.title}</span>
                </div>
              ))}
              {previousUncompletedTasks.length > 5 && (
                <p className="text-white/30 text-xs pl-5">...and {previousUncompletedTasks.length - 5} more</p>
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