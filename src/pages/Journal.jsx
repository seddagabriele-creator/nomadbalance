import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Target, Plus, GripVertical, Trash2, CheckCircle2, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Journal() {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const { data: sessions = [] } = useQuery({
    queryKey: ["daySession", today],
    queryFn: () => base44.entities.DaySession.filter({ date: today }),
  });

  const session = sessions[0] || null;

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks", session?.id],
    queryFn: () => {
      if (!session?.id) return [];
      return base44.entities.Task.filter({ session_id: session.id });
    },
    enabled: !!session?.id,
  });

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  const createTask = useMutation({
    mutationFn: (data) => base44.entities.Task.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setNewTaskTitle("");
      toast.success("Task added");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Task.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => base44.entities.Task.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
  });

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !session) return;
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : 0;
    createTask.mutate({
      session_id: session.id,
      title: newTaskTitle,
      order: maxOrder + 1,
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
        <div className="flex items-center gap-3 mb-8">
          <Link to={createPageUrl("Dashboard")}>
            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-bold">Today's Goals</h1>
          </div>
        </div>

        {!session && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <p className="text-white/60">Start your day first to create tasks</p>
            <Link to={createPageUrl("Dashboard")}>
              <Button className="mt-4 bg-gradient-to-r from-violet-600 to-cyan-500">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {session && (
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
                                  <span
                                    className={`flex-1 ${
                                      task.completed ? "text-white/40 line-through" : "text-white"
                                    }`}
                                  >
                                    {task.title}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteTask.mutate(task.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
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
          </div>
        )}
      </div>
    </div>
  );
}