import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Starting Interview Trainer System...');

// Start Backend
const server = spawn('npm', ['start'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'server'),
    shell: true
});

server.on('error', (err) => {
    console.error('Failed to start server:', err);
});

// Start Frontend
const client = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'client'),
    shell: true
});

client.on('error', (err) => {
    console.error('Failed to start client:', err);
});

// Handle termination
process.on('SIGINT', () => {
    server.kill();
    client.kill();
    process.exit();
});
