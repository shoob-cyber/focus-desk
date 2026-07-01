import React, { useState, useEffect } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import KanbanColumn from '../components/KanbanColumn';
import client from '../api/client'; // Assuming this maps to your unified API layer

const COLUMNS = [
  { id: 'PENDING', title: 'Pending 📝' },
  { id: 'IN_PROGRESS', title: 'In Progress ⚡' },
  { id: 'COMPLETED', title: 'Completed 🎉' }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  // Configure pointer activation constraints to allow standard button/input interactions smoothly
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await client.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error("Failed fetching tasks", err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const res = await client.post('/tasks', {
        title: newTitle,
        description: newDesc,
        priority: newPriority,
        status: 'PENDING'
      });
      setTasks((prev) => [...prev, res.data]);
      setNewTitle('');
      setNewDesc('');
      setNewPriority('MEDIUM');
    } catch (err) {
      console.error("Failed creating task", err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await client.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed deleting task", err);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id;
    const nextStatus = over.id; // Target column string ('PENDING', 'IN_PROGRESS', 'COMPLETED')

    // Find current task state locally
    const currentTask = tasks.find(t => t.id === taskId);
    if (!currentTask || currentTask.status === nextStatus) return;

    // Optimistically update frontend UI instantly
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus } : t));

    try {
      // Keep state bound inline with database schema fields
      await client.patch(`/tasks/${taskId}`, { status: nextStatus });
    } catch (err) {
      console.error("Backend synchronizing error", err);
      fetchTasks(); // Rollback local state state on request failure
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200 min-h-screen">
      
      {/* Task Creation Header Card */}
      <div className="bg-surface-light dark:bg-surface-cardDark border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl shadow-sm mb-8 transition-colors">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Create New Task</h2>
        <form onSubmit={handleCreateTask} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2 space-y-2">
            <input
              type="text"
              placeholder="What needs doing?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
            />
            <input
              type="text"
              placeholder="Add optional description..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide px-1">Priority</label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 bg-surface-light dark:bg-surface-cardDark dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm py-2 px-4 rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-[0.98] transform transition-all duration-150 h-[40px]"
          >
            Add to Board
          </button>
        </form>
      </div>

      {/* Kanban Canvas */}
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col md:flex-row gap-6 items-start overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              tasks={tasks.filter((t) => t.status === col.id)}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}