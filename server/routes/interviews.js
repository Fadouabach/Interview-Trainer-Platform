import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getModels } from '../db.js';
import { transcribeAudio, generateQuestionFeedback, generateOverallFeedback } from '../services/aiService.js';

const router = express.Router();

const getInterviewModel = () => getModels().InterviewSession;

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
        const { userId, category, duration, answers: answersStr } = req.body;

        // Parse answers
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

        console.log("Receiving interview request:", {
            userId,
            category,
            filesReceived: req.files?.map(f => f.fieldname),
            answersCount: answers?.length
        });

        // Process each answer
        const processedAnswers = [];

        for (let i = 0; i < answers.length; i++) {
            const answer = answers[i];
            const originalQuestion = answer.questionText;

            let transcribedText = "";
            let feedback = {};

            const file = req.files.find(f => f.fieldname === `audio_${i}`);
            console.log(`Processing answer ${i}... File found:`, !!file);

            if (file && answer.recorded) {
                // 1. Transcribe
                console.log(`Transcribing answer ${i + 1}...`);
                transcribedText = await transcribeAudio(file.path);
                console.log(`Transcription result for ${i}:`, transcribedText.substring(0, 50) + "...");

                // 2. Generate Feedback
                console.log(`Analyzing answer ${i + 1}...`);
                feedback = await generateQuestionFeedback(originalQuestion, transcribedText);
                console.log(`Feedback score for ${i}:`, feedback.score);

                // Cleanup file
                fs.unlink(file.path, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });
            } else {
                console.log(`No audio for answer ${i}. Recorded: ${answer.recorded}`);
                transcribedText = "No audio recorded.";
                feedback = {
                    summary: "No answer provided.",
                    strengths: { content: "N/A", clarity: "N/A", vocabulary: "N/A", structure: "N/A" },
                    suggestions: ["Attempt every question"],
                    score: 1
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
        console.log("Overall Score:", aiFeedback.overallScore);

        // Save to DB
        const newSession = new (getInterviewModel())({
            userId,
            category,
            duration: duration || 0,
            score: aiFeedback.overallScore || 0,
            answers: processedAnswers,
            aiFeedback
        });

        const savedSession = await newSession.save();
        console.log("Session saved successfully. ID:", savedSession._id);
        res.json(savedSession);

    } catch (err) {
        console.error("Error processing interview:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
