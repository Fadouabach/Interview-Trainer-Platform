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

export const generateQuestionFeedback = async (question, answer) => {
    const client = getOpenAIClient();
    if (!client) {
        return {
            summary: "AI Service Unavailable (Missing Key)",
            strengths: { content: "", clarity: "", vocabulary: "", structure: "" },
            suggestions: ["Please configure OpenAI API Key"],
            score: 0
        };
    }
    try {
        const prompt = `
        You are a professional job interviewer.
        Analyze the candidate's answer and give structured feedback.
        Keep it clear and realistic like a real interview.

        Question: "${question}"
        Answer: "${answer}"
        
        Provide structured feedback in JSON format strictly matching this exact schema:
        - score: An integer from 1 to 5 (1=Poor, 5=Excellent).
        - strengths: { content: string, clarity: string, vocabulary: string, structure: string } (briefly describe what was good in each category).
        - suggestions: Array of strings (specific, actionable suggestions for improvement).
        - improvedAnswer: A well-written string providing a professional "Improved sample answer" they could have used.
        - summary: A short, realistic summary of the interaction.
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
        return {
            summary: "Answer recorded. AI analysis temporarily unavailable.",
            strengths: { content: "Response captured", clarity: "", vocabulary: "", structure: "" },
            suggestions: ["AI feedback generation failed", "Try again later or check server logs"],
            score: 3
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
            topStrengths: [],
            topImprovements: [],
            personalizedAdvice: "AI Service Unavailable. Please add OPENAI_API_KEY to .env file."
        };
    }
    try {
        const sessionSummary = sessionData.map((item, index) =>
            `--- Question ${index + 1} ---
            Q: ${item.question}
            A: ${item.answer}
            Score: ${item.feedback.score}/5`
        ).join('\n\n');

        const prompt = `
        As a professional interview evaluator, perform a final assessment of this candidate's full interview session.
        
        Candidate Session Data:
        ${sessionSummary}
        
        Provide the output in STRICT JSON format with these exact fields:
        
        - overallScore: integer (percentage 0-100 based on the average of 1-5 ratings).
        - topStrengths: Array of 3 strings (the most significant strengths noted across all answers).
        - topImprovements: Array of 3 objects { "area": string, "tip": string } (the most critical areas for improvement with actionable tips).
        - levelAssessment: string ("Below Junior" | "Junior" | "Mid" | "Senior").
        - communicationSummary: string (a summary of clarity, structure, and confidence).
        - nextSteps: string (the single most important thing to fix before the next interview).
        `;

        console.log("Sending Overall Prompt To OpenAI...");
        const completion = await client.chat.completions.create({
            messages: [{ role: "system", content: "You are a helpful assistant that outputs JSON." }, { role: "user", content: prompt }],
            model: "gpt-4o",
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content;
        console.log("Overall OpenAI Response received.");
        return JSON.parse(content);
    } catch (error) {
        console.error("Error generating overall feedback:", error.message);
        const avgScore = sessionData.length > 0
            ? Math.round((sessionData.reduce((sum, item) => sum + (item.feedback?.score || 3), 0) / (sessionData.length * 5)) * 100)
            : 50;

        return {
            overallScore: avgScore,
            topStrengths: ["Session completed successfully"],
            topImprovements: [{ area: "AI Analysis", tip: "Detailed AI analysis is currently unavailable. Please try again later." }],
            levelAssessment: "Evaluating",
            communicationSummary: "Communication analysis is pending. Based on your inputs, your session has been saved.",
            nextSteps: "Review your transcribed answers and prepare for the next round.",
            personalizedAdvice: "Session completed. Detailed feedback generation is temporarily unavailable. Your responses have been saved."
        };
    }
};
