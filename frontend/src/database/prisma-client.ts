import { PrismaClient } from '../generated/prisma';
import * as path from 'path';
import { execSync } from 'child_process';

// Global Prisma client instance
let prisma: PrismaClient;

/**
 * Get or create Prisma client instance
 * Uses singleton pattern to ensure single connection
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    // Set the database URL explicitly
    const databasePath = path.join(process.cwd(), 'prisma', 'dev.db');
    process.env.DATABASE_URL = `file:${databasePath}`;
    
    // Run Prisma migrations automatically
    try {
      console.log('Running Prisma migrations...');
      execSync('npx prisma db push --schema=./prisma/schema.prisma', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('Prisma migrations completed successfully');
    } catch (error) {
      console.error('Error running Prisma migrations:', error);
      // Continue anyway - Prisma client might still work
    }
    
    prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      errorFormat: 'pretty',
    });
  }
  return prisma;
}

/**
 * Disconnect Prisma client
 * Call this when shutting down the application
 */
export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

/**
 * Initialize Prisma client with database connection
 */
export async function initializePrisma(): Promise<void> {
  const client = getPrismaClient();
  
  try {
    // Test connection
    await client.$connect();
    console.log('✅ Prisma client connected successfully');
  } catch (error) {
    console.error('❌ Failed to connect Prisma client:', error);
    throw error;
  }
}

// Export the client instance
export { prisma };
