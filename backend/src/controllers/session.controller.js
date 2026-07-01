const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Log a new Pomodoro session
// @route   POST /api/sessions
const logSession = async (req, res) => {
  try {
    const { taskId, durationMinutes, completed } = req.body;
    const userId = req.user.id; 

    const session = await prisma.pomodoroSession.create({
      data: {
        userId,
        taskId: taskId || null, // Optional: Link to a task if provided
        durationMinutes: durationMinutes || 25,
        completed: completed !== undefined ? completed : true,
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging session' });
  }
};

// @desc    Get session history for the logged-in user
// @route   GET /api/sessions
const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.pomodoroSession.findMany({
      where: { userId: req.user.id },
      orderBy: { startedAt: 'desc' },
      include: {
        task: {
          select: { title: true } // Pull the task title so the frontend can display it
        }
      }
    });
    
    res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

module.exports = { logSession, getSessions };