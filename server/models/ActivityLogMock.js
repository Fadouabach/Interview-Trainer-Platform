import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/logs.json');

class ActivityLogMock {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Math.random().toString(36).substr(2, 9);
        if (!this.date) this.date = new Date();
    }

    static async find(query = {}) {
        const logs = this._getAll();
        return logs.filter(l => {
            for (let key in query) {
                if (l[key] !== query[key]) return false;
            }
            return true;
        });
    }

    async save() {
        const logs = ActivityLogMock._getAll();
        const existingIdx = logs.findIndex(l => l._id === this._id);
        if (existingIdx >= 0) logs[existingIdx] = this;
        else logs.push(this);
        ActivityLogMock._writeAll(logs);
        return this;
    }

    static _getAll() {
        if (!fs.existsSync(dbPath)) return [];
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data).map(l => new ActivityLogMock(l));
        } catch (e) { return []; }
    }

    static _writeAll(logs) {
        fs.writeFileSync(dbPath, JSON.stringify(logs, null, 2));
    }
}

export default ActivityLogMock;
