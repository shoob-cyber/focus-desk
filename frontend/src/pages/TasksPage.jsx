import { useState, useEffect } from 'react';
import { taskAPI } from '../api/client';
import TaskCard from '../components/TaskCard';
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

  return (
    <div className="max-w-4xl mx-auto p-layout-md lg:p-layout-lg animate-fade-in">
      <div className="flex justify-between items-center mb-layout-md">
        <h1 className="text-3xl font-bold text-surface-900">My Tasks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={20} className="mr-2" />
          <span>New Task</span>
        </button>
      </div>

      {showForm && (
        <div className="card mb-layout-md animate-slide-up border border-brand-primary/20">
          <h2 className="text-xl font-bold mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1">
                Task Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="input-field"
                placeholder="e.g., Build login page"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-800 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="input-field"
                placeholder="Task details (optional)"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 mb-1">
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
                  className="input-field"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="btn btn-primary flex-1">
                Create Task
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center text-surface-800 opacity-70 p-8">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="card bg-surface-50 border border-dashed border-surface-200 text-center p-12">
          <p className="text-surface-800 opacity-70 text-lg">No tasks yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
            />
          ))}
        </div>
      )}
    </div>
  );
}