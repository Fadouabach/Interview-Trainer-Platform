import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'expert', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    field: { type: String, default: '' },
    skills: [{ type: String }],
    // Expert fields
    title: { type: String, default: '' },
    company: { type: String, default: '' },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    sessionTypes: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
