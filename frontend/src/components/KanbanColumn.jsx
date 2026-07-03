import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';

export default function KanbanColumn({ id, title, tasks, onDeleteTask }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col flex-1 min-w-[280px] bg-slate-50 dark:bg-surface-dark border border-slate-200/60 dark:border-slate-800 rounded-2xl p-4 transition-colors duration-200">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="font-bold text-slate-700 dark:text-slate-300 tracking-wide text-sm uppercase">
          {title}
        </h3>
        <span className="text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 rounded-xl p-1 transition-colors duration-200 min-h-[400px] ${
          isOver ? 'bg-slate-100/80 dark:bg-surface-cardDark/40 border-2 border-dashed border-brand-500/40' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800/80 rounded-xl p-4">
            <span className="text-xs text-slate-400 dark:text-slate-500">Drop tasks here</span>
          </div>
        )}
      </div>
    </div>
  );
}