import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '../data/expert_requests.json');

// Ensure the data file exists
if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify([], null, 2));
}

class ExpertRequestMock {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id && !this.id) this._id = Math.random().toString(36).substr(2, 9);
        if (!this.status) this.status = 'pending';
        if (!this.createdAt) this.createdAt = new Date().toISOString();
    }

    static _getAll() {
        if (!fs.existsSync(dataPath)) return [];
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data).map(r => new ExpertRequestMock(r));
    }

    static _writeAll(data) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }

    static async find(query = {}) {
        let requests = this._getAll();
        if (query.status) {
            requests = requests.filter(r => r.status === query.status);
        }
        if (query.userId) {
            requests = requests.filter(r => r.userId === query.userId.toString());
        }
        return requests;
    }

    static async findOne(query) {
        const requests = this._getAll();
        return requests.find(r => {
            for (let key in query) {
                if (r[key] !== query[key]) return false;
            }
            return true;
        }) || null;
    }

    static async findById(id) {
        const requests = this._getAll();
        return requests.find(r => r._id === id || r.id === id);
    }

    static async findByIdAndUpdate(id, update) {
        const requests = ExpertRequestMock._getAll();
        const index = requests.findIndex(r => r._id === id || r.id === id);
        if (index !== -1) {
            Object.assign(requests[index], update);
            ExpertRequestMock._writeAll(requests);
            return requests[index];
        }
        return null;
    }

    async save() {
        const requests = ExpertRequestMock._getAll();
        const index = requests.findIndex(r => r._id === this._id || r.id === this._id);
        if (index !== -1) {
            requests[index] = this;
        } else {
            requests.push(this);
        }
        ExpertRequestMock._writeAll(requests);
        return this;
    }

    static async create(data) {
        const newReq = new ExpertRequestMock(data);
        return await newReq.save();
    }
}

export default ExpertRequestMock;
