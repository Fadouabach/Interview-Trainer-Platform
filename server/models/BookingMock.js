import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/bookings.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, '../data'))) {
    fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
}

class BookingMock {
    constructor(data) {
        Object.assign(this, data);
        if (!this._id) this._id = Math.random().toString(36).substr(2, 9);
        if (!this.createdAt) this.createdAt = new Date();
        this.status = this.status || 'pending';
    }

    static async find(query = {}) {
        const bookings = this._getAll();
        return bookings.filter(b => {
            for (let key in query) {
                if (b[key] !== query[key]) return false;
            }
            return true;
        });
    }

    static async findById(id) {
        const bookings = this._getAll();
        return bookings.find(b => b._id === id) || null;
    }

    async save() {
        const bookings = BookingMock._getAll();
        const existingIdx = bookings.findIndex(b => b._id === this._id);

        if (existingIdx >= 0) {
            bookings[existingIdx] = this;
        } else {
            bookings.push(this);
        }

        BookingMock._writeAll(bookings);
        return this;
    }

    static _getAll() {
        if (!fs.existsSync(dbPath)) return [];
        try {
            const data = fs.readFileSync(dbPath, 'utf8');
            return JSON.parse(data).map(b => new BookingMock(b));
        } catch (e) {
            return [];
        }
    }

    static _writeAll(bookings) {
        fs.writeFileSync(dbPath, JSON.stringify(bookings, null, 2));
    }
}

export default BookingMock;
