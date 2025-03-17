// Script to fix duplicate import issues
const fs = require('fs');
const path = require('path');

// Find all TypeScript and JavaScript files in src/pages/api directory
const apiDir = path.join(__dirname, 'src', 'pages', 'api');
const files = [];

function findFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      files.push(fullPath);
    }
  }
}

findFiles(apiDir);

// Process each file
let updatedFilesCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Fix duplicate imports
  if (content.includes("import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils'; from '@/lib/prisma';")) {
    content = content.replace(
      "import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils'; from '@/lib/prisma';",
      "import { mapSnakeToCamel, mapCamelToSnake } from '@/lib/map-utils';"
    );
  }
  
  // Fix relative imports to use absolute paths
  if (content.includes("import { authOptions } from '../auth/[...nextauth]'")) {
    content = content.replace(
      "import { authOptions } from '../auth/[...nextauth]'",
      "import { authOptions } from '@/pages/api/auth/[...nextauth]'"
    );
  }
  
  if (content.includes("import { authOptions } from '../../auth/[...nextauth]'")) {
    content = content.replace(
      "import { authOptions } from '../../auth/[...nextauth]'",
      "import { authOptions } from '@/pages/api/auth/[...nextauth]'"
    );
  }
  
  // Add proper mapping for responses
  if (content.includes("return res.status(") && 
      !content.includes("mapSnakeToCamel") && 
      content.includes("await prisma.")) {
    
    // For simple returns like: return res.status(200).json(data);
    content = content.replace(
      /return res\.status\(\d+\)\.json\(\s*([a-zA-Z0-9_]+)\s*\);/g,
      (match, p1) => {
        if (p1 === 'null' || p1 === 'undefined' || p1.startsWith('{')) {
          return match;
        }
        return `return res.status(200).json(mapSnakeToCamel(${p1}));`;
      }
    );
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFilesCount++;
    console.log(`Fixed imports in: ${file}`);
  }
});

console.log(`Updated ${updatedFilesCount} files.`);
console.log('Remember to manually review any complex or nested data structures that might need additional mapping.'); 