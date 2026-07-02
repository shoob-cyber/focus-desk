import { useState, useEffect } from 'react';
import { analyticsAPI, sessionAPI, taskAPI } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Download, Loader2, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [taskStats, setTaskStats] = useState({ completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch both analytics and tasks simultaneously
      const [analyticsRes, tasksRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        taskAPI.getTasks()
      ]);
      
      setStats(analyticsRes.data);
      
      // Calculate task completion stats for the new card
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

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await sessionAPI.getSessions();
      const sessions = response.data;
      
      if (!sessions || sessions.length === 0) {
        alert("No sessions found to export.");
        return;
      }

      // Prepare CSV headers and rows
      const headers = ['Date', 'Duration (Minutes)', 'Completed', 'Task ID'];
      const csvRows = sessions.map(session => [
        new Date(session.startedAt).toLocaleString(),
        session.durationMinutes,
        session.completed ? 'Yes' : 'No',
        session.taskId || 'None'
      ]);

      // Construct CSV string
      const csvContent = [
        headers.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Trigger file download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `focusdesk_analytics_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export data.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center p-8 animate-fade-in text-brand-danger">Error loading stats</div>;
  }

  const chartData = Object.entries(stats.heatmap)
    .reverse()
    .map(([date, minutes]) => ({
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      minutes,
    }));

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in">
      
      {/* Header with Export Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Your Dashboard</h1>
        <button 
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center space-x-2 bg-white dark:bg-surface-800 text-surface-800 dark:text-white border border-surface-200 dark:border-surface-700 px-4 py-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700 transition shadow-sm disabled:opacity-50"
        >
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          <span className="text-sm font-medium">{exporting ? 'Exporting...' : 'Export CSV'}</span>
        </button>
      </div>

      {/* Stats Grid - Now using lg:grid-cols-5 to fit the new task stats card */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        
        {/* New Tasks Completed Card */}
        <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 hover:-translate-y-1 transition-transform">
          <div className="flex items-center space-x-3">
            <CheckCircle2 size={32} className="text-brand-success" />
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Tasks Done</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight">
                {taskStats.completed} <span className="text-lg text-surface-400 font-normal">/ {taskStats.total}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 hover:-translate-y-1 transition-transform">
          <div className="flex items-center space-x-3">
            <Flame size={32} className="text-brand-primary" />
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Current Streak</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight">{stats.streak}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 hover:-translate-y-1 transition-transform">
          <p className="text-sm text-surface-500 dark:text-surface-400 font-medium">Total Sessions</p>
          <p className="text-3xl font-bold text-surface-900 dark:text-white tracking-tight">{stats.totalSessions}</p>
        </div>

        <div className="bg-brand-success p-6 rounded-xl shadow-sm text-white hover:-translate-y-1 transition-transform">
          <p className="text-sm opacity-90 font-medium">Total Focus Time</p>
          <p className="text-3xl font-bold tracking-tight">{stats.totalFocusHours}h</p>
        </div>

        <div className="bg-brand-secondary p-6 rounded-xl shadow-sm text-white hover:-translate-y-1 transition-transform">
          <p className="text-sm opacity-90 font-medium">Total Minutes</p>
          <p className="text-3xl font-bold tracking-tight">{stats.totalFocusMinutes}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 mb-8">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">This Week</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', color: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700">
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-6">Focus Heatmap</h2>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(stats.heatmap)
            .reverse()
            .map(([date, minutes]) => {
              let bgColor = 'bg-surface-100 dark:bg-surface-700';
              if (minutes > 0 && minutes <= 25) bgColor = 'bg-blue-200 dark:bg-blue-900/40';
              if (minutes > 25 && minutes <= 50) bgColor = 'bg-blue-400 dark:bg-blue-700/60';
              if (minutes > 50 && minutes <= 100) bgColor = 'bg-blue-500 dark:bg-blue-600';
              if (minutes > 100) bgColor = 'bg-brand-primary dark:bg-brand-primary';

              return (
                <div
                  key={date}
                  className={`${bgColor} rounded-md p-3 text-center text-xs font-semibold text-surface-700 dark:text-white cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm border border-transparent hover:border-brand-primary`}
                  title={`${date}: ${minutes} minutes`}
                >
                  {minutes > 0 ? `${(minutes / 60).toFixed(0)}h` : '—'}
                </div>
              );
            })}
        </div>
        <p className="text-sm text-surface-500 dark:text-surface-400 mt-6 text-center">Each square represents a day. Darker = more focus time.</p>
      </div>
    </div>
  );
}