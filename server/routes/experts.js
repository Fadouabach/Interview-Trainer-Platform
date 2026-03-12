import express from 'express';
import { getModels } from '../db.js';

const router = express.Router();

const getUserModel = () => getModels().User;

// Get all experts
router.get('/', async (req, res) => {
    try {
        const experts = await getUserModel().find({ role: 'expert' });
        // NOTE: Mocks don't support .select() chain yet, so we handle it simply
        const sanitizedExperts = experts.map(e => {
            const { password, ...rest } = e;
            return rest;
        });
        res.json(sanitizedExperts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get specific expert profile
router.get('/:id', async (req, res) => {
    try {
        const expert = await getUserModel().findById(req.params.id);
        if (!expert || expert.role !== 'expert') {
            return res.status(404).json({ msg: "Expert not found" });
        }
        const { password, ...sanitizedExpert } = expert;
        res.json(sanitizedExpert);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
