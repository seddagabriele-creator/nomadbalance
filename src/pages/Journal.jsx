import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Plus, GripVertical, Trash2, CheckCircle2, Circle, Eye, EyeOff, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
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
  const today = new Date().toISOString().split("T")[0];
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showWorkDayTasks, setShowWorkDayTasks] = useState(true);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [alarmTime, setAlarmTime] = useState("");

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;
  const isInWorkDay = session?.status === "active";

  // Get all tasks (pre-day and work day, including previous uncompleted)
  const { data: allTasks = [] } = useQuery({
    queryKey: ["allTasks"],
    queryFn: () => base44.entities.Task.list("-order"),
  });

  // Get previous day's uncompleted tasks
  const previousUncompletedTasks = allTasks.filter(
    t => t.session_id !== session?.id && !t.completed && t.session_id !== null
  );

  // Filter tasks based on context
  const tasks = isInWorkDay
    ? allTasks.filter(t => t.session_id === session.id || (!t.completed && t.session_id !== null && t.session_id !== session.id))
    : showWorkDayTasks
    ? allTasks
    : allTasks.filter(t => !t.is_work_day_task || !t.completed);

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      setNewTaskTitle("");
      toast.success("Task added");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["allTasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allTasks"] });
      toast.success("Task deleted");
    },
  });

  const completeAllPreviousTasks = useMutation({
    mutationFn: async () => {
      const promises = previousUncompletedTasks.map(task =>
        base44.entities.Task.update(task.id, {
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
    const maxOrder = allTasks.length > 0 ? Math.max(...allTasks.map((t) => t.order)) : 0;
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(sortedTasks);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    reordered.forEach((task, index) => {
      if (task.order !== index + 1) {
        updateTask.mutate({
          id: task.id,
          data: { order: index + 1 },
        });
      }
    });
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
                onClick={() => completeAllPreviousTasks.mutate()}
                variant="ghost"
                className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Complete {previousUncompletedTasks.length} old tasks
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

          {sortedTasks.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4">Priority Order</h2>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="tasks">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                      {sortedTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                snapshot.isDragging
                                  ? "bg-white/15 border-cyan-500/50"
                                  : "bg-white/5 border-white/10"
                              }`}
                            >
                              <div {...provided.dragHandleProps} className="text-white/40 hover:text-white/60">
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold">
                                  {index + 1}
                                </div>
                                <button
                                  onClick={() => handleToggleComplete(task)}
                                  className="text-white/40 hover:text-white transition-colors"
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                  ) : (
                                    <Circle className="w-5 h-5" />
                                  )}
                                </button>
                                <div className="flex-1 flex items-center gap-2">
                                  <span
                                    className={`flex-1 ${
                                      task.completed ? "text-white/40 line-through" : "text-white"
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                  {task.alarm_time && (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                      <Clock className="w-3 h-3" />
                                      <span>{task.alarm_time}</span>
                                    </div>
                                  )}
                                </div>
                                </div>
                                <div className="flex items-center gap-1">
                                <Popover open={editingAlarm === task.id} onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingAlarm(null);
                                    setAlarmTime("");
                                  }
                                }}>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setEditingAlarm(task.id);
                                        setAlarmTime(task.alarm_time || "");
                                      }}
                                      className={`${task.alarm_time ? 'text-cyan-400' : 'text-white/40'} hover:text-cyan-300 hover:bg-cyan-500/10`}
                                    >
                                      <Clock className="w-4 h-4" />
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
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleRemoveAlarm(task)}
                                            className="flex-1 text-red-400 hover:text-red-300"
                                          >
                                            Remove
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          onClick={() => handleSetAlarm(task)}
                                          className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                                        >
                                          Set
                                        </Button>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask.mutate(task.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          )}

          {sortedTasks.length === 0 && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-8 text-center">
              <Target className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <p className="text-white/60">No tasks yet. Add your first goal above!</p>
            </div>
          )}

          {sortedTasks.length > 0 && (
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6">
              <h3 className="font-semibold mb-2">Progress</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all"
                      style={{
                        width: `${(sortedTasks.filter((t) => t.completed).length / sortedTasks.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-cyan-400">
                  {sortedTasks.filter((t) => t.completed).length} / {sortedTasks.length}
                </span>
              </div>
            </div>
          )}

          <TaskHistoryCalendar />
        </div>
      </div>
    </div>
  );
}