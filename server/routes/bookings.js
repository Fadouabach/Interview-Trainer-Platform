import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify token
const auth = (req, res, next) => {
    try {
        const token = req.header("x-auth-token");
        if (!token) return res.status(401).json({ msg: "No authentication token, authorization denied." });
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified.id;
        next();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a booking
router.post('/', auth, async (req, res) => {
    try {
        const { expertId, sessionType, date, time, goal } = req.body;
        const newBooking = new Booking({
            userId: req.user,
            expertId,
            sessionType,
            date,
            time,
            goal
        });
        const savedBooking = await newBooking.save();
        res.json(savedBooking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user }).populate('expertId', 'name title company avatar');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get expert's bookings
router.get('/expert-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ expertId: req.user }).populate('userId', 'name email avatar');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Expert adds feedback
router.put('/:id/feedback', auth, async (req, res) => {
    try {
        const { feedback } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: "Booking not found" });
        if (booking.expertId.toString() !== req.user) return res.status(401).json({ msg: "Unauthorized" });

        booking.expertFeedback = feedback;
        booking.status = 'completed';
        await booking.save();
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// User rates expert
router.put('/:id/rate', auth, async (req, res) => {
    try {
        const { rating, review } = req.body;
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: "Booking not found" });
        if (booking.userId.toString() !== req.user) return res.status(401).json({ msg: "Unauthorized" });

        booking.userRating = rating;
        booking.userReview = review;
        await booking.save();

        // Update expert's average rating
        const expert = await User.findById(booking.expertId);
        const allRatings = await Booking.find({ expertId: booking.expertId, userRating: { $exists: true } });
        const avg = allRatings.reduce((acc, curr) => acc + curr.userRating, 0) / allRatings.length;

        expert.rating = parseFloat(avg.toFixed(1));
        expert.reviewsCount = allRatings.length;
        await expert.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
