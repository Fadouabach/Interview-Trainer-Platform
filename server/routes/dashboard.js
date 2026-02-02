import express from 'express';
import InterviewSession from '../models/InterviewSession.js';
import PracticeSession from '../models/PracticeSession.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch all interviews for user
        const interviews = await InterviewSession.find({ userId }).sort({ date: -1 });
        const practiceSessions = await PracticeSession.find({ userId }).sort({ date: -1 });
        const activityLogs = await ActivityLog.find({ userId }).sort({ date: -1 }).limit(10);

        // 1. Interviews Completed
        const interviewsCompleted = interviews.length;

        // 2. Practice Time
        const totalInterviewTime = interviews.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const totalPracticeTimeMs = practiceSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
        const totalSeconds = totalInterviewTime + totalPracticeTimeMs;
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const practiceTimeStr = `${hours}h ${minutes}m`;

        // 3. Average Score
        const totalScore = interviews.reduce((acc, curr) => acc + (curr.score || 0), 0);
        const avgScore = interviewsCompleted > 0 ? Math.round(totalScore / interviewsCompleted) : 0;

        // 4. Readiness Score
        // Formula: (AvgScore * 0.7) + (Progress Bonus based on volume: max 30)
        const volumeBonus = Math.min(interviewsCompleted * 5, 30);
        const readinessScore = Math.round((avgScore * 0.7) + volumeBonus);

        // 5. Recent Activity
        // Combine last 3 interviews and last 3 activities
        const recentInterviews = interviews.slice(0, 3).map(i => ({
            title: `${i.category} Interview`,
            score: `${i.score}%`,
            date: i.date,
            type: 'interview'
        }));

        const recentLogs = activityLogs.slice(0, 5).map(l => ({
            title: l.action,
            score: l.details,
            date: l.date,
            type: 'log'
        }));

        res.json({
            interviewsCompleted,
            practiceTime: practiceTimeStr,
            avgScore: `${avgScore}%`,
            readinessScore: `${readinessScore}%`,
            recentActivity: recentInterviews.concat(recentLogs).sort((a, b) => b.date - a.date).slice(0, 5)
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
