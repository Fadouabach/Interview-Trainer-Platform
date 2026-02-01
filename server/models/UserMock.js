import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

class UserMock {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Math.random().toString(36).substr(2, 9);
        if (!this.createdAt) this.createdAt = new Date();
        this.role = this.role || 'user';
        this.avatar = this.avatar || '';
        this.bio = this.bio || '';
        this.skills = this.skills || [];
    }

    static async findOne(query) {
        const users = this._getAll();
        return users.find(u => u.email === query.email) || null;
    }

    static async findById(id) {
        const users = this._getAll();
        return users.find(u => u._id === id) || null;
    }

    async save() {
        const users = UserMock._getAll();
        const existingIdx = users.findIndex(u => u._id === this._id);

        if (existingIdx >= 0) {
            users[existingIdx] = this;
        } else {
            users.push(this);
        }

        UserMock._writeAll(users);
        return this;
    }

    select(fields) {
        return this;
    }

    static _getAll() {
        if (!fs.existsSync(dbPath)) return [];
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data).map(u => new UserMock(u));
        } catch (e) {
            return [];
        }
    }

    static _writeAll(users) {
        fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    }
}

export default UserMock;
