import { Trash2, GripVertical, Clock } from 'lucide-react';

export default function TaskCard({ task, onDelete, isDragging }) {
  const priorityColors = {
    LOW: 'bg-brand-success/10 text-brand-success dark:bg-brand-success/20',
    MEDIUM: 'bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20',
    HIGH: 'bg-brand-danger/10 text-brand-danger dark:bg-brand-danger/20'
  };

  return (
    <div className={`bg-white dark:bg-surface-800 rounded-lg p-4 shadow-sm border border-surface-200 dark:border-surface-700 group transition-all duration-200 ${isDragging ? 'shadow-lg ring-2 ring-brand-primary scale-105' : 'hover:shadow-md hover:-translate-y-1'}`}>
      
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="cursor-grab active:cursor-grabbing text-surface-400 dark:text-surface-500 hover:text-brand-primary">
            <GripVertical size={16} />
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${priorityColors[task.priority || 'MEDIUM']}`}>
            {task.priority || 'MEDIUM'}
          </span>
        </div>
        
        <button
          onClick={() => onDelete(task.id)}
          className="text-surface-400 hover:text-brand-danger opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <h3 className="font-semibold text-surface-900 dark:text-white mb-1 pl-6">{task.title}</h3>
      
      {task.description && (
        <p className="text-sm text-surface-600 dark:text-surface-400 pl-6 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs font-medium text-surface-500 dark:text-surface-400 pl-6 mt-3">
        <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded">
          <Clock size={12} />
          <span>{task.estimatedPomodoros} Pomodoros</span>
        </div>
      </div>
    </div>
  );
}