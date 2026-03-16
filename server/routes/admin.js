import express from 'express';
import jwt from 'jsonwebtoken';
import { getModels } from '../db.js';

const router = express.Router();

const getUserModel = () => getModels().User;
const getInterviewModel = () => getModels().InterviewSession;
const getExpertRequestModel = () => getModels().ExpertRequest;
const getSettingsModel = () => getModels().Settings; 

// Admin Authorization Middleware
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "No authentication token, authorization denied." });

        const verified = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (!verified) return res.status(401).json({ msg: "Token verification failed, authorization denied." });

        const user = await getUserModel().findById(verified.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ msg: "Access denied. Admin privileges required." });
        }

        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 1. Overview Stats
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const usersCount = (await getUserModel().find({ role: 'user' })).length;
        const expertsCount = (await getUserModel().find({ role: 'expert' })).length;
        const interviews = await getInterviewModel().find({});
        const interviewsCount = interviews.length;
        
        let totalScore = 0;
        interviews.forEach(i => totalScore += (i.score || 0));
        const avgScore = interviewsCount > 0 ? (totalScore / interviewsCount).toFixed(1) : 0;

        // Mock chart data for now
        const userGrowth = [
            { name: 'Jan', users: 400 },
            { name: 'Feb', users: 600 },
            { name: 'Mar', users: 800 },
            { name: 'Apr', users: 1245 }
        ];

        res.json({
            totalUsers: usersCount,
            totalExperts: expertsCount,
            totalInterviews: interviewsCount,
            successRate: avgScore,
            userGrowth
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Users Management
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await getUserModel().find({});
        const sanitized = users.map(u => {
            const { password, ...rest } = u._doc || u; // Handle both real mongoose and mock objects
            return rest;
        });
        res.json(sanitized);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/users/:id/role', adminAuth, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'expert', 'admin'].includes(role)) {
            return res.status(400).json({ msg: "Invalid role" });
        }

        const user = await getUserModel().findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.role = role;
        await user.save();
        res.json({ msg: "Role updated successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        // Warning: User.deleteOne or delete logic varies slightly with the mock class so we implement generic delete
        if(getModels().isFallback) {
             // Mock delete
             const users = getUserModel()._getAll();
             const updated = users.filter(u => u._id !== req.params.id);
             getUserModel()._writeAll(updated);
        } else {
             await getUserModel().findByIdAndDelete(req.params.id);
        }
        res.json({ msg: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Experts Management (We get all users where role='expert')
router.get('/experts', adminAuth, async (req, res) => {
    try {
        const experts = await getUserModel().find({ role: 'expert' });
        const sanitized = experts.map(e => {
            const { password, ...rest } = e._doc || e;
            return rest;
        });
        res.json(sanitized);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Interviews Management
router.get('/interviews', adminAuth, async (req, res) => {
    try {
        const interviews = await getInterviewModel().find({});
        res.json(interviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/interviews/:id', adminAuth, async (req, res) => {
    try {
        if(getModels().isFallback) {
            const interviews = getInterviewModel()._getAll();
            const updated = interviews.filter(i => i._id !== req.params.id);
            getInterviewModel()._writeAll(updated);
        } else {
            await getInterviewModel().findByIdAndDelete(req.params.id);
        }
        res.json({ msg: "Interview deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Feedback Monitoring
router.get('/feedback', adminAuth, async (req, res) => {
    try {
        // Just extract recent interviews and their AI feedback
        const interviews = await getInterviewModel().find({});
        const feedbacks = interviews.map(i => ({
            interviewId: i._id || i.id,
            userId: i.userId,
            category: i.category,
            date: i.createdAt,
            overallScore: i.aiFeedback?.overallScore,
            summary: i.aiFeedback?.summary
        })).filter(f => f.summary); // Only return those with feedback
        
        // Sort descending by date
        feedbacks.sort((a,b) => new Date(b.date) - new Date(a.date));

        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Settings Management (Mocked for now)
let platformSettings = {
    siteName: 'Confido - AI Interview Trainer',
    maintenanceMode: false,
    aiModel: 'gpt-4',
};

router.get('/settings', adminAuth, (req, res) => {
    res.json(platformSettings);
});

router.put('/settings', adminAuth, (req, res) => {
    const { siteName, maintenanceMode, aiModel } = req.body;
    if (siteName !== undefined) platformSettings.siteName = siteName;
    if (maintenanceMode !== undefined) platformSettings.maintenanceMode = maintenanceMode;
    if (aiModel !== undefined) platformSettings.aiModel = aiModel;
    res.json({ msg: "Settings updated", settings: platformSettings });
});

// 7. Expert Request Management
router.get('/expert-requests', adminAuth, async (req, res) => {
    try {
        const requests = await getExpertRequestModel().find({ status: 'pending' });
        // We need to populate userId to get name and email
        // If it's mock, we might need a workaround since mock doesn't support populate
        
        const detailedRequests = await Promise.all(requests.map(async (reqst) => {
            const user = await getUserModel().findById(reqst.userId);
            return {
                ...reqst._doc || reqst,
                name: user ? user.name : 'Unknown User',
                email: user ? user.email : 'Unknown Email'
            };
        }));
        
        res.json(detailedRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/approve-expert/:id', adminAuth, async (req, res) => {
    try {
        const expertRequest = await getExpertRequestModel().findById(req.params.id);
        if (!expertRequest) return res.status(404).json({ msg: "Request not found" });

        // Update request status
        expertRequest.status = 'approved';
        if (expertRequest.save) {
            await expertRequest.save();
        } else {
            // Mock handle
            await getExpertRequestModel().findByIdAndUpdate(req.params.id, { status: 'approved' });
        }

        // Update user role
        const user = await getUserModel().findById(expertRequest.userId);
        if (user) {
            user.role = 'expert';
            if (user.save) {
                await user.save();
            } else {
                // Mock handle
                await getUserModel().findByIdAndUpdate(expertRequest.userId, { role: 'expert' });
            }
        }

        res.json({ msg: "Expert approved successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/reject-expert/:id', adminAuth, async (req, res) => {
    try {
        const expertRequest = await getExpertRequestModel().findById(req.params.id);
        if (!expertRequest) return res.status(404).json({ msg: "Request not found" });

        expertRequest.status = 'rejected';
        if (expertRequest.save) {
            await expertRequest.save();
        } else {
            // Mock handle
            await getExpertRequestModel().findByIdAndUpdate(req.params.id, { status: 'rejected' });
        }

        res.json({ msg: "Expert request rejected" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
