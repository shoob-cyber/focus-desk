import { useState } from 'react';
import { Sparkles, Loader } from 'lucide-react';
import { aiAPI } from '../api/client';

export default function AITaskBreakdown({ onTasksGenerated }) {
  const [taskDescription, setTaskDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState(null);
  const [error, setError] = useState('');

  const handleBreakdown = async () => {
    if (!taskDescription.trim()) {
      setError('Please enter a task description');
      return;
    }

    setLoading(true);
    setError('');
    setSubtasks(null);

    try {
      const response = await aiAPI.breakdownTask(taskDescription);
      setSubtasks(response.data.subtasks);
    } catch (err) {
      setError('Failed to break down task. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAll = async () => {
    if (!subtasks) return;

    try {
      for (const subtask of subtasks) {
        await onTasksGenerated({
          title: subtask.title,
          description: `Subtask of: ${taskDescription}`,
          estimatedPomodoros: subtask.estimatedPomodoros
        });
      }
      
      setTaskDescription('');
      setSubtasks(null);
      alert('✅ All subtasks added!');
    } catch (err) {
      setError('Failed to add tasks');
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 mb-6 border-2 border-dashed border-blue-300 dark:border-blue-700">
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="text-blue-500" size={24} />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Task Breakdown</h3>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Describe a task and AI will break it into smaller subtasks with Pomodoro estimates.
      </p>

      <textarea
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
        placeholder="e.g., Build a user authentication system..."
        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
        rows="3"
      />

      {error && (
        <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleBreakdown}
        disabled={loading}
        className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 mb-4"
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            <span>Breaking down...</span>
          </>
        ) : (
          <>
            <Sparkles size={20} />
            <span>Break Down with AI</span>
          </>
        )}
      </button>

      {subtasks && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">Suggested Subtasks:</h4>
          <div className="space-y-2 mb-4">
            {subtasks.map((task, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <input type="checkbox" defaultChecked className="mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{task.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    ⏱️ {task.estimatedPomodoros} Pomodoro{task.estimatedPomodoros > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddAll}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            ✅ Add All Subtasks
          </button>
        </div>
      )}
    </div>
  );
}