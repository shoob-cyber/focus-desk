import { useState } from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';

export default function TaskCard({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState(task.status);
  const [editPriority, setEditPriority] = useState(task.priority || 'MEDIUM');

  // Only the grip handle is draggable — keeps the dropdowns/buttons clickable
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : 'auto',
      }
    : undefined;

  const handleStatusChange = async (newStatus) => {
    setEditStatus(newStatus);
    onUpdate(task.id, { status: newStatus });
    setIsEditing(false);
  };

  const handlePriorityChange = async (newPriority) => {
    setEditPriority(newPriority);
    onUpdate(task.id, { priority: newPriority });
  };

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
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow ${
        isDragging ? 'opacity-50 shadow-xl ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start gap-2">
            {/* Drag handle — this is the only draggable part of the card */}
            <span
              {...attributes}
              {...listeners}
              className="mt-1 text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none select-none inline-flex"
              title="Drag to move"
              role="button"
              tabIndex={0}
            >
              <GripVertical size={18} />
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{task.title}</h3>
          </div>

          {task.description && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 ml-6">{task.description}</p>
          )}

          <div className="flex items-center gap-3 mt-3 ml-6 text-sm text-gray-600 dark:text-gray-400">
            {task.dueDate && (
              <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
            )}
            <span>⏱️ {task.estimatedPomodoros} pomodoros</span>
          </div>

          {/* Priority Badge */}
          <div className="mt-3 ml-6 flex gap-2">
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

        {/* Status + Actions */}
        <div className="flex items-center gap-2 ml-4">
          {isEditing ? (
            <select
              value={editStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`px-3 py-1 border border-gray-300 rounded text-sm ${getStatusColor(editStatus)}`}
            >
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          ) : (
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)} cursor-pointer hover:opacity-80`}
              onClick={() => setIsEditing(true)}
            >
              {task.status}
            </span>
          )}

          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded transition"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}