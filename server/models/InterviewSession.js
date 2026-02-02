import mongoose from 'mongoose';

const InterviewSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    category: {
        type: String,
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
    answers: [{
        questionId: String,
        questionText: String,
        recorded: Boolean,
        audioUrl: String,
        transcribedText: String,
        feedback: {
            summary: String,
            strengths: [String],
            weaknesses: [String],
            tips: [String],
            score: Number
        }
    }],
    aiFeedback: {
        overallScore: Number,
        communicationScore: Number,
        technicalScore: Number,
        confidenceScore: Number,
        readinessScore: Number,
        personalizedAdvice: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const InterviewSession = mongoose.model('interviewSession', InterviewSessionSchema);
export default InterviewSession;
