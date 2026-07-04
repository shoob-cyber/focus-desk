import { useState, useEffect } from 'react';
import { taskAPI } from '../api/client';
import TaskCard from '../components/TaskCard';
import AITaskBreakdown from '../components/AITaskBreakdown';
import { Plus } from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedPomodoros: 1,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.createTask(
        formData.title,
        formData.description,
        formData.dueDate,
        formData.estimatedPomodoros
      );
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        estimatedPomodoros: 1,
      });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleCreateTaskFromAI = async (taskData) => {
    try {
      await taskAPI.createTask(
        taskData.title,
        taskData.description || '',
        taskData.dueDate || '',
        taskData.estimatedPomodoros || 1
      );
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskAPI.deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await taskAPI.updateTask(taskId, updates);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Organize tasks by status
  const todoTasks = tasks.filter(t => t.status === 'PENDING');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          <Plus size={20} />
          <span>New Task</span>
        </button>
      </div>

      {/* AI Task Breakdown */}
      <AITaskBreakdown onTasksGenerated={handleCreateTaskFromAI} />

      {/* Create Task Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Build login page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Task details (optional)"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Est. Pomodoros
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.estimatedPomodoros}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estimatedPomodoros: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Kanban Board */}
      {loading ? (
        <div className="text-center text-gray-600 dark:text-gray-400">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">No tasks yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
              To Do <span className="text-gray-600 dark:text-gray-400">{todoTasks.length}</span>
            </h3>
            <div className="space-y-3">
              {todoTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
              In Progress <span className="text-gray-600 dark:text-gray-400">{inProgressTasks.length}</span>
            </h3>
            <div className="space-y-3">
              {inProgressTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg">
              Done <span className="text-gray-600 dark:text-gray-400">{completedTasks.length}</span>
            </h3>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}