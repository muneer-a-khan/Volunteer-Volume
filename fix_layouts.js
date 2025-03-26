const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Get list of files that contain ShadcnLayout
exec('find src/app -type f -name "*.tsx" -exec grep -l "<ShadcnLayout" {} \\;', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  
  const files = stdout.trim().split('\n');
  console.log(`Found ${files.length} files with ShadcnLayout.`);
  
  files.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove import statement
    content = content.replace(/import\s+ShadcnLayout\s+from\s+['"]@\/components\/layout\/ShadcnLayout['"];?/g, '');
    
    // Replace ShadcnLayout opening tag with fragment
    content = content.replace(/<ShadcnLayout[^>]*>/g, '');
    
    // Replace ShadcnLayout closing tag with nothing
    content = content.replace(/<\/ShadcnLayout>/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  });
  
  console.log('All files have been updated!');
}); 