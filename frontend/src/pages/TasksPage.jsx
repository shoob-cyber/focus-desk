import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { taskAPI } from '../api/client';
import TaskCard from '../components/TaskCard';
import { Plus, Loader2 } from 'lucide-react';

const COLUMNS = [
  { id: 'PENDING', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'COMPLETED', title: 'Done' }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedPomodoros: 1,
    priority: 'MEDIUM'
  });


  async function fetchTasks() {
    try {
      const response = await taskAPI.getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();  // ✅ Now it's defined
  }, []);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskAPI.createTask(formData);
      setFormData({ title: '', description: '', dueDate: '', estimatedPomodoros: 1, priority: 'MEDIUM' });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Optimistic UI update
    const newStatus = destination.droppableId;
    setTasks(prev => prev.map(task =>
      task.id === draggableId ? { ...task, status: newStatus } : task
    ));

    // Backend update
    try {
      await taskAPI.updateTask(draggableId, { status: newStatus });
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchTasks(); // Revert on failure
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await taskAPI.deleteTask(taskId);
    } catch (error) {
      fetchTasks();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="animate-spin text-brand-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Task Board</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition">
          <Plus size={20} className="mr-2" />
          <span>New Task</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-surface-800 p-6 rounded-xl shadow-sm border border-surface-200 dark:border-surface-700 mb-8">
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-800 dark:text-surface-200 mb-1">Title *</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full p-2 border rounded dark:bg-surface-900 dark:border-surface-700 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-800 dark:text-surface-200 mb-1">Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full p-2 border rounded dark:bg-surface-900 dark:border-surface-700 dark:text-white">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full md:w-auto bg-brand-primary text-white px-6 py-2 rounded hover:bg-blue-600">Create Task</button>
          </form>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COLUMNS.map(column => (
            <div key={column.id} className="bg-surface-100 dark:bg-surface-900/50 p-4 rounded-xl">
              <h2 className="font-bold text-surface-700 dark:text-surface-300 mb-4 flex items-center justify-between">
                {column.title}
                <span className="bg-surface-200 dark:bg-surface-700 text-sm py-1 px-2 rounded-full">
                  {tasks.filter(t => t.status === column.id).length}
                </span>
              </h2>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-surface-200/50 dark:bg-surface-800/50' : ''}`}
                  >
                    {tasks.filter(t => t.status === column.id).map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-3"
                          >
                            <TaskCard
                              task={task}
                              onDelete={handleDeleteTask}
                              isDragging={snapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}