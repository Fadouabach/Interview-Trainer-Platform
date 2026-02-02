import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const ActivityLog = mongoose.model('activityLog', ActivityLogSchema);
export default ActivityLog;
