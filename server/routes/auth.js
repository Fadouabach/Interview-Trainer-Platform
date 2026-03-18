import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getModels } from '../db.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

const getUserModel = () => getModels().User;
const getExpertRequestModel = () => getModels().ExpertRequest;

// Register
router.post('/register', upload.single('cv'), async (req, res) => {
    try {
        const { name, email, password, role, domain, bio, experience, skills, linkedinUrl, githubUrl, portfolioUrl } = req.body;

        // Validation
        if (!name || !email || !password)
            return res.status(400).json({ msg: "Not all fields have been entered." });

        if (password.length < 6)
            return res.status(400).json({ msg: "Password must be at least 6 characters." });

        const existingUser = await getUserModel().findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "An account with this email already exists." });

        // Hash password
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = new (getUserModel())({
            name,
            email,
            password: passwordHash,
            role: role || 'user'
        });

        const savedUser = await newUser.save();

        // If expert, create ExpertRequest
        if (role === 'expert') {
            const expertRequest = new (getExpertRequestModel())({
                userId: savedUser._id,
                domain: domain || 'General',
                bio: bio || '',
                experience: experience || '',
                skills: skills ? JSON.parse(skills) : [],
                linkedinUrl: linkedinUrl || '',
                githubUrl: githubUrl || '',
                portfolioUrl: portfolioUrl || '',
                documents: req.file ? [req.file.filename] : [],
                status: 'pending'
            });
            await expertRequest.save();
        }

        res.json(savedUser);

    } catch (err) {
        console.error("Registration error:", err);
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

        const user = await getUserModel().findOne({ email });
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

        const user = await getUserModel().findById(verified.id);
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
        const user = await getUserModel().findById(verified.id);
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
