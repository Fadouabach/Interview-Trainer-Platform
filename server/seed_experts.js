import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const experts = [
    {
        name: 'Jihane K.',
        email: 'jihane@example.com',
        password: 'password123',
        role: 'expert',
        title: 'Frontend & React Expert',
        company: 'Ex-Google',
        price: 55,
        rating: 5.0,
        reviewsCount: 102,
        sessionTypes: ['Mock Interview', 'Code Review', 'Career Advice'],
        bio: 'Senior Frontend Engineer with 10+ years of experience. I help developers master React and land jobs at top tech companies.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jihane'
    },
    {
        name: 'Kareem L.',
        email: 'kareem@example.com',
        password: 'password123',
        role: 'expert',
        title: 'Backend & Coding',
        company: 'Amazon',
        price: 55,
        rating: 4.9,
        reviewsCount: 85,
        sessionTypes: ['Algorithms', 'System Design', 'Backend Architecture'],
        bio: 'Backend specialist focused on scalable systems. Let\'s practice LeetCode and system design together.',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kareem'
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const expert of experts) {
            const existing = await User.findOne({ email: expert.email });
            if (!existing) {
                const salt = await bcrypt.genSalt(10);
                expert.password = await bcrypt.hash(expert.password, salt);
                await User.create(expert);
                console.log(`Expert ${expert.name} created`);
            }
        }

        console.log('Seeding finished');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
