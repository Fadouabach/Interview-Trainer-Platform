import mongoose from 'mongoose';
import User from './models/User.js';
import UserMock from './models/UserMock.js';
import InterviewSession from './models/InterviewSession.js';
import InterviewSessionMock from './models/InterviewSessionMock.js';
import Booking from './models/Booking.js';
import BookingMock from './models/BookingMock.js';
import PracticeSession from './models/PracticeSession.js';
import PracticeSessionMock from './models/PracticeSessionMock.js';
import ActivityLog from './models/ActivityLog.js';
import ActivityLogMock from './models/ActivityLogMock.js';

let isConnected = false;

export const setDbConnected = (status) => {
    isConnected = status;
};

export const getModels = () => {
    // Check if we should use mocks
    // We use mocks if isConnected is false OR if MONGO_URI is missing
    const useMocks = !isConnected || !process.env.MONGO_URI || process.env.MONGO_URI.includes('<your-cluster>');

    if (useMocks) {
        return {
            User: UserMock,
            InterviewSession: InterviewSessionMock,
            Booking: BookingMock,
            PracticeSession: PracticeSessionMock,
            ActivityLog: ActivityLogMock,
            isFallback: true
        };
    }

    return {
        User,
        InterviewSession,
        Booking,
        PracticeSession,
        ActivityLog,
        isFallback: false
    };
};
