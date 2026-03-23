import express from 'express';
import { getModels } from '../db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
        const models = getModels();
        const UserModel = models.User;
        const ExpertRequestModel = models.ExpertRequest;
        const InterviewSessionModel = models.InterviewSession;

        const user = await UserModel.findById(req.user).lean();
        if (!user) return res.status(404).json({ msg: "User not found" });

        // Calculate verification status
        let verificationStatus = 'none';
        if (user.role === 'expert') {
            verificationStatus = 'approved';
        } else {
            const request = await ExpertRequestModel.findOne({ userId: req.user }).sort({ createdAt: -1 });
            if (request) {
                if (['pending', 'under_review'].includes(request.status)) {
                    verificationStatus = 'pending';
                } else if (['accepted', 'approved'].includes(request.status)) {
                    verificationStatus = 'approved';
                } else {
                    verificationStatus = 'rejected';
                }
            }
        }

        // Calculate interviews count
        const interviewsCount = await InterviewSessionModel.countDocuments({ userId: req.user });

        const { password, ...sanitizedUser } = user;
        res.json({
            ...sanitizedUser,
            verificationStatus,
            interviewsCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { 
            name, bio, field, skills, avatar,
            title, company, price, experience, location, 
            phone, linkedinUrl, githubUrl, portfolioUrl, sessionTypes
        } = req.body;

        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (name) user.name = name;
        if (bio !== undefined) user.bio = bio;
        if (field !== undefined) user.field = field;
        if (skills) user.skills = skills;
        if (avatar) user.avatar = avatar;
        
        // Expert fields
        if (title !== undefined) user.title = title;
        if (company !== undefined) user.company = company;
        if (price !== undefined) user.price = Number(price);
        if (experience !== undefined) user.experience = experience;
        if (location !== undefined) user.location = location;
        if (phone !== undefined) user.phone = phone;
        if (linkedinUrl !== undefined) user.linkedinUrl = linkedinUrl;
        if (githubUrl !== undefined) user.githubUrl = githubUrl;
        if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
        if (sessionTypes !== undefined) user.sessionTypes = sessionTypes;

        const savedUser = await user.save();
        res.json(savedUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Notifications
router.put('/notifications', auth, async (req, res) => {
    try {
        const { emailNotifications, pushNotifications } = req.body;
        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
        if (pushNotifications !== undefined) user.pushNotifications = pushNotifications;

        const savedUser = await user.save();
        res.json({ emailNotifications: savedUser.emailNotifications, pushNotifications: savedUser.pushNotifications });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Change Password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ msg: "New passwords do not match." });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ msg: "The password needs to be at least 6 characters long." });
        }

        const user = await getUserModel().findById(req.user);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid current password." });
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(newPassword, salt);
        
        user.password = passwordHash;
        await user.save();

        res.json({ msg: "Password successfully updated." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
