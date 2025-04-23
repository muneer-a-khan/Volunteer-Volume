import { PrismaClient } from '@prisma/client';

// Standard Prisma Client initialization
// Reference: https://pris.ly/d/help/next-js-best-practices

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Remove the queryWithRetry function as it depends on the complex setup
// export async function queryWithRetry<T>( ... ) { ... } 

export { prisma }; // Export the simplified client instance

// Remove the default export if it causes issues, or keep if needed elsewhere
// export default prisma;

// Comment out or remove process event listeners and interval pings related to the old setup
// if (process.env.NODE_ENV !== 'production') { ... }
// if (process.env.NODE_ENV === 'production') { ... } 