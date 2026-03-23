import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getModels } from '../db.js';

const router = express.Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getUserModel = () => getModels().User;
const getInterviewModel = () => getModels().InterviewSession;
const getExpertRequestModel = () => getModels().ExpertRequest;

// ─── Expert Auth Middleware (Strict for Experts only) ─────────────────────────
const expertAuth = async (req, res, next) => {
    try {
        const token = req.header('x-auth-token');
        if (!token) return res.status(401).json({ msg: 'No authentication token.' });

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await getUserModel().findById(verified.id);

        if (!user || (user.role !== 'expert' && user.role !== 'admin')) {
            return res.status(403).json({ msg: 'Access denied. Expert privileges required.' });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// ─── Multer for Profile Picture Upload ───────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${req.user._id || req.user.id}_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Multer for Document Uploads ───────────────────────────────────────────
const docStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(process.cwd(), 'uploads', 'documents');
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        cb(null, `${req.user._id || req.user.id}_${name}_${Date.now()}${ext}`);
    }
});
const uploadDoc = multer({ docStorage, limits: { fileSize: 10 * 1024 * 1024 } });

// ─── 1. Overview Stats ────────────────────────────────────────────────────────
router.get('/stats', expertAuth, async (req, res) => {
    try {
        const expertId = (req.user._id || req.user.id).toString();
        const allSessions = await getInterviewModel().find({});

        const pending = allSessions.filter(s =>
            !s.expertReview || !s.expertReview.decision
        );

        const reviewed = allSessions.filter(s =>
            s.expertReview?.reviewedBy?.toString() === expertId && s.expertReview?.decision
        );

        const accepted = reviewed.filter(s => s.expertReview.decision === 'accepted');

        res.json({
            totalReviewed: reviewed.length,
            pendingCount: pending.length,
            acceptedCount: accepted.length,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 2. Pending Requests ──────────────────────────────────────────────────────
router.get('/pending-requests', expertAuth, async (req, res) => {
    try {
        // Get all sessions that have NOT been reviewed yet
        const sessions = await getInterviewModel().find({});
        const pending = sessions.filter(s => !s.expertReview || !s.expertReview.decision);

        // Attach user info
        const detailed = await Promise.all(pending.map(async (session) => {
            const user = await getUserModel().findById(session.userId);
            const raw = session._doc || session;
            return {
                ...raw,
                candidateName: user ? user.name : 'Unknown Candidate',
                candidateEmail: user ? user.email : '',
                candidateAvatar: user ? user.avatar : '',
            };
        }));

        // Sort: newest first
        detailed.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

        res.json(detailed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 3. Get Single Interview Detail ──────────────────────────────────────────
router.get('/interviews/:id', expertAuth, async (req, res) => {
    try {
        const session = await getInterviewModel().findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Interview not found' });

        const user = await getUserModel().findById(session.userId);
        const raw = session._doc || session;

        res.json({
            ...raw,
            candidateName: user ? user.name : 'Unknown Candidate',
            candidateEmail: user ? user.email : '',
            candidateAvatar: user ? user.avatar : '',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 4. Save Expert Evaluation (Accept / Reject) ─────────────────────────────
router.put('/interviews/:id/evaluate', expertAuth, async (req, res) => {
    try {
        const { decision, feedback, adjustedScore } = req.body;

        if (!decision || !['accepted', 'rejected'].includes(decision)) {
            return res.status(400).json({ msg: 'Decision must be "accepted" or "rejected".' });
        }

        const session = await getInterviewModel().findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Interview not found' });

        const expertId = req.user._id || req.user.id;

        // Update using findByIdAndUpdate for compatibility with both real & mock models
        const updateData = {
            status: decision,
            expertReview: {
                decision,
                feedback: feedback || '',
                adjustedScore: adjustedScore != null ? Number(adjustedScore) : session.score,
                reviewedBy: expertId,
                reviewedAt: new Date(),
            }
        };

        if (session.save) {
            // Real Mongoose document
            session.status = updateData.status;
            session.expertReview = updateData.expertReview;
            await session.save();
            res.json({ msg: `Interview ${decision} successfully.`, session });
        } else {
            const updated = await getInterviewModel().findByIdAndUpdate(req.params.id, updateData, { new: true });
            res.json({ msg: `Interview ${decision} successfully.`, session: updated });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 5. Feedback History ──────────────────────────────────────────────────────
router.get('/feedback-history', expertAuth, async (req, res) => {
    try {
        const expertId = (req.user._id || req.user.id).toString();
        const allSessions = await getInterviewModel().find({});

        // Sessions reviewed by this expert OR all reviewed sessions (if admin view)
        const reviewed = allSessions.filter(s =>
            s.expertReview?.decision &&
            (s.expertReview?.reviewedBy?.toString() === expertId || req.user.role === 'admin')
        );

        const detailed = await Promise.all(reviewed.map(async (session) => {
            const user = await getUserModel().findById(session.userId);
            const raw = session._doc || session;
            return {
                ...raw,
                candidateName: user ? user.name : 'Unknown Candidate',
                candidateEmail: user ? user.email : '',
                candidateAvatar: user ? user.avatar : '',
            };
        }));

        // Sort: most recently reviewed first
        detailed.sort((a, b) => {
            const dateA = a.expertReview?.reviewedAt || a.createdAt || a.date;
            const dateB = b.expertReview?.reviewedAt || b.createdAt || b.date;
            return new Date(dateB) - new Date(dateA);
        });

        res.json(detailed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 6. Get Profile ───────────────────────────────────────────────────────────
router.get('/profile', expertAuth, async (req, res) => {
    try {
        const { password, ...user } = req.user._doc || req.user;
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 7. Update Profile ────────────────────────────────────────────────────────
router.put('/profile', expertAuth, upload.single('avatar'), async (req, res) => {
    try {
        const { name, field, bio } = req.body;
        const expertId = req.user._id || req.user.id;

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (field) updateData.field = field.trim();
        if (bio !== undefined) updateData.bio = bio.trim();

        // Handle avatar upload
        if (req.file) {
            updateData.avatar = `/uploads/${req.file.filename}`;
        }

        const user = await getUserModel().findById(expertId);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        Object.assign(user, updateData);

        if (user.save) {
            await user.save();
        } else {
            await getUserModel().findByIdAndUpdate(expertId, updateData);
        }

        const { password, ...sanitized } = user._doc || user;
        res.json({ msg: 'Profile updated successfully.', user: sanitized });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 8. Video Call Controls ──────────────────────────────────────────────────
router.post('/interviews/:id/start-call', expertAuth, async (req, res) => {
    try {
        const session = await getInterviewModel().findById(req.params.id);
        if (!session) return res.status(404).json({ msg: 'Interview not found' });

        const roomName = `Confido_Interview_${req.params.id}_${Math.random().toString(36).substr(2, 5)}`;
        
        const updateData = {
            liveCallActive: true,
            liveCallRoom: roomName
        };

        if (session.save) {
            session.liveCallActive = true;
            session.liveCallRoom = roomName;
            await session.save();
        } else {
            await getInterviewModel().findByIdAndUpdate(req.params.id, updateData);
        }

        res.json({ msg: 'Call started', roomName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/interviews/:id/stop-call', expertAuth, async (req, res) => {
    try {
        const updateData = {
            liveCallActive: false
        };

        const session = await getInterviewModel().findById(req.params.id);
        if (session && session.save) {
            session.liveCallActive = false;
            await session.save();
        } else {
            await getInterviewModel().findByIdAndUpdate(req.params.id, updateData);
        }

        res.json({ msg: 'Call ended' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ─── 9. Get Meeting Info (Public/Shared) ──────────────────────────────────
// GET /api/expert/meeting/:expertId (or mounted as /api/meeting/:expertId)
router.get('/meeting/:expertId', async (req, res) => {
    try {
        const expertRequest = await getExpertRequestModel().findOne({ userId: req.params.expertId });
        if (!expertRequest) return res.status(404).json({ msg: 'Meeting not found' });
        res.json({
            meetingLink: expertRequest.meetingLink,
            meetingDateTime: expertRequest.meetingDateTime
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
