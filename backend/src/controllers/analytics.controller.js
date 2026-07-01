const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get dashboard analytics (heatmap, totals, streak)
// @route   GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch all completed sessions for this user
        const completedSessions = await prisma.pomodoroSession.findMany({
            where: {
                userId: userId,
                completed: true,
            },
        });

        // 2. Calculate Total Focus Time
        const totalFocusMinutes = completedSessions.reduce((total, session) => {
            return total + session.durationMinutes;
        }, 0);

        // 3. Generate a 7-Day Heatmap
        const heatmap = {};
        const today = new Date();

        // Initialize the last 7 days in the heatmap object with 0 minutes
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateString = d.toISOString().split('T')[0];
            heatmap[dateString] = 0;
        }

        // Populate the heatmap with actual session durations
        completedSessions.forEach(session => {
            const dateString = session.startedAt.toISOString().split('T')[0];
            if (heatmap[dateString] !== undefined) {
                heatmap[dateString] += session.durationMinutes;
            }
        });

        // 4. Calculate streak
        let streak = 0;
        const checkDate = new Date();

        while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            const hasSession = completedSessions.some(
                s => s.startedAt.toISOString().split('T')[0] === dateStr
            );
            if (!hasSession) break;
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // 5. Send the compiled stats back to the frontend
        res.status(200).json({
            totalSessions: completedSessions.length,
            totalFocusMinutes,
            totalFocusHours: (totalFocusMinutes / 60).toFixed(1),
            heatmap,
            streak  // ✅ FIX: Added streak to response
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

module.exports = { getDashboardStats };