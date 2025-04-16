import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Maximum number of connection attempts
const MAX_ATTEMPTS = 3;

// Set up a more stable Prisma client to prevent prepared statement issues
const prismaClientSingleton = () => {
  // Create new PrismaClient with connection pooling and timeout settings
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    
    // Use datasources to ensure we have correct connection URL
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    
    // Configure better connection handling options
    // See: https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
    errorFormat: 'pretty',
  });
};

// Use type declaration merging to add PrismaClient to global
declare global {
  var prisma: ReturnType<typeof prismaClientSingleton> | undefined;
}

// Create or reuse the Prisma client
export const prisma = global.prisma ?? prismaClientSingleton();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Helper function to execute a query with retry logic
export async function queryWithRetry<T>(
  queryFn: () => Promise<T>,
  attempts = MAX_ATTEMPTS
): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    // Check if the error is related to a prepared statement or connection issue
    if (
      (error.message && error.message.includes('prepared statement')) ||
      (error.message && error.message.includes('connection')) ||
      (error.code && error.code === '26000')
    ) {
      if (attempts <= 1) {
        throw error;
      }
      
      console.error(`Database query failed (attempts left: ${attempts - 1}):`, error.message);
      
      // Attempt to reset the connection
      try {
        await prisma.$disconnect();
        await new Promise(resolve => setTimeout(resolve, 500)); // Short delay
      } catch (disconnectError) {
        console.error('Error while disconnecting:', disconnectError);
      }
      
      // Retry the query with one less attempt
      return queryWithRetry(queryFn, attempts - 1);
    }
    
    // For other errors, just throw
    throw error;
  }
}

// Attempt to flush connections before exiting
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Setup a ping interval to keep connections alive
if (typeof window === 'undefined') { // Only run on server
  const PING_INTERVAL = 4 * 60 * 1000; // 4 minutes
  setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.error('Database ping failed:', error);
    }
  }, PING_INTERVAL);
}

export default prisma; 