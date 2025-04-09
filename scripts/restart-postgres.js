// Simple PostgreSQL restart script
const { execSync } = require('child_process');

console.log('🔄 Restarting PostgreSQL service...');

try {
  // Try Homebrew service restart (common on macOS)
  console.log('Trying: brew services restart postgresql');
  execSync('brew services restart postgresql', { stdio: 'inherit' });
  console.log('✅ PostgreSQL service restarted successfully via Homebrew');
} catch (error) {
  try {
    // Try PostgreSQL 15 service restart (if specified version is installed)
    console.log('Trying: brew services restart postgresql@15');
    execSync('brew services restart postgresql@15', { stdio: 'inherit' });
    console.log('✅ PostgreSQL 15 service restarted successfully via Homebrew');
  } catch (error) {
    try {
      // Try PostgreSQL 14 service restart (if specified version is installed)
      console.log('Trying: brew services restart postgresql@14');
      execSync('brew services restart postgresql@14', { stdio: 'inherit' });
      console.log('✅ PostgreSQL 14 service restarted successfully via Homebrew');
    } catch (error) {
      console.log('❌ Failed to restart PostgreSQL service automatically');
      console.log('📝 Please try restarting PostgreSQL manually');
      console.log('   For macOS with Homebrew: brew services restart postgresql');
      console.log('   For Ubuntu/Debian: sudo service postgresql restart');
      console.log('   For systemd: sudo systemctl restart postgresql');
      process.exit(1);
    }
  }
}

console.log('🚀 PostgreSQL restart completed');
process.exit(0); 