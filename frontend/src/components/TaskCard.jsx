import { useState } from 'react';
import { motion } from 'framer-motion';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable } from '@dnd-kit/core';
import { Trash2, ArrowRight, ArrowLeft, Check, RotateCcw, GripVertical } from 'lucide-react';

export default function TaskCard({ task, onDelete, onUpdate }) {
  const [editPriority, setEditPriority] = useState(task.priority || 'MEDIUM');
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const handlePriorityChange = async (newPriority) => {
    setEditPriority(newPriority);
    onUpdate(task.id, { priority: newPriority });
  };

  const setStatus = (newStatus) => onUpdate(task.id, { status: newStatus });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      style={{
        transform: CSS.Transform.toString(transform),
        zIndex: isDragging ? 50 : undefined,
      }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
        isDragging ? 'opacity-60 shadow-xl ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            <span
              {...attributes}
              {...listeners}
              className="mt-1 inline-flex select-none text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
              title="Drag to move"
              role="button"
              tabIndex={0}
            >
              <GripVertical size={18} />
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
          </div>

          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{task.description}</p>
          )}

          <div className="flex items-center gap-3 mt-3 text-sm text-gray-600 dark:text-gray-400">
            {task.dueDate && (
              <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
            <span>⏱️ {task.estimatedPomodoros} pomodoros</span>
          </div>

          {/* Priority Badge */}
          <div className="mt-3 flex gap-2">
            <select
              value={editPriority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(editPriority)} cursor-pointer border-0`}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>

        {/* Status badge + delete */}
        <div className="flex items-center gap-2 ml-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>

          <button
            onClick={(e) => { e.currentTarget.blur(); onDelete(task.id); }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Explicit status actions — the primary, always-reliable way to move a task forward */}
      <div className="mt-4 flex gap-2">
        {task.status === 'PENDING' && (
          <button
            onClick={(e) => { e.currentTarget.blur(); setStatus('IN_PROGRESS'); }}
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg transition"
          >
            Start Working <ArrowRight size={14} />
          </button>
        )}

        {task.status === 'IN_PROGRESS' && (
          <>
            <button
              onClick={(e) => { e.currentTarget.blur(); setStatus('COMPLETED'); }}
              className="flex items-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40 px-3 py-1.5 rounded-lg transition"
            >
              <Check size={14} /> Mark Complete
            </button>
            <button
              onClick={(e) => { e.currentTarget.blur(); setStatus('PENDING'); }}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
            >
              <ArrowLeft size={14} /> Back to To Do
            </button>
          </>
        )}

        {task.status === 'COMPLETED' && (
          <button
            onClick={(e) => { e.currentTarget.blur(); setStatus('IN_PROGRESS'); }}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            <RotateCcw size={14} /> Reopen
          </button>
        )}
      </div>
    </motion.div>
  );
}