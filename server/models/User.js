import mongoose from 'mongoose';
import UserMock from './UserMock.js';

let User;

// Check if we have a valid Mongo URI (not a placeholder)
const uri = process.env.MONGO_URI;
const isPlaceholder = !uri || uri.includes('<your-cluster>') || uri.includes('cluster0.mongodb.net');

if (isPlaceholder) {
    console.log("⚠️ Using Local JSON Database (fallback mode)");
    User = UserMock;
} else {
    // Original Mongoose Schema
    const userSchema = new mongoose.Schema({
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, trim: true, lowercase: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user', 'expert', 'admin'], default: 'user' },
        avatar: { type: String, default: '' },
        bio: { type: String, default: '' },
        field: { type: String, default: '' },
        skills: [{ type: String }],
        createdAt: { type: Date, default: Date.now }
    });

    try {
        User = mongoose.model('User');
    } catch (e) {
        User = mongoose.model('User', userSchema);
    }
}

export default User;
