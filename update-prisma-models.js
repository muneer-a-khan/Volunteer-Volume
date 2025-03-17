// Script to update Prisma model references
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Map of old model names to new model names
const modelMap = {
  'prisma.user': 'prisma.users',
  'prisma.User': 'prisma.users',
  'prisma.shift': 'prisma.shifts',
  'prisma.Shift': 'prisma.shifts',
  'prisma.profile': 'prisma.profiles',
  'prisma.Profile': 'prisma.profiles',
  'prisma.checkIn': 'prisma.check_ins',
  'prisma.CheckIn': 'prisma.check_ins',
  'prisma.volunteerLog': 'prisma.volunteer_logs',
  'prisma.VolunteerLog': 'prisma.volunteer_logs',
  'prisma.group': 'prisma.groups',
  'prisma.Group': 'prisma.groups',
  'prisma.application': 'prisma.applications',
  'prisma.Application': 'prisma.applications',
  'prisma.userGroup': 'prisma.user_groups',
  'prisma.UserGroup': 'prisma.user_groups',
  'prisma.notification': 'prisma.notifications',
  'prisma.Notification': 'prisma.notifications',
  'prisma.groupMember': 'prisma.group_admins',  // This one might need review
  'prisma.GroupMember': 'prisma.group_admins',  // This one might need review
  'prisma.verificationToken': 'prisma.verification_tokens',
  'prisma.VerificationToken': 'prisma.verification_tokens',
  'prisma.account': 'prisma.accounts',
  'prisma.Account': 'prisma.accounts',
  'prisma.session': 'prisma.sessions',
  'prisma.Session': 'prisma.sessions'
};

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
  'providerAccountId': 'provider_account_id'
};

// Find all TypeScript and JavaScript files in src directory
const srcDir = path.join(__dirname, 'src');
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

findFiles(srcDir);

// Process each file
let updatedFilesCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  let updated = false;
  
  // Replace model names
  for (const [oldModel, newModel] of Object.entries(modelMap)) {
    if (content.includes(oldModel)) {
      content = content.replace(new RegExp(oldModel, 'g'), newModel);
      updated = true;
    }
  }
  
  // Replace field names (being careful with these as they might appear in other contexts)
  for (const [camelCase, snakeCase] of Object.entries(fieldNameMap)) {
    // Only replace in contexts that look like prisma queries or data objects
    // This regex looks for the camelCase field in various prisma-specific contexts
    const regex = new RegExp(`(where: {[^}]*${camelCase}|data: {[^}]*${camelCase}|orderBy: {[^}]*${camelCase}|select: {[^}]*${camelCase}|include: {[^}]*${camelCase})`, 'g');
    
    if (regex.test(content)) {
      // Replace only in appropriate contexts (after 'where:', 'data:', etc.)
      content = content.replace(regex, (match) => {
        return match.replace(new RegExp(camelCase, 'g'), snakeCase);
      });
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(file, content, 'utf8');
    updatedFilesCount++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Updated ${updatedFilesCount} files.`);
console.log('Remember to manually review the changes, especially for field names that might need context-specific handling.'); 