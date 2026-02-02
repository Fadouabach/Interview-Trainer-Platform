import express from 'express';
import InterviewSession from '../models/InterviewSession.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// Save interview session
router.post('/', async (req, res) => {
    try {
        const { userId, category, duration, score, answers } = req.body;

        const newSession = new InterviewSession({
            userId,
            category,
            duration,
            score: score || 0,
            answers
        });

        const savedSession = await newSession.save();

        // Also log activity
        const newLog = new ActivityLog({
            userId,
            action: 'Interview Completed',
            details: `Completed ${category} interview with score ${score || 0}%`
        });
        await newLog.save();

        res.json(savedSession);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
