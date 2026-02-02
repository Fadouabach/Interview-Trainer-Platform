import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import InterviewSession from '../models/InterviewSession.js';
import ActivityLog from '../models/ActivityLog.js';
import { transcribeAudio, generateQuestionFeedback, generateOverallFeedback } from '../services/aiService.js';

const router = express.Router();

// Configure Multer for audio uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Save interview session with AI processing
router.post('/', upload.any(), async (req, res) => {
    try {
        // req.body contains text fields, req.files contains audio files
        // The structure of req.body might be flat due to FormData, so we need to parse it carefully
        const { userId, category, duration, answers: answersStr } = req.body;

        // Parse answers if it comes as a JSON string (common with FormData)
        let answers = [];
        if (typeof answersStr === 'string') {
            try {
                answers = JSON.parse(answersStr);
            } catch (e) {
                console.error("Error parsing answers JSON:", e);
                return res.status(400).json({ error: "Invalid answers format" });
            }
        } else {
            answers = answersStr;
        }

        // Process each answer
        const processedAnswers = [];

        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const originalQuestion = answer.questionText;

            let transcribedText = "";
            let feedback = {};

            // Find corresponding file
            // We assume the frontend sends files with fieldname "audio_<questionId>" or similar mapping
            // OR we iterate through files and match by logic.
            // SIMPLER APPROACH: Frontend sends 'audio' files in order, or we map by index if safely possible.
            // BETTER: Frontend appends file with name `audio_${index}`.

            const file = req.files.find(f => f.fieldname === `audio_${i}`);

            if (file && answer.recorded) {
                // 1. Transcribe
                console.log(`Transcribing answer ${i + 1}...`);
                transcribedText = await transcribeAudio(file.path);

                // 2. Generate Feedback
                console.log(`Analyzing answer ${i + 1}...`);
                feedback = await generateQuestionFeedback(originalQuestion, transcribedText);

                // Cleanup file
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });
            } else {
                // Handle text-only or skipped? Assuming all recorded for now as per requirements
                transcribedText = "No audio recorded.";
                feedback = {
                    summary: "No answer provided.",
                    strengths: [],
                    weaknesses: ["Question skipped"],
                    tips: ["Attempt every question"],
                    score: 0
                };
            }

            processedAnswers.push({
                ...answer,
                transcribedText,
                feedback
            });
        }

        // 3. Generate Overall Feedback
        console.log("Generating overall feedback...");
        const aiFeedback = await generateOverallFeedback(processedAnswers.map(a => ({
            question: a.questionText,
            answer: a.transcribedText,
            feedback: a.feedback
        })));

        // Save to DB
        const newSession = new InterviewSession({
            userId,
            category,
            duration,
            score: aiFeedback.overallScore || 0,
            answers: processedAnswers,
            aiFeedback
        });

        const savedSession = await newSession.save();

        // Also log activity
        const newLog = new ActivityLog({
            userId,
            action: 'Interview Completed',
            details: `Completed ${category} interview with score ${aiFeedback.overallScore}%`
        });
        await newLog.save();

        console.log("Session saved successfully.");
        res.json(savedSession);

    } catch (err) {
        console.error("Error processing interview:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
