import mongoose from 'mongoose';

const ExpertRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    phone: String,
    location: String,
    skills: [String],
    previousCompanies: [String],
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String,
    documents: [String], // Array of file URLs
    status: {
        type: String,
        enum: ['pending', 'under_review', 'accepted', 'rejected', 'approved'], // kept approved for backward compat
        default: 'pending'
    },
    rejectionReason: String,
    verificationInterview: {
        questions: [{
            question: String,
            answer: String,
            score: Number,
            notes: String
        }],
        adminNotes: String,
        verificationScore: Number,
        conductedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        conductedAt: Date
    },
    meetingDateTime: Date,
    meetingLink: String,
    meetingStatus: {
        type: String,
        enum: ['not_scheduled', 'scheduled', 'completed'],
        default: 'not_scheduled'
    }
}, { timestamps: true });

export default mongoose.model('ExpertRequest', ExpertRequestSchema);
