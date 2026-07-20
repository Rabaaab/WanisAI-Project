const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const newContent = content
    .replace(/anthropic/g, 'gemini')
    .replace(/Anthropic/g, 'Gemini');
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.yaml')) {
      replaceInFile(fullPath);
    }
  });
}

walk(path.join(__dirname, 'lib/api-spec'));
walk(path.join(__dirname, 'lib/api-zod/src/generated'));
walk(path.join(__dirname, 'lib/api-client-react/src/generated'));
walk(path.join(__dirname, 'artifacts/wanis-ai/src/pages'));

// We also need to rename generated files that might contain "anthropic" in their filename
function renameFiles(dir) {
  if (!fs.existsSync(dir)) return;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      renameFiles(fullPath);
    } else if (file.toLowerCase().includes('anthropic')) {
      const newName = file.replace(/anthropic/g, 'gemini').replace(/Anthropic/g, 'Gemini');
      fs.renameSync(fullPath, path.join(dir, newName));
      console.log(`Renamed ${fullPath} to ${newName}`);
    }
  });
}

renameFiles(path.join(__dirname, 'lib/api-zod/src/generated'));
renameFiles(path.join(__dirname, 'lib/api-client-react/src/generated'));
