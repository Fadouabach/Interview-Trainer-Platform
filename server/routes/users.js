import express from 'express';
import { getModels } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const getUserModel = () => getModels().User;

// Middleware to verify token
const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token)
            return res.status(401).json({ msg: "No authentication token, authorization denied." });

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (!verified)
            return res.status(401).json({ msg: "Token verification failed, authorization denied." });

        req.user = verified.id;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get User Profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });
        const { password, ...sanitizedUser } = user;
        res.json(sanitizedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, bio, field, skills, avatar } = req.body;

        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (field !== undefined) user.field = field;
        if (skills) user.skills = skills;
        if (avatar) user.avatar = avatar;

        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
