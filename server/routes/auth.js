import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password)
            return res.status(400).json({ msg: "Not all fields have been entered." });

        if (password.length < 6)
            return res.status(400).json({ msg: "Password must be at least 6 characters." });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "An account with this email already exists." });

        // Hash password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: passwordHash,
            role: role || 'user'
        });

        const savedUser = await newUser.save();
        res.json(savedUser);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate
        if (!email || !password)
            return res.status(400).json({ msg: "Not all fields have been entered." });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ msg: "No account with this email has been registered." });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials." });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret');
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify Token (for frontend persistent login)
router.post('/tokenIsValid', async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.json(false);

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (!verified) return res.json(false);

        const user = await User.findById(verified.id);
        if (!user) return res.json(false);

        return res.json(true);
    } catch (err) {
        res.json(false);
    }
});

// Get User
router.get('/', async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) return res.status(401).json({ msg: "No authentication token, authorization denied." });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(verified.id);
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            bio: user.bio,
            field: user.field,
            skills: user.skills
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
