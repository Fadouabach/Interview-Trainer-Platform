import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { questions } from '../data/questions';

export function Session({ category, onFinish }) {
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [currentAudio, setCurrentAudio] = useState(null); // { url, blob }

    // Recording refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [permission, setPermission] = useState('prompt'); // granted, denied, prompt
    const [stream, setStream] = useState(null);

    const categoryNames = {
        'frontend': 'Frontend Developer',
        'backend': 'Backend Developer',
        'behavioral': 'Soft Skills & Behavioral',
        'fullstack': 'Fullstack Engineer',
        'mobile': 'Mobile App Developer',
        'data': 'Data Science & AI'
    };

    const displayCategory = categoryNames[category?.toLowerCase()] || category || 'General';

    const categoryQuestions = questions[category] || [];
    const currentQuestion = categoryQuestions[currentQIndex];

    useEffect(() => {
        if (currentQuestion) {
            setTimeLeft(currentQuestion.timeLimit);
            setCurrentAudio(null);
            setIsRecording(false);
        }
    }, [currentQuestion]);

    useEffect(() => {
        if (timeLeft > 0 && isRecording) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, isRecording]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startRecording = async () => {
        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(audioStream);
            setPermission('granted');

            mediaRecorderRef.current = new MediaRecorder(audioStream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setCurrentAudio(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setPermission('denied');
            alert("Microphone access is required to record your answer. Please check your browser settings.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const audioUrl = URL.createObjectURL(audioBlob);
                setCurrentAudio({ url: audioUrl, blob: audioBlob });
            };

            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const [totalTimeSpent, setTotalTimeSpent] = useState(0);

    const confirmAnswer = () => {
        if (!currentAudio) return;

        // Calculate time spent on THIS question
        const questionTimeSpent = currentQuestion.timeLimit - timeLeft;
        const newTotal = totalTimeSpent + questionTimeSpent;
        setTotalTimeSpent(newTotal);

        // Save answer with audio
        const newAnswer = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.question,
            recorded: true,
            audioUrl: currentAudio.url,
            audioBlob: currentAudio.blob
        };

        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);

        // Proceed to next or finish
        if (currentQIndex < categoryQuestions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            onFinish(updatedAnswers, newTotal); // Pass answers and total time to finish handler
        }
    };

    if (!categoryQuestions || categoryQuestions.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2>No questions found for this category.</h2>
                    <button className="btn" onClick={() => onFinish([])} style={{ marginTop: '1rem' }}>Go Back</button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return <div>Loading question...</div>;

    const progress = ((currentQIndex + 1) / categoryQuestions.length) * 100;

    return (
        <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                    Mock Interview – {displayCategory}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Question {currentQIndex + 1} of {categoryQuestions.length}</span>
                    <div style={{ width: '150px', height: '6px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.5s ease' }}></div>
                    </div>
                </div>
            </div>

            <div className="card" style={{
                padding: '4rem 3rem',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                borderRadius: '32px',
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-subtle)'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '2rem',
                    right: '2.5rem',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: timeLeft < 30 ? '#fee2e2' : '#f8fafc',
                    padding: '0.6rem 1rem',
                    borderRadius: '12px',
                    color: timeLeft < 30 ? '#ef4444' : '#64748b',
                    fontWeight: '700',
                    fontSize: '1rem',
                    border: '1px solid ' + (timeLeft < 30 ? '#fecaca' : '#e2e8f0')
                }}>
                    <Clock size={18} />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>

                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.3', maxWidth: '700px', margin: '0 auto' }}>
                        {currentQuestion.question}
                    </h2>
                </div>

                <div style={{
                    height: '240px',
                    border: '2px solid #f1f5f9',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isRecording ? '#faf5ff' : '#f8fafc',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexDirection: 'column',
                    marginBottom: '3rem',
                    boxShadow: isRecording ? 'inset 0 0 20px rgba(139, 92, 246, 0.1)' : 'none'
                }}>
                    {permission === 'denied' ? (
                        <div style={{ textAlign: 'center', color: 'var(--danger)', padding: '1rem' }}>
                            <p style={{ fontWeight: '600' }}>Microphone access denied.</p>
                            <p style={{ fontSize: '0.9rem' }}>Please allow access in your browser settings to record your answer.</p>
                        </div>
                    ) : isRecording ? (
                        <div style={{ textAlign: 'center' }}>
                            <div className="pulse" style={{ fontSize: '1.1rem', fontWeight: '700', color: '#8b5cf6', marginBottom: '1rem' }}>Live Recording...</div>
                            <div style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))' }}>🎙️</div>
                        </div>
                    ) : currentAudio ? (
                        <div style={{ width: '85%', textAlign: 'center' }}>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)', fontWeight: '500' }}>How did you do? Review your answer below:</p>
                            <audio controls src={currentAudio.url} style={{ width: '100%', height: '45px' }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-light)' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🎙️</div>
                            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Ready? Click the button below to start answering</p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                    {!isRecording && !currentAudio && (
                        <button
                            className="btn"
                            onClick={startRecording}
                            disabled={permission === 'denied'}
                            style={{ padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.2)' }}
                        >
                            <Mic size={22} />
                            Start Answering
                        </button>
                    )}

                    {isRecording && (
                        <button
                            className="btn"
                            style={{ background: '#ef4444', padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.2)' }}
                            onClick={stopRecording}
                        >
                            <StopCircle size={22} />
                            Stop Recording
                        </button>
                    )}

                    {currentAudio && (
                        <>
                            <button
                                className="btn"
                                style={{ background: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)', padding: '1.25rem 2rem', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                                onClick={startRecording}
                            >
                                <RefreshCw size={22} />
                                Try Again
                            </button>
                            <button
                                className="btn"
                                style={{ background: '#10b981', padding: '1.25rem 2.5rem', fontSize: '1.1rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}
                                onClick={confirmAnswer}
                            >
                                <CheckCircle size={22} />
                                {currentQIndex === categoryQuestions.length - 1 ? 'Complete Interview' : 'Next Question'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
