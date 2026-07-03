import { useState, useEffect } from 'react';
import { analyticsAPI, taskAPI } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Flame } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [analyticsRes, tasksRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        taskAPI.getTasks()
      ]);
      setStats(analyticsRes.data);
      const allTasks = tasksRes.data;
      setTaskStats({
        completed: allTasks.filter(t => t.status === 'COMPLETED').length,
        total: allTasks.length
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Error loading stats</div>;

  const chartData = Object.entries(stats.heatmap || {})
    .reverse()
    .map(([date, minutes]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes,
    }));

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange-400 to-red-500 text-white p-6 rounded-lg shadow">
          <div className="flex items-center space-x-3">
            <Flame size={32} />
            <div>
              <p className="text-sm opacity-90">Streak</p>
              <p className="text-3xl font-bold">{stats.streak || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow">
          <p className="text-sm opacity-90">Sessions</p>
          <p className="text-3xl font-bold">{stats.totalSessions || 0}</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow">
          <p className="text-sm opacity-90">Hours</p>
          <p className="text-3xl font-bold">{stats.totalFocusHours || 0}h</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow">
          <p className="text-sm opacity-90">Tasks</p>
          <p className="text-3xl font-bold">{taskStats.completed}/{taskStats.total}</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">This Week</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Focus Heatmap (7 Days)</h2>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(stats.heatmap || {})
            .reverse()
            .map(([date, minutes]) => {
              let bgColor = 'bg-gray-100 dark:bg-gray-700';
              if (minutes > 0 && minutes <= 25) bgColor = 'bg-blue-200 dark:bg-blue-900';
              if (minutes > 25 && minutes <= 50) bgColor = 'bg-blue-400 dark:bg-blue-700';
              if (minutes > 50 && minutes <= 100) bgColor = 'bg-blue-600 dark:bg-blue-600';
              if (minutes > 100) bgColor = 'bg-blue-800 dark:bg-blue-500';

              return (
                <div
                  key={date}
                  className={`${bgColor} rounded p-2 text-center text-xs font-semibold text-white cursor-pointer hover:opacity-80 transition`}
                  title={`${date}: ${minutes} minutes`}
                >
                  {minutes > 0 ? `${(minutes / 60).toFixed(0)}h` : '—'}
                </div>
              );
            })}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Darker = more focus time</p>
      </div>
    </div>
  );
}