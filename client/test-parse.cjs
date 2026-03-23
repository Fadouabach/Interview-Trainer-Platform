const fs = require('fs');
const babel = require('@babel/core');

const file = fs.readFileSync('src/App.jsx', 'utf8');

try {
  babel.transformSync(file, {
    presets: ['@babel/preset-react'],
    filename: 'src/App.jsx',
    ast: false,
  });
  console.log("No syntax errors found!");
} catch (error) {
  console.error(error.message);
  console.log("\nCODE SURROUNDING ERROR:");
  const lines = file.split('\n');
  const errLine = error.loc ? error.loc.line - 1 : 0;
  for (let i = Math.max(0, errLine - 5); i < Math.min(lines.length, errLine + 5); i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
}
