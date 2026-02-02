import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionType: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    goal: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    expertFeedback: { type: String, default: '' },
    userRating: { type: Number, min: 1, max: 5 },
    userReview: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);

export default Booking;
