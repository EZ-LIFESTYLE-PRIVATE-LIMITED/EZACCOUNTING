import * as path from 'path';
import { app } from 'electron';

export interface DatabaseConfig {
  name: string;
  path: string;
  userDataPath: string;
  isCustomPath: boolean;
}

/**
 * Get database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  const userDataPath = app.getPath('userData');
  
  // Database name configuration
  const databaseName = process.env.EZACCOUNTING_DB_NAME || 
                       process.env.DATABASE_NAME || 
                       'dev.db';

  // Database path configuration
  let databasePath: string;
  let isCustomPath = false;
  
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged || process.argv.includes('--dev');

  if (isDev) {
    // In development mode, ONLY use the Prisma folder mapping so it matches the Prisma CLI path explicitly
    databasePath = path.join(process.cwd(), 'prisma', databaseName);
    isCustomPath = true;
  } else {
    // In production mode, always drop the data into OS AppData so it doesn't wipe across updates
    databasePath = path.join(userDataPath, databaseName);
  }

  return {
    name: databaseName,
    path: databasePath,
    userDataPath,
    isCustomPath
  };
}
