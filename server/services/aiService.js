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
        You are an expert interview coach. Analyze the following interview question and candidate's answer.
        
        Question: "${question}"
        Answer: "${answer}"
        
        Provide structured feedback in JSON format with the following fields:
        - summary: A brief summary of the answer (max 2 sentences).
        - strengths: An array of strings (key strengths).
        - weaknesses: An array of strings (areas for improvement).
        - tips: An array of specific, actionable tips to improve.
        - score: An integer from 0 to 100 representing the quality of the answer.
        
        Ensure the feedback is constructive, professional, and encouraging but honest.
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
            `Q${index + 1}: ${item.question}\nA: ${item.answer}\nScore: ${item.feedback.score}`
        ).join('\n\n');

        const prompt = `
        Based on the following interview session summary, provide an overall assessment.
        
        ${sessionSummary}
        
        Provide output in JSON format:
        - overallScore: Average of question scores (integer).
        - communicationScore: 0-100 rating of communication clarity.
        - technicalScore: 0-100 rating of technical content (if applicable, otherwise estimate based on logic).
        - confidenceScore: 0-100 rating of implied confidence/tone.
        - readinessScore: 0-100 rating of job readiness.
        - personalizedAdvice: A paragraph of personalized advice (max 3-4 sentences).
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
