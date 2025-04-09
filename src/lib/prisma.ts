import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

// Set up a more stable Prisma client to prevent prepared statement issues
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    // Use datasources to ensure we have correct connection URL
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    }
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

// Attempt to flush connections before exiting
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 