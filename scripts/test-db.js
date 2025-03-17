// Simple script to test database connection
const { PrismaClient } = require('@prisma/client');

async function main() {
  console.log('Testing database connection...');
  
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
  
  try {
    // Simple query to test connection
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful!', result);
    
    // List database tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('Available tables:');
    tables.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(success => {
    if (success) {
      console.log('Database connection test completed successfully.');
    } else {
      console.error('Database connection test failed.');
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('Script error:', e);
    process.exit(1);
  }); 