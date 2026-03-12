import express from 'express';
import { getModels } from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const getBookingModel = () => getModels().Booking;
const getUserModel = () => getModels().User;

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
        const newBooking = new (getBookingModel())({
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
        let query = getBookingModel().find({ userId: req.user });

        // Mocks don't support .populate()
        if (getModels().isFallback) {
            const bookings = await query;
            // Manual "populate" for fallback
            const populatedBookings = await Promise.all(bookings.map(async b => {
                const expert = await getUserModel().findById(b.expertId);
                return { ...b, expertId: expert };
            }));
            return res.json(populatedBookings);
        }

        const bookings = await query.populate('expertId', 'name title company avatar');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get expert's bookings
router.get('/expert-bookings', auth, async (req, res) => {
    try {
        let query = getBookingModel().find({ expertId: req.user });

        if (getModels().isFallback) {
            const bookings = await query;
            const populatedBookings = await Promise.all(bookings.map(async b => {
                const user = await getUserModel().findById(b.userId);
                return { ...b, userId: user };
            }));
            return res.json(populatedBookings);
        }

        const bookings = await query.populate('userId', 'name email avatar');
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Expert adds feedback
router.put('/:id/feedback', auth, async (req, res) => {
    try {
        const { feedback } = req.body;
        const booking = await getBookingModel().findById(req.params.id);
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
        const booking = await getBookingModel().findById(req.params.id);
        if (!booking) return res.status(404).json({ msg: "Booking not found" });
        if (booking.userId.toString() !== req.user) return res.status(401).json({ msg: "Unauthorized" });

        booking.userRating = rating;
        booking.userReview = review;
        await booking.save();

        // Update expert's average rating
        const expert = await getUserModel().findById(booking.expertId);
        const allRatings = await getBookingModel().find({ expertId: booking.expertId });
        // Simple filter for mocks if needed, but here we just take all that have ratings
        const ratedBookings = allRatings.filter(b => b.userRating);
        const avg = ratedBookings.length > 0 ? ratedBookings.reduce((acc, curr) => acc + curr.userRating, 0) / ratedBookings.length : 0;

        expert.rating = parseFloat(avg.toFixed(1));
        expert.reviewsCount = allRatings.length;
        await expert.save();

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
