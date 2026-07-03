import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { sessionAPI } from '../api/client';

// Default durations in minutes — override via props for user settings
const DEFAULTS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
};

const SESSION_LABELS = {
  focus: 'Deep Focus',
  shortBreak: 'Short Break',
  longBreak: 'Long Break',
};

const SESSION_COLORS = {
  focus: {
    bg: 'bg-blue-600',
    ring: '#3b82f6',
    track: '#1e3a5f',
    badge: 'bg-white/20 text-white',
  },
  shortBreak: {
    bg: 'bg-emerald-600',
    ring: '#10b981',
    track: '#064e3b',
    badge: 'bg-white/20 text-white',
  },
  longBreak: {
    bg: 'bg-purple-600',
    ring: '#8b5cf6',
    track: '#2e1065',
    badge: 'bg-white/20 text-white',
  },
};

// SVG circular progress ring
function ProgressRing({ radius, stroke, progress, color, trackColor }) {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="absolute inset-0 -rotate-90">
      {/* Track */}
      <circle
        stroke={trackColor}
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Progress */}
      <circle
        stroke={color}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  );
}

export default function PomodoroTimer({
  tasks = [],
  focusDuration = DEFAULTS.focus,
  shortBreakDuration = DEFAULTS.shortBreak,
  longBreakDuration = DEFAULTS.longBreak,
  onSessionComplete,
}) {
  const durations = {
    focus: focusDuration * 60,
    shortBreak: shortBreakDuration * 60,
    longBreak: longBreakDuration * 60,
  };

  const [sessionType, setSessionType] = useState('focus');
  const [timeLeft, setTimeLeft] = useState(durations.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id || '');

  const intervalRef = useRef(null);
  const colors = SESSION_COLORS[sessionType];
  const totalDuration = durations[sessionType];
  const progress = timeLeft / totalDuration;

  // Keep selectedTaskId in sync when tasks load
  useEffect(() => {
    if (tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [tasks]);

  const stopTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  };

  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Audio not supported — silent fallback
    }
  };

  const sendNotification = (message) => {
    playNotificationSound();
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusDesk', { body: message, icon: '/favicon.ico' });
    }
  };

  const advanceSession = useCallback(
    async (currentType, currentCompleted) => {
      stopTimer();

      if (currentType === 'focus') {
        // Log the completed focus session to the DB
        try {
          await sessionAPI.logSession(selectedTaskId || null, focusDuration, true);
        } catch (err) {
          console.error('Failed to log session:', err);
        }

        const newCount = currentCompleted + 1;
        setCompletedSessions(newCount);
        onSessionComplete?.(newCount);

        const isLongBreak = newCount % DEFAULTS.sessionsBeforeLongBreak === 0;
        const nextType = isLongBreak ? 'longBreak' : 'shortBreak';
        setSessionType(nextType);
        setTimeLeft(durations[nextType]);
        sendNotification(
          isLongBreak
            ? '🎉 4 sessions done! Take a long break — you earned it.'
            : '✅ Focus session complete! Take a short break.'
        );
      } else {
        setSessionType('focus');
        setTimeLeft(durations.focus);
        sendNotification('⏰ Break over. Ready to focus?');
      }
    },
    [selectedTaskId, focusDuration, durations, stopTimer, onSessionComplete]
  );

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Advance session after this render cycle
          setTimeout(() => advanceSession(sessionType, completedSessions), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, sessionType, completedSessions, advanceSession]);

  const handleStart = async () => {
    await requestNotificationPermission();
    setIsRunning(true);
  };

  const handlePause = () => stopTimer();

  const handleReset = () => {
    stopTimer();
    setTimeLeft(durations[sessionType]);
  };

  const handleSkip = () => {
    stopTimer();
    advanceSession(sessionType, completedSessions);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Session dots (4 dots, filled = completed in this cycle)
  const sessionDots = Array.from({ length: DEFAULTS.sessionsBeforeLongBreak }).map(
    (_, i) => i < completedSessions % DEFAULTS.sessionsBeforeLongBreak
  );

  return (
    <div
      className={`min-h-[calc(100vh-64px)] ${colors.bg} flex flex-col items-center justify-center p-6 transition-colors duration-700`}
    >
      <div className="w-full max-w-sm text-white text-center">
        {/* Session type badge */}
        <span
          className={`inline-block px-4 py-1 rounded-full text-sm font-semibold uppercase tracking-widest mb-10 backdrop-blur-sm ${colors.badge}`}
        >
          {SESSION_LABELS[sessionType]}
        </span>

        {/* Circular progress ring + timer */}
        <div className="relative w-56 h-56 mx-auto mb-10 flex items-center justify-center">
          <ProgressRing
            radius={112}
            stroke={8}
            progress={progress}
            color={colors.ring}
            trackColor={colors.track}
          />
          <div className="relative z-10 text-center">
            <div className="text-6xl font-bold tabular-nums tracking-tight">
              {formatTime(timeLeft)}
            </div>
            <div className="text-white/60 text-sm mt-1 uppercase tracking-wider">
              {isRunning ? 'focusing' : 'paused'}
            </div>
          </div>
        </div>

        {/* Session dots */}
        <div className="flex justify-center gap-2 mb-8">
          {sessionDots.map((filled, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                filled ? 'bg-white scale-110' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/20"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>

          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              <Pause size={24} fill="currentColor" />
              Pause
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-900 font-bold text-lg hover:bg-gray-100 transition shadow-lg"
            >
              <Play size={24} fill="currentColor" />
              {timeLeft === totalDuration ? 'Start' : 'Resume'}
            </button>
          )}

          <button
            onClick={handleSkip}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition border border-white/20"
            title="Skip to next session"
          >
            <SkipForward size={20} />
          </button>
        </div>

        {/* Info card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/70 uppercase tracking-wider">Completed today</span>
            <span className="font-bold text-lg">{completedSessions}</span>
          </div>

          {tasks.length > 0 && (
            <div>
              <label className="block text-xs text-white/70 uppercase tracking-wider mb-1.5 text-left">
                Working on
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-white text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer"
              >
                <option value="">— No task selected —</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}