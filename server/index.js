require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri)
    .then(() => console.log("MongoDB database connection established successfully"))
    .catch(err => console.error("MongoDB connection error:", err));

// Routes
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// Basic Route
app.get('/', (req, res) => {
    res.send('Interview Trainer API is running');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
