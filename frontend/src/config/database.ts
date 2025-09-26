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
                       'ezaccounting.db';

  // Database path configuration
  let databasePath: string;
  let isCustomPath = false;
  
  if (process.env.EZACCOUNTING_DB_PATH || process.env.DATABASE_PATH) {
    // Use custom database path if provided
    const customPath = process.env.EZACCOUNTING_DB_PATH || process.env.DATABASE_PATH || '';
    if (customPath) {
      isCustomPath = true;
      if (path.isAbsolute(customPath)) {
        databasePath = path.join(customPath, databaseName);
      } else {
        // If relative path, make it relative to user data directory
        databasePath = path.join(userDataPath, customPath, databaseName);
      }
    } else {
      databasePath = path.join(userDataPath, databaseName);
    }
  } else {
    // Default: store in user data directory
    databasePath = path.join(userDataPath, databaseName);
  }

  return {
    name: databaseName,
    path: databasePath,
    userDataPath,
    isCustomPath
  };
}
