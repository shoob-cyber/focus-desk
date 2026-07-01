import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function TaskCard({ task, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityStyles = {
    LOW: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    HIGH: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-4 bg-surface-light dark:bg-surface-cardDark border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing group`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-slate-800 dark:text-slate-100 line-clamp-2">
          {task.title}
        </h4>
        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${priorityStyles[task.priority] || priorityStyles.MEDIUM}`}>
          {task.priority || 'MEDIUM'}
        </span>
      </div>
      
      {task.description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Stop drag event triggering
            onDelete(task.id);
          }}
          className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 font-medium transition-colors"
        >
          Delete Task
        </button>
      </div>
    </div>
  );
}