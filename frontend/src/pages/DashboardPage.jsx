import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await analyticsAPI.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center p-8 animate-fade-in">Loading your stats...</div>;
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
    <div className="max-w-6xl mx-auto p-layout-md lg:p-layout-lg animate-fade-in">
      <h1 className="text-3xl font-bold text-surface-900 mb-layout-md">Your Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-layout-sm mb-layout-lg">
        <div className="card stat-card-streak hover:-translate-y-1">
          <div className="flex items-center space-x-3">
            <Flame size={32} />
            <div>
              <p className="text-sm opacity-90 font-medium">Current Streak</p>
              <p className="text-3xl font-bold tracking-tight">{stats.streak}</p>
            </div>
          </div>
        </div>

        <div className="card stat-card-sessions hover:-translate-y-1">
          <p className="text-sm opacity-90 font-medium">Total Sessions</p>
          <p className="text-3xl font-bold tracking-tight">{stats.totalSessions}</p>
        </div>

        <div className="card bg-brand-success text-white hover:-translate-y-1 border-none">
          <p className="text-sm opacity-90 font-medium">Total Focus Time</p>
          <p className="text-3xl font-bold tracking-tight">{stats.totalFocusHours}h</p>
        </div>

        <div className="card bg-brand-secondary text-white hover:-translate-y-1 border-none">
          <p className="text-sm opacity-90 font-medium">Total Minutes</p>
          <p className="text-3xl font-bold tracking-tight">{stats.totalFocusMinutes}</p>
        </div>
      </div>

      <div className="card mb-layout-lg">
        <h2 className="text-xl font-bold text-surface-900 mb-4">This Week</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            />
            <Bar dataKey="minutes" fill="#2563EB" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2 className="text-xl font-bold text-surface-900 mb-4">Focus Heatmap</h2>
        <div className="grid grid-cols-7 gap-2">
          {Object.entries(stats.heatmap)
            .reverse()
            .map(([date, minutes]) => {
              let bgColor = 'bg-surface-100';
              if (minutes > 0 && minutes <= 25) bgColor = 'bg-blue-200';
              if (minutes > 25 && minutes <= 50) bgColor = 'bg-blue-400';
              if (minutes > 50 && minutes <= 100) bgColor = 'bg-blue-600';
              if (minutes > 100) bgColor = 'bg-brand-primary';

              return (
                <div
                  key={date}
                  className={`${bgColor} rounded-md p-2 text-center text-xs font-semibold text-white cursor-pointer hover:scale-105 transition-transform duration-200 shadow-sm`}
                  title={`${date}: ${minutes} minutes`}
                >
                  {minutes > 0 ? `${(minutes / 60).toFixed(0)}h` : '—'}
                </div>
              );
            })}
        </div>
        <p className="text-sm text-surface-800 opacity-70 mt-4 text-center">Each square represents a day. Darker = more focus time.</p>
      </div>
    </div>
  );
}