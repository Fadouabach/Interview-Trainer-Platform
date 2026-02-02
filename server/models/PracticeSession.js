import mongoose from 'mongoose';

const PracticeSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String, // e.g., 'quiz', 'topic_practice'
        required: true
    },
    duration: {
        type: Number, // in seconds
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const PracticeSession = mongoose.model('practiceSession', PracticeSessionSchema);
export default PracticeSession;
