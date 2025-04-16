#!/usr/bin/env node

/**
 * This script explicitly disconnects and reinitializes the Prisma client
 * to fix connection issues like "prepared statement does not exist" errors.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetConnections() {
  try {
    console.log('🔄 Resetting Prisma database connections...');

    // Execute a simple query to test the connection
    console.log('🔍 Testing initial connection...');
    try {
      await prisma.$queryRaw`SELECT 1 AS test`;
      console.log('✅ Initial connection is working');
    } catch (error) {
      console.log('❌ Initial connection failed:', error.message);
    }

    // Explicitly disconnect
    console.log('🔌 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');

    // Small delay to ensure connection is fully closed
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reconnect and test
    console.log('🔌 Reconnecting to database...');
    try {
      await prisma.$queryRaw`SELECT 1 AS test`;
      console.log('✅ Reconnection successful');
    } catch (error) {
      console.error('❌ Reconnection failed:', error.message);
      process.exit(1);
    }

    console.log('🎉 Database connections reset successfully');
  } catch (error) {
    console.error('❌ Error resetting connections:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetConnections(); 