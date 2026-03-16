import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const uri = process.env.MONGO_URI;

async function seedMongoDb() {
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected to MongoDB Atlas for seeding...");

        // Delete existing mock accounts if they exist so we don't hit duplicate email errors
        await User.deleteMany({ email: { $in: ['admin@test.com', 'expert@test.com', 'normal@test.com'] } });

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash('password123', salt);

        const usersToInsert = [
            {
                name: 'System Admin',
                email: 'admin@test.com',
                password: hash,
                role: 'admin'
            },
            {
                name: 'Expert Interviewer',
                email: 'expert@test.com',
                password: hash,
                role: 'expert'
            },
            {
                name: 'Practicing Candidate',
                email: 'normal@test.com',
                password: hash,
                role: 'user'
            }
        ];

        await User.insertMany(usersToInsert);
        console.log("✅ Successfully seeded MongoDB with admin@test.com, expert@test.com, and normal@test.com!");

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to seed MongoDB:", err.message);
        process.exit(1);
    }
}

seedMongoDb();
