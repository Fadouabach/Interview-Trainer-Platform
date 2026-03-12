import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/sessions.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

class InterviewSessionMock {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Math.random().toString(36).substr(2, 9);
        if (!this.date) this.date = new Date();
        this.answers = this.answers || [];
        this.aiFeedback = this.aiFeedback || {};
    }

    static async find(query = {}) {
        const sessions = this._getAll();
        return sessions.filter(s => {
            for (let key in query) {
                if (s[key] !== query[key]) return false;
            }
            return true;
        });
    }

    static async findById(id) {
        const sessions = this._getAll();
        return sessions.find(s => s._id === id) || null;
    }

    async save() {
        const sessions = InterviewSessionMock._getAll();
        const existingIdx = sessions.findIndex(s => s._id === this._id);

        if (existingIdx >= 0) {
            sessions[existingIdx] = this;
        } else {
            sessions.push(this);
        }

        InterviewSessionMock._writeAll(sessions);
        return this;
    }

    static _getAll() {
        if (!fs.existsSync(dbPath)) return [];
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data).map(s => new InterviewSessionMock(s));
        } catch (e) {
            return [];
        }
    }

    static _writeAll(sessions) {
        fs.writeFileSync(dbPath, JSON.stringify(sessions, null, 2));
    }
}

export default InterviewSessionMock;
