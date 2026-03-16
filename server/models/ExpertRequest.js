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
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }
}, { timestamps: true });

export default mongoose.model('ExpertRequest', ExpertRequestSchema);
