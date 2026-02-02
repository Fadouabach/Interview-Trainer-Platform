import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all experts
router.get('/', async (req, res) => {
    try {
        const experts = await User.find({ role: 'expert' }).select('-password');
        res.json(experts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific expert profile
router.get('/:id', async (req, res) => {
    try {
        const expert = await User.findById(req.params.id).select('-password');
        if (!expert || expert.role !== 'expert') {
            return res.status(404).json({ msg: "Expert not found" });
        }
        res.json(expert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
