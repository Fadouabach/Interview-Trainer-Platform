const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const colorMap = {
    // Backgrounds
    "background: 'white'": "background: 'var(--bg-panel)'",
    "background: '#ffffff'": "background: 'var(--bg-panel)'",
    "background: '#f8fafc'": "background: 'var(--bg-app)'",
    "background: '#f1f5f9'": "background: 'var(--neutral-soft)'",
    "background: '#fee2e2'": "background: 'var(--danger-soft)'",
    "background: '#dcfce7'": "background: 'var(--success-soft)'",
    "background: '#fffbeb'": "background: 'var(--warning-soft)'",
    "background: '#1e293b'": "background: 'var(--bg-panel)'",
    "background: '#0f172a'": "background: 'var(--bg-panel)'",
    "backgroundColor: 'white'": "backgroundColor: 'var(--bg-panel)'",
    "backgroundColor: '#ffffff'": "backgroundColor: 'var(--bg-panel)'",

    // Text Colors
    "color: '#0f172a'": "color: 'var(--text-main)'",
    "color: '#1e293b'": "color: 'var(--text-main)'",
    "color: '#334155'": "color: 'var(--text-main)'",
    "color: '#64748b'": "color: 'var(--text-muted)'",
    "color: '#94a3b8'": "color: 'var(--text-light)'",
    "color: '#ef4444'": "color: 'var(--danger)'",
    "color: '#dc2626'": "color: 'var(--danger)'",
    "color: '#10b981'": "color: 'var(--success)'",
    "color: '#166534'": "color: 'var(--success)'",
    "color: '#f59e0b'": "color: 'var(--warning)'",

    // Borders
    "border: '1px solid #e2e8f0'": "border: '1px solid var(--border-subtle)'",
    "border: '1px solid #f1f5f9'": "border: '1px solid var(--border-subtle)'",
    "borderBottom: '1px solid #e2e8f0'": "borderBottom: '1px solid var(--border-subtle)'",
    "borderTop: '1px solid #e2e8f0'": "borderTop: '1px solid var(--border-subtle)'",
    
    // Fills (Icons)
    "fill=\"#0f172a\"": "fill=\"var(--text-main)\"",
    "color=\"#0f172a\"": "color=\"var(--text-main)\"",
    "color=\"#64748b\"": "color=\"var(--text-muted)\""
};

function processDirectory(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const [key, value] of Object.entries(colorMap)) {
                if (content.includes(key)) {
                    // Replace all occurrences
                    content = content.split(key).join(value);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(srcDir);
console.log('Done refactoring theme colors.');
