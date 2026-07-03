import { useState, useEffect } from 'react';
import PomodoroTimer from '../components/PomodoroTimer';
import { taskAPI } from '../api/client';

export default function TimerPage() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    taskAPI.getTasks()
      .then(res => setTasks(res.data.filter(t => t.status !== 'COMPLETED')))
      .catch(console.error);
  }, []);

  return <PomodoroTimer tasks={tasks} />;
}