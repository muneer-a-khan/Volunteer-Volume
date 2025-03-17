// Script to add @map directives and mapping functions for field names
const fs = require('fs');
const path = require('path');

// Field name map for snake_case conversion
const fieldNameMap = {
  'userId': 'user_id',
  'groupId': 'group_id',
  'shiftId': 'shift_id',
  'startTime': 'start_time',
  'endTime': 'end_time',
  'emailVerified': 'email_verified',
  'googleCalendarEventId': 'google_calendar_event_id',
  'checkInTime': 'check_in_time',
  'checkOutTime': 'check_out_time',
  'zipCode': 'zip_code',
  'createdAt': 'created_at',
  'updatedAt': 'updated_at',
  'approvedBy': 'approved_by',
  'approvedAt': 'approved_at',
  'rejectedBy': 'rejected_by',
  'rejectedAt': 'rejected_at',
  'sessionToken': 'session_token',
  'providerAccountId': 'provider_account_id',
  // Add any other field mappings here
};

// Create utility functions for mapping objects
const mapUtilsPath = path.join(__dirname, 'src', 'lib', 'map-utils.ts');

const mapUtilsContent = `
// Utility functions for mapping between camelCase and snake_case objects
// For use with the Prisma models that use snake_case fields

// Map from Prisma snake_case to application camelCase
export function mapSnakeToCamel(data: any): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(mapSnakeToCamel);
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Handle nested objects/arrays
      const newValue = typeof value === 'object' && value !== null ? mapSnakeToCamel(value) : value;
      
      // Map snake_case to camelCase
      const newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[newKey] = newValue;
    }
    
    return result;
  }
  
  return data;
}

// Map from application camelCase to Prisma snake_case
export function mapCamelToSnake(data: any): any {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(mapCamelToSnake);
  }
  
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(data)) {
      // Handle nested objects/arrays
      const newValue = typeof value === 'object' && value !== null ? mapCamelToSnake(value) : value;
      
      // Map camelCase to snake_case
      const newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[newKey] = newValue;
    }
    
    return result;
  }
  
  return data;
}

// Field mapping for specific known fields
export const fieldMap = ${JSON.stringify(fieldNameMap, null, 2)};

// Inverse mapping (snake_case to camelCase)
export const inverseFieldMap = Object.entries(fieldMap).reduce(
  (acc, [camel, snake]) => {
    acc[snake] = camel;
    return acc;
  },
  {} as Record<string, string>
);
`;

// Write the utils file
fs.writeFileSync(mapUtilsPath, mapUtilsContent, 'utf8');
console.log(`Created mapping utility file at: ${mapUtilsPath}`);

// Find API files that need to use the mapping utilities
const apiDir = path.join(__dirname, 'src', 'pages', 'api');
const apiFiles = [];

function findApiFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      findApiFiles(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      apiFiles.push(fullPath);
    }
  }
}

findApiFiles(apiDir);

// Process each API file to add mapping where needed
let updatedFilesCount = 0;

apiFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const originalContent = content;
  
  // Check if this file interacts with prisma and needs mapping
  if (content.includes('prisma.') && !content.includes('import { mapSnakeToCamel, mapCamelToSnake }')) {
    // Add import for mapping utilities
    if (content.includes('import { prisma }')) {
      content = content.replace(
        'import { prisma }',
        'import { prisma } from \'@/lib/prisma\';\nimport { mapSnakeToCamel, mapCamelToSnake } from \'@/lib/map-utils\';'
      );
    } else if (content.includes('import prisma')) {
      content = content.replace(
        'import prisma',
        'import prisma from \'@/lib/prisma\';\nimport { mapSnakeToCamel, mapCamelToSnake } from \'@/lib/map-utils\';'
      );
    }
    
    // Add mapping for response objects
    if (content.includes('res.status') && content.includes('json(')) {
      // This is just a heuristic - we need to be careful here
      content = content.replace(
        /res\.status\(\d+\)\.json\(\s*({[^}]*}|[a-zA-Z0-9_]+)\s*\)/g,
        (match, p1) => {
          // If it's just a variable name, wrap it in mapSnakeToCamel
          if (!/^{/.test(p1.trim())) {
            return `res.status(200).json(mapSnakeToCamel(${p1.trim()}))`;
          }
          // Otherwise it's an object literal, leave it alone for now
          return match;
        }
      );
      
      // For multi-line responses, more complex pattern
      content = content.replace(
        /(return\s+res\.status\(\d+\)\.json\([\s\S]*?)(\);)/g,
        (match, prefix, suffix) => {
          // If it includes a database query result, add mapping
          if (/await prisma/.test(prefix)) {
            // Insert mapSnakeToCamel before the closing parenthesis
            return `${prefix.trim()}\n    // Map snake_case fields to camelCase\n    .then(result => mapSnakeToCamel(result))${suffix}`;
          }
          return match;
        }
      );
    }
    
    // If the file seems updated, write it back
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8');
      updatedFilesCount++;
      console.log(`Updated API file with mapping utilities: ${file}`);
    }
  }
});

console.log(`\nCreated mapping utility file and updated ${updatedFilesCount} API files.`);
console.log(`
IMPORTANT: Manual Review Needed
===============================
1. Review API endpoints to ensure proper mapping between snake_case and camelCase
2. Update frontend components to expect camelCase but send snake_case
3. For complex objects or nested data, you may need to add explicit mapping
4. Remember that direct model access needs snake_case, but your application logic may expect camelCase
`); 