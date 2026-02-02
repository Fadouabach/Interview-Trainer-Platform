import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Lazy-load OpenAI client to ensure env vars are loaded
let openai = null;

const getOpenAIClient = () => {
    if (!openai && process.env.OPENAI_API_KEY) {
        try {
            openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY,
            });
            console.log('✅ OpenAI client initialized successfully');
        } catch (e) {
            console.warn("❌ Invalid OpenAI API Key format:", e.message);
        }
    }
    return openai;
};

/**
 * Transcribe audio file to text using OpenAI Whisper
 * @param {string} filePath - Path to the audio file
 * @returns {Promise<string>} - Transcribed text
 */
export const transcribeAudio = async (filePath) => {
    const client = getOpenAIClient();
    if (!client) {
        console.error('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'EXISTS' : 'MISSING');
        return "[Audio recorded - Transcription unavailable: OpenAI API key not configured]";
    }
    try {
        const transcription = await client.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: "whisper-1",
            language: "en",
        });
        return transcription.text;
    } catch (error) {
        console.error("Error transcribing audio:", error.message);
        // Return a fallback message instead of throwing
        if (error.status === 429) {
            return "[Audio recorded - Transcription unavailable: OpenAI quota exceeded. Please add credits to your OpenAI account]";
        }
        return "[Audio recorded - Transcription failed]";
    }
};

/**
 * Generate feedback for a specific question and answer
 * @param {string} question - The interview question
 * @param {string} answer - The user's transcribed answer
 * @returns {Promise<Object>} - Structured feedback
 */
export const generateQuestionFeedback = async (question, answer) => {
    const client = getOpenAIClient();
    if (!client) {
        return {
            summary: "AI Service Unavailable (Missing Key)",
            strengths: [],
            weaknesses: [],
            tips: ["Please configure OpenAI API Key"],
            score: 0
        };
    }
    try {
        const prompt = `
        You are a professional technical interviewer and career coach. Analyze the following interview question and candidate's answer with extreme strictness and realism. Do NOT inflate scores or give generic encouragement.

        Domain context: ${question}
        
        Evaluation Criteria:
        1. Technical Correctness: Is the answer factually accurate?
        2. Clarity & Structure: Is the explanation logical and easy to follow?
        3. Depth: Does it show a senior level of understanding or just surface-level knowledge?
        4. Relevance: Does it directly address the question without fluff?

        Question: "${question}"
        Answer: "${answer}"
        
        Provide structured feedback in JSON format with the following fields:
        - summary: A brutal and honest summary of the quality of this specific answer.
        - strengths: Array of strings. Only include genuine strong points. If none, leave empty.
        - weaknesses: Array of strings. Be specific about technical gaps, logical errors, or vague phrasing.
        - tips: Array of strings. Concrete, technical, or structural advice on how to improve this specific answer.
        - score: An integer from 0 to 10. 10 is perfect (Senior), 7 is solid (Mid), 4 is struggling (Junior), 0-2 is a fail.
        
        Important: If the user gives a vague, incomplete, or "I don't know" answer, give a score between 0-3.
        `;

        const completion = await client.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const feedback = JSON.parse(completion.choices[0].message.content);
        return feedback;
    } catch (error) {
        console.error("Error generating question feedback:", error.message);

        // Provide helpful fallback feedback based on error type
        if (error.status === 429) {
            return {
                summary: "Your answer was recorded successfully. AI analysis unavailable due to OpenAI quota limits.",
                strengths: ["Answer recorded"],
                weaknesses: ["AI feedback unavailable - please add OpenAI credits"],
                tips: ["Add credits to your OpenAI account to enable AI-powered feedback"],
                score: 50
            };
        }

        return {
            summary: "Answer recorded. AI analysis temporarily unavailable.",
            strengths: ["Response captured"],
            weaknesses: ["Feedback generation failed"],
            tips: ["Try again later or check server logs"],
            score: 50
        };
    }
};

/**
 * Generate overall interview feedback and readiness score
 * @param {Array} sessionData - Array of { question, answer, feedback } objects
 * @returns {Promise<Object>} - Overall feedback
 */
export const generateOverallFeedback = async (sessionData) => {
    const client = getOpenAIClient();
    if (!client) {
        return {
            overallScore: 0,
            communicationScore: 0,
            technicalScore: 0,
            confidenceScore: 0,
            readinessScore: 0,
            personalizedAdvice: "AI Service Unavailable. Please add OPENAI_API_KEY to .env file."
        };
    }
    try {
        const sessionSummary = sessionData.map((item, index) =>
            `--- Question ${index + 1} ---
            Domain: ${item.category || 'General'}
            Q: ${item.question}
            A: ${item.answer}
            Individual Score: ${item.feedback.score}/10`
        ).join('\n\n');

        const prompt = `
        As a professional interview evaluator, perform a final assessment of this candidate's full interview session.
        
        Candidate Session Data:
        ${sessionSummary}
        
        Your evaluation must be realistic and professional. Judge the candidate's readiness for a real-world role (Junior, Mid, or Senior).

        Provide the output in STRICT JSON format with these exact fields:
        
        - result: {
            "finalScore": integer (0-100),
            "levelAssessment": string ("Below Junior" | "Junior" | "Mid" | "Senior")
          }
        - strengths: Array of strings (based on demonstrated knowledge).
        - weaknesses: Array of strings (real mistakes, missing concepts, poor logic).
        - questionReview: Array of objects, one for each question: {
            "question": string,
            "score": integer (0-10),
            "good": string (what was correct),
            "wrong": string (what was missing/incorrect),
            "advice": string (concrete technical/logical fix)
          }
        - communication: {
            "clarity": string,
            "structure": string,
            "confidence": string,
            "language": string,
            "paceAnalysis": string (analyze hesitation, filler words, or rushes based on the text structure)
          }
        - improvementPlan: {
            "mustStudy": Array of strings (topics to master),
            "suggestedExercises": Array of strings (specific tasks/projects),
            "nextFix": string (the single most important thing to fix before next interview)
          }
        `;

        const completion = await client.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error generating overall feedback:", error.message);

        // Calculate basic scores from individual question scores if available
        const avgScore = sessionData.length > 0
            ? Math.round(sessionData.reduce((sum, item) => sum + (item.feedback?.score || 0), 0) / sessionData.length)
            : 50;

        if (error.status === 429) {
            return {
                overallScore: avgScore,
                communicationScore: avgScore,
                technicalScore: avgScore,
                confidenceScore: avgScore,
                readinessScore: avgScore,
                personalizedAdvice: "Your interview session was completed successfully! However, detailed AI analysis is currently unavailable because your OpenAI account has exceeded its quota. Please add credits to your OpenAI account at https://platform.openai.com/account/billing to enable AI-powered feedback and insights."
            };
        }

        return {
            overallScore: avgScore,
            communicationScore: avgScore,
            technicalScore: avgScore,
            confidenceScore: avgScore,
            readinessScore: avgScore,
            personalizedAdvice: "Session completed. Detailed feedback generation is temporarily unavailable. Your responses have been saved."
        };
    }
};
