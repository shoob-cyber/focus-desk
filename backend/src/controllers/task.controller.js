const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, estimatedPomodoros } = req.body;
    const userId = req.user.id; // Comes from the requireAuth middleware

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedPomodoros: estimatedPomodoros || 1,
        userId, 
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating task' });
  }
};

// @desc    Get all tasks for logged in user
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }, // Newest first
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};

// @desc    Update a task (e.g., mark as complete)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, estimatedPomodoros } = req.body;

    // Verify the task belongs to the user before updating
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== req.user.id) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, description, status, estimatedPomodoros },
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating task' });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask || existingTask.userId !== req.user.id) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await prisma.task.delete({ where: { id } });
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting task' });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };