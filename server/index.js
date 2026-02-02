import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './routes/auth.js';
import usersRouter from './routes/users.js';
import interviewsRouter from './routes/interviews.js';
import dashboardRouter from './routes/dashboard.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.MONGO_URI;

if (uri && !uri.includes('<your-cluster>')) {
    mongoose.connect(uri)
        .then(() => console.log("MongoDB database connection established successfully"))
        .catch(err => console.error("MongoDB connection error:", err));
} else {
    console.log("⚠️ MongoDB URI is missing or invalid. Server running in FALLBACK mode (Local JSON).");
}

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/interviews', interviewsRouter);
app.use('/api/dashboard', dashboardRouter);

// Basic Route
app.get('/', (req, res) => {
    res.send('Interview Trainer API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});



console.log("MONGO_URI =", process.env.MONGO_URI);

