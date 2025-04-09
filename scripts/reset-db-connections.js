// Database connection reset script
const { exec } = require('child_process');
require('dotenv').config(); // Load environment variables

console.log('🔄 Attempting to reset database connections...');

// Extract database details from DATABASE_URL
// Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
const dbUrl = process.env.DATABASE_URL || '';
let dbName = 'volunteer_volume'; // Default name

// Try to extract database name from connection string
try {
  if (dbUrl) {
    const matches = dbUrl.match(/\/([^/\?]+)(\?|$)/);
    if (matches && matches[1]) {
      dbName = matches[1];
      console.log(`📊 Detected database: ${dbName}`);
    }
  }
} catch (err) {
  console.log('⚠️ Could not parse DATABASE_URL, using default database name');
}

// Alternative method: Restart the database service
const restartPg = () => {
  console.log('🔄 Attempting to restart PostgreSQL service...');
  
  // Try different restart commands based on platform
  const commands = [
    'brew services restart postgresql', // macOS with Homebrew
    'sudo service postgresql restart',  // Debian/Ubuntu
    'sudo systemctl restart postgresql' // Systems with systemd
  ];
  
  const tryCommand = (index) => {
    if (index >= commands.length) {
      console.log('❌ Could not restart PostgreSQL automatically');
      console.log('📝 Please manually restart your PostgreSQL service');
      return;
    }
    
    exec(commands[index], (error) => {
      if (error) {
        console.log(`Command failed: ${commands[index]}`);
        tryCommand(index + 1);
      } else {
        console.log('✅ PostgreSQL service restarted successfully');
      }
    });
  };
  
  tryCommand(0);
};

// Build PostgreSQL command with connection parameters
const pgCommand = `
PGPASSWORD="${process.env.PGPASSWORD || ''}" psql -U ${process.env.PGUSER || 'postgres'} -d ${dbName} -c "
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = '${dbName}' 
  AND pid <> pg_backend_pid()
  AND state in ('idle', 'idle in transaction', 'idle in transaction (aborted)', 'disabled');"
`;

// Execute the command
exec(pgCommand, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Error terminating database connections:', error.message);
    console.log('⚠️ Trying alternative method...');
    restartPg();
    return;
  }
  
  if (stderr && stderr.trim() !== '') {
    console.log('⚠️ Database connection warning:', stderr);
    restartPg();
    return;
  }
  
  console.log('✅ Database connections reset successfully');
  console.log(stdout);
  
  // Pause briefly to let connections close before starting Next.js
  setTimeout(() => {
    console.log('🚀 Starting Next.js...');
    process.exit(0); // Success exit code
  }, 1000);
}); 