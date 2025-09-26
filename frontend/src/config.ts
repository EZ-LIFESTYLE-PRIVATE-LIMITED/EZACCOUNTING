import * as path from 'path';
import { app } from 'electron';

// Load environment variables from .env file
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is optional, continue without it
  console.log('dotenv not available, using system environment variables only');
}

export interface AppConfig {
  backendUrl: string;
  databasePath: string;
  databaseName: string;
}

/**
 * Get application configuration from environment variables or defaults
 */
export function getAppConfig(): AppConfig {
  // Backend URL configuration
  const backendUrl = process.env.EZACCOUNTING_BACKEND_URL || 
                     process.env.BACKEND_URL || 
                     'http://localhost:3000';

  // Database configuration
  const databaseName = process.env.EZACCOUNTING_DB_NAME || 
                       process.env.DATABASE_NAME || 
                       'ezaccounting.db';

  // Database path configuration
  let databasePath: string;
  
  if (process.env.EZACCOUNTING_DB_PATH || process.env.DATABASE_PATH) {
    // Use custom database path if provided
    databasePath = process.env.EZACCOUNTING_DB_PATH || process.env.DATABASE_PATH || '';
    if (databasePath && !path.isAbsolute(databasePath)) {
      // If relative path, make it relative to user data directory
      databasePath = path.join(app.getPath('userData'), databasePath);
    }
  } else {
    // Default: store in user data directory
    databasePath = path.join(app.getPath('userData'), databaseName);
  }

  return {
    backendUrl,
    databasePath,
    databaseName
  };
}

/**
 * Get configuration info for display purposes
 */
export function getConfigInfo() {
  const config = getAppConfig();
  return {
    backendUrl: config.backendUrl,
    databasePath: config.databasePath,
    databaseName: config.databaseName,
    userDataPath: app.getPath('userData'),
    isCustomDbPath: !!(process.env.EZACCOUNTING_DB_PATH || process.env.DATABASE_PATH),
    isCustomBackendUrl: !!(process.env.EZACCOUNTING_BACKEND_URL || process.env.BACKEND_URL)
  };
}
