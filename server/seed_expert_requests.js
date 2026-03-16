import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import ExpertRequest from './models/ExpertRequest.js';

dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb+srv://fadouaba97_db_user:iXFkCC53ddUqriwO@cluster0.r7vxsoa.mongodb.net/InterviewTrainer?retryWrites=true&w=majority';

async function seedExpertRequests() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB Atlas for direct seeding...");

        const normalUser = await User.findOne({ email: 'normal@test.com' });
        if (!normalUser) {
            console.log("Normal user not found. Run seed_mongo.js first.");
            process.exit(1);
        }

        // Cleanup existing for this user
        await ExpertRequest.deleteMany({ userId: normalUser._id });

        await ExpertRequest.create({
            userId: normalUser._id,
            domain: 'Fullstack Web Development',
            bio: 'Experienced developer specializing in Node.js and React. I have mentored over 50 junior developers and conducted 100+ technical interviews.',
            experience: '8 years of industry experience at top tech firms.',
            phone: '+1 234 567 890',
            location: 'San Francisco, CA',
            skills: ['React', 'Node.js', 'MongoDB', 'System Design', 'AWS'],
            previousCompanies: ['Google', 'Meta', 'Stripe'],
            linkedinUrl: 'https://linkedin.com/in/dummy-expert',
            githubUrl: 'https://github.com/dummy-expert',
            portfolioUrl: 'https://dummy-portfolio.com',
            documents: ['http://localhost:5002/uploads/sample-resume.pdf'],
            status: 'pending'
        });
        
        console.log("✅ Expert request seeded in MongoDB Atlas.");
        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to seed Atlas expert requests:", err);
        process.exit(1);
    }
}

seedExpertRequests();
