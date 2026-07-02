import { useState, useEffect, useCallback } from 'react';
import { taskAPI, sessionAPI, userAPI } from '../api/client';
import { Play, Pause, RotateCcw, Loader2, Bell } from 'lucide-react';
import { Play, Pause, RotateCcw, Loader2, Bell, Flame } from 'lucide-react';

export default function TimerPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  
  // Settings & State
  const [settings, setSettings] = useState({ pomodoroDuration: 25, shortBreakDuration: 5, longBreakDuration: 15 });
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('focus'); // focus, shortBreak, longBreak
  const [completedSessions, setCompletedSessions] = useState(0);
  const [loading, setLoading] = useState(true);

  // Ask for notification permissions on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tasksRes, settingsRes] = await Promise.all([
        taskAPI.getTasks(),
        userAPI.getSettings().catch(() => ({ data: null })) // Fallback if settings endpoint fails
      ]);
      
      setTasks(tasksRes.data.filter((t) => t.status !== 'COMPLETED'));
      if (tasksRes.data.length > 0) setSelectedTaskId(tasksRes.data[0].id);

      if (settingsRes.data) {
        setSettings(settingsRes.data);
        setTimeLeft(settingsRes.data.pomodoroDuration * 60);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Timer Tick Logic
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Generate a soft "ding" sound using the browser's AudioContext (No external files needed)
  const playChime = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5 note
      osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.5); // Slide up to C6
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1); // Fade out
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.log("Audio not supported");
    }
  }, []);

  const handleSessionComplete = async () => {
    setIsRunning(false);
    playChime();

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusDesk', {
        body: sessionType === 'focus' ? "Great job! Time for a break." : "Break is over! Ready to focus?",
        icon: '/favicon.ico' // Assuming you have a standard favicon
      });
    }

    if (sessionType === 'focus') {
      try {
        await sessionAPI.logSession(selectedTaskId || null, settings.pomodoroDuration, true);
        setCompletedSessions((prev) => prev + 1);
      } catch (error) {
        console.error('Error logging session:', error);
      }

      // Determine next break type
      if ((completedSessions + 1) % 4 === 0) {
        setSessionType('longBreak');
        setTimeLeft(settings.longBreakDuration * 60);
      } else {
        setSessionType('shortBreak');
        setTimeLeft(settings.shortBreakDuration * 60);
      }
    } else {
      setSessionType('focus');
      setTimeLeft(settings.pomodoroDuration * 60);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    if (sessionType === 'focus') setTimeLeft(settings.pomodoroDuration * 60);
    else if (sessionType === 'shortBreak') setTimeLeft(settings.shortBreakDuration * 60);
    else setTimeLeft(settings.longBreakDuration * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // SVG Circle Calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  
  const getTotalTime = () => {
    if (sessionType === 'focus') return settings.pomodoroDuration * 60;
    if (sessionType === 'shortBreak') return settings.shortBreakDuration * 60;
    return settings.longBreakDuration * 60;
  };

  const percentage = (timeLeft / getTotalTime()) * 100;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getThemeColors = () => {
    if (sessionType === 'focus') return { bg: 'bg-brand-primary', ring: 'text-blue-300', fill: 'text-white' };
    if (sessionType === 'shortBreak') return { bg: 'bg-brand-success', ring: 'text-emerald-300', fill: 'text-white' };
    return { bg: 'bg-brand-secondary', ring: 'text-purple-300', fill: 'text-white' };
  };

  const theme = getThemeColors();

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>;

  return (
    <div className={`min-h-[calc(100vh-64px)] p-6 flex flex-col items-center justify-center transition-colors duration-1000 ${theme.bg}`}>
      
      <div className="w-full max-w-md animate-fade-in flex flex-col items-center">
        
        {/* Session Indicator */}
        <span className="inline-block px-5 py-2 rounded-full bg-white/20 text-sm font-bold uppercase tracking-widest mb-8 backdrop-blur-sm text-white shadow-sm border border-white/30">
          {sessionType === 'focus' ? 'Deep Focus' : sessionType === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </span>

        {/* Circular Timer UI */}
        <div className="relative flex items-center justify-center mb-10 group">
          <svg className="w-72 h-72 transform -rotate-90">
            {/* Background Ring */}
            <circle cx="144" cy="144" r={radius} className={`${theme.ring} opacity-30`} strokeWidth="12" fill="transparent" />
            {/* Progress Ring */}
            <circle 
              cx="144" cy="144" r={radius} 
              className={`${theme.fill} transition-all duration-1000 ease-linear`} 
              strokeWidth="12" fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset} 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-white tracking-tight drop-shadow-md font-mono">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center mb-12">
          {!isRunning ? (
            <button onClick={() => setIsRunning(true)} className="flex items-center bg-white text-surface-900 hover:scale-105 transition-transform shadow-lg px-8 py-4 rounded-2xl text-lg font-bold">
              <Play size={24} className="mr-2" fill="currentColor" /> Start
            </button>
          ) : (
            <button onClick={() => setIsRunning(false)} className="flex items-center bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors border border-white/50 px-8 py-4 rounded-2xl text-lg font-bold">
              <Pause size={24} className="mr-2" fill="currentColor" /> Pause
            </button>
          )}
          <button onClick={handleReset} className="flex items-center bg-transparent border-2 border-white/30 text-white hover:bg-white/10 transition-colors px-6 py-4 rounded-2xl" aria-label="Reset Timer">
            <RotateCcw size={24} />
          </button>
        </div>

        {/* Task Selector & Stats Box */}
        <div className="w-full bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/20">
            <div className="text-white">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-1">Sessions Completed</p>
              <div className="flex items-center gap-2">
                <Flame size={20} className="text-orange-300" />
                <span className="text-2xl font-bold">{completedSessions}</span>
              </div>
            </div>
            <div className="text-right text-white">
              <p className="text-xs uppercase tracking-wider font-semibold opacity-80 mb-1">Notifications</p>
              <div className="flex items-center justify-end gap-1 text-sm font-medium">
                <Bell size={16} /> Enabled
              </div>
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="w-full">
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Currently Working On:
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 text-white border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white cursor-pointer font-medium appearance-none"
              >
                <option value="" className="text-surface-900">None selected</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id} className="text-surface-900">
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="text-center text-white/80 text-sm font-medium">
              No pending tasks. You're all caught up!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}