import { useState, useEffect } from 'react';
import { taskAPI, sessionAPI } from '../api/client';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function TimerPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState('focus');
  const [completedSessions, setCompletedSessions] = useState(0);

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const fetchTasks = async () => {
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data.filter((t) => t.status !== 'COMPLETED'));
      if (response.data.length > 0) {
        setSelectedTaskId(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);

    if (sessionType === 'focus') {
      try {
        await sessionAPI.logSession(selectedTaskId || null, 25, true);
        setCompletedSessions((prev) => prev + 1);
      } catch (error) {
        console.error('Error logging session:', error);
      }

      setSessionType('break');
      setTimeLeft(5 * 60);
      playNotification();
    } else {
      if (completedSessions % 4 === 0) {
        setSessionType('focus');
        setTimeLeft(15 * 60);
        alert('Long break time! Take 15 minutes.');
      } else {
        setSessionType('focus');
        setTimeLeft(25 * 60);
      }
      playNotification();
    }
  };

  const playNotification = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('FocusDesk', {
        body: sessionType === 'focus' ? 'Focus session complete! Take a break.' : 'Break over! Ready to focus?',
      });
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setSessionType('focus');
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBgColor = () => {
    return sessionType === 'focus'
      ? 'bg-brand-primary'
      : 'bg-brand-success';
  };

  return (
    <div className={`min-h-[calc(100vh-64px)] p-6 flex flex-col items-center justify-center transition-colors duration-700 ${getBgColor()}`}>
      
      <div className="text-white text-center animate-slide-up w-full max-w-2xl">
        
        <span className="inline-block px-4 py-1 rounded-full bg-white/20 text-sm font-medium uppercase tracking-widest mb-8 backdrop-blur-sm">
          {sessionType === 'focus'
            ? 'Deep Focus'
            : sessionType === 'break' && completedSessions % 4 !== 0
            ? 'Short Break'
            : 'Long Break'}
        </span>

        <div className="timer-display mb-12 text-white">
          {formatTime(timeLeft)}
        </div>

        <div className="flex gap-4 justify-center mb-12">
          {!isRunning ? (
            <button onClick={handleStart} className="btn bg-white text-surface-900 hover:bg-surface-50 shadow-hover-elevated px-8 py-4 text-lg border-none">
              <Play size={24} className="mr-2" fill="currentColor" /> Start Focus
            </button>
          ) : (
            <button onClick={handlePause} className="btn bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm px-8 py-4 text-lg border-none">
              <Pause size={24} className="mr-2" fill="currentColor" /> Pause
            </button>
          )}

          <button onClick={handleReset} className="btn bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-6 py-4">
            <RotateCcw size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 max-w-md mx-auto bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
          <div className="text-center">
            <p className="text-sm text-white/80 uppercase tracking-wider font-medium">Completed Sessions</p>
            <p className="text-3xl font-bold text-white mt-1">{completedSessions}</p>
          </div>

          {tasks.length > 0 && (
            <div className="w-full">
              <label className="block text-sm font-medium text-white/80 mb-2 text-left">
                Currently Working On:
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full px-4 py-3 bg-white text-surface-900 border-0 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/50 cursor-pointer"
              >
                <option value="">None selected</option>
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