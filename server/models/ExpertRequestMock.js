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
    static _getAll() {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    }

    static _writeAll(data) {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }

    static async find(query = {}) {
        let requests = this._getAll();
        if (query.status) {
            requests = requests.filter(r => r.status === query.status);
        }
        return requests;
    }

    static async findById(id) {
        const requests = this._getAll();
        return requests.find(r => r._id === id || r.id === id);
    }

    static async findByIdAndUpdate(id, update) {
        const requests = this._getAll();
        const index = requests.findIndex(r => r._id === id || r.id === id);
        if (index !== -1) {
            requests[index] = { ...requests[index], ...update };
            this._writeAll(requests);
            return requests[index];
        }
        return null;
    }

    static async create(data) {
        const requests = this._getAll();
        const newRequest = {
            _id: Math.random().toString(36).substr(2, 9),
            ...data,
            status: data.status || 'pending',
            createdAt: new Date().toISOString()
        };
        requests.push(newRequest);
        this._writeAll(requests);
        return newRequest;
    }
}

export default ExpertRequestMock;
