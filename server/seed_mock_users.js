import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'data/users.json');

async function seed() {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash('password123', salt);

    const users = [
        {
            _id: 'admin123',
            name: 'Admin User',
            email: 'admin@test.com',
            password: hash,
            role: 'admin',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'expert123',
            name: 'Expert User',
            email: 'expert@test.com',
            password: hash,
            role: 'expert',
            createdAt: new Date().toISOString()
        },
        {
            _id: 'user123',
            name: 'Normal User',
            email: 'normal@test.com',
            password: hash,
            role: 'user',
            createdAt: new Date().toISOString()
        }
    ];

    if (!fs.existsSync(path.dirname(dbPath))) {
        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    }
    
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
    console.log("Seeded admins and experts into users.json");
}

seed();
