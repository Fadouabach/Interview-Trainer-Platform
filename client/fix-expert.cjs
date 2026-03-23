const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'src', 'components', 'ExpertDashboard.jsx');

let content = fs.readFileSync(target, 'utf8');

// 1. Import ThemeToggle
if (!content.includes("ThemeToggle")) {
    content = content.replace(
        "import { useAuth } from '../context/AuthContext';",
        "import { useAuth } from '../context/AuthContext';\nimport ThemeToggle from './ThemeToggle';"
    );
}

// 2. Add ThemeToggle to the navbar
// Find the avatar section in navbar around line 1515:
// <Avatar name={user?.name || ''} avatar={user?.avatar || ''} size={38} />
// <button
// onClick={handleLogout}
const navbarTarget = `<Avatar name={user?.name || ''} avatar={user?.avatar || ''} size={38} />`;
if (!content.includes('<ThemeToggle />') && content.includes(navbarTarget)) {
    content = content.replace(
        navbarTarget,
        `<ThemeToggle />
                    ${navbarTarget}`
    );
}

// 3. Fix colors that break dark mode contrast
const colorMap = {
    "background: '#f3f4f6'": "background: 'var(--bg-app)'",
    "background: '#fafafa'": "background: 'var(--bg-app)'",
    "background: '#fef2f2'": "background: 'var(--danger-soft)'",
    "border: '1px solid #fecaca'": "border: '1px solid var(--danger)'",
    "background: '#f0fdf4'": "background: 'var(--success-soft)'",
    "border: '1px solid #bbf7d0'": "border: '1px solid var(--success)'",
    "background: '#ecfdf5'": "background: 'var(--success-soft)'",
    "background: '#eff6ff'": "background: 'rgba(59, 130, 246, 0.1)'",
    "border: '1px solid #bfdbfe'": "border: '1px solid rgba(59, 130, 246, 0.2)'",
    "background: '#f0f9ff'": "background: 'rgba(14, 165, 233, 0.1)'",
    "border: '1px solid #bae6fd'": "border: '1px solid rgba(14, 165, 233, 0.2)'",
    "background: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'": "background: 'var(--bg-app)'",
    "color: '#374151'": "color: 'var(--text-main)'",
    "color: '#475569'": "color: 'var(--text-muted)'",
    "border: '2px solid #fecaca'": "border: '2px solid var(--danger)'",
    "border: '2px dashed #e2e8f0'": "border: '2px dashed var(--border-subtle)'",
    "color: '#0369a1'": "color: 'var(--info)'",
    "color: '#0c4a6e'": "color: 'var(--text-main)'",
    "background: '#fffbeb'": "background: 'var(--warning-soft)'",
    "border: '1px solid #fde68a'": "border: '1px solid var(--warning)'",
    "color: '#d97706'": "color: 'var(--warning)'",
    "background: '#ede9fe'": "background: 'rgba(139, 92, 246, 0.1)'",
    "borderColor: '#c4b5fd'": "borderColor: 'rgba(139, 92, 246, 0.3)'"
};

for (const [key, value] of Object.entries(colorMap)) {
    content = content.split(key).join(value);
}

// 4. Any direct instances of black text that break headers
content = content.replace(/color: '#000'/g, "color: 'var(--text-main)'");
content = content.replace(/color: 'black'/g, "color: 'var(--text-main)'");
content = content.replace(/color: '#1f2937'/g, "color: 'var(--text-main)'");
content = content.replace(/color: '#111827'/g, "color: 'var(--text-main)'");

fs.writeFileSync(target, content, 'utf8');
console.log('Fixed ExpertDashboard.jsx themes and added ThemeToggle');
