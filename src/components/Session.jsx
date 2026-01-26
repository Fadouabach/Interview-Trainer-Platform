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

    const confirmAnswer = () => {
        if (!currentAudio) return;

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
            onFinish(updatedAnswers); // Pass answers to finish handler
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
        <div className="container" style={{ maxWidth: '800px', marginTop: '2rem' }}>
            {/* Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'var(--glass-bg)', borderRadius: '10px', marginBottom: '2rem' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    color: timeLeft < 30 ? '#ef4444' : 'white'
                }}>
                    <Clock size={16} />
                    <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>

                <span style={{
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontSize: '0.8rem',
                    color: 'var(--secondary)',
                    fontWeight: 'bold'
                }}>
                    Question {currentQIndex + 1} of {categoryQuestions.length}
                </span>

                <h2 style={{ fontSize: '2rem', marginTop: '1rem', marginBottom: '2rem' }}>
                    {currentQuestion.question}
                </h2>

                <div style={{
                    height: '200px',
                    border: '2px dashed var(--glass-border)',
                    borderRadius: 'var(--radius)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isRecording ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                    transition: 'all 0.3s',
                    flexDirection: 'column'
                }}>
                    {permission === 'denied' ? (
                        <div style={{ textAlign: 'center', color: '#ef4444' }}>
                            <p>Microphone access denied. Please allow access to record.</p>
                        </div>
                    ) : isRecording ? (
                        <div style={{ textAlign: 'center', color: 'var(--primary)' }}>
                            <div className="pulse" style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Recording...</div>
                            <div style={{ fontSize: '3rem' }}>🎙️</div>
                        </div>
                    ) : currentAudio ? (
                        <div style={{ width: '80%', textAlign: 'center' }}>
                            <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Review your answer:</p>
                            <audio controls src={currentAudio.url} style={{ width: '100%' }} />
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>Click "Start Answering" to begin</p>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '1rem' }}>
                    {!isRecording && !currentAudio && (
                        <button className="btn" onClick={startRecording} disabled={permission === 'denied'}>
                            <Mic size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Start Answering
                        </button>
                    )}

                    {isRecording && (
                        <button className="btn" style={{ background: '#ef4444' }} onClick={stopRecording}>
                            <StopCircle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Stop Recording
                        </button>
                    )}

                    {currentAudio && (
                        <>
                            <button className="btn" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }} onClick={startRecording}>
                                <RefreshCw size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                Rerecord
                            </button>
                            <button className="btn" style={{ background: '#10b981' }} onClick={confirmAnswer}>
                                <CheckCircle size={20} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                {currentQIndex === categoryQuestions.length - 1 ? 'Finish Interview' : 'Next Question'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
