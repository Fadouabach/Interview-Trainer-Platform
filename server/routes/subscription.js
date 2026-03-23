import express from 'express';
import { getModels } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const getUserModel = () => getModels().User;

const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "No token, authorization denied." });
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified) return res.status(401).json({ msg: "Token verification failed." });
        req.user = verified.id;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET current subscription status
router.get('/', auth, async (req, res) => {
    try {
        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.json({
            plan: user.plan,
            subscriptionStatus: user.subscriptionStatus
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST upgrade subscription to Pro
router.post('/upgrade', auth, async (req, res) => {
    try {
        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Simulate payment/upgrade success
        user.plan = 'pro';
        user.subscriptionStatus = 'active';
        await user.save();

        res.json({ msg: "Successfully upgraded to Pro", plan: user.plan, subscriptionStatus: user.subscriptionStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST cancel subscription
router.post('/cancel', auth, async (req, res) => {
    try {
        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.subscriptionStatus = 'canceled';
        // Note: Keeping plan as 'pro' conceptually for the rest of billing cycle, 
        // or optionally set to 'free'. We'll set to 'free' for immediate effect here.
        user.plan = 'free'; 
        await user.save();

        res.json({ msg: "Subscription canceled", plan: user.plan, subscriptionStatus: user.subscriptionStatus });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
