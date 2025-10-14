import { app } from 'electron';
import { DatabaseConfig, getDatabaseConfig } from './database';
import { AppConfig, getAppConfig } from './app';

// Load environment variables from .env file
try {
  require('dotenv').config();
} catch (error) {
  // dotenv is optional, continue without it
  console.log('dotenv not available, using system environment variables only');
}

export interface Config {
  app: AppConfig;
  database: DatabaseConfig;
}

/**
 * Get complete application configuration
 */
export function getConfig(): Config {
  return {
    app: getAppConfig(),
    database: getDatabaseConfig()
  };
}

/**
 * Get application configuration info for display
 */
export function getConfigInfo() {
  const config = getConfig();
  return {
    backendUrl: config.app.backendUrl,
    databasePath: config.database.path,
    databaseName: config.database.name,
    userDataPath: app.getPath('userData'),
    isCustomDbPath: !!(process.env.EZACCOUNTING_DB_PATH || process.env.DATABASE_PATH),
    isCustomBackendUrl: !!(process.env.EZACCOUNTING_BACKEND_URL || process.env.BACKEND_URL)
  };
}

// Re-export individual configs
export { getAppConfig } from './app';
export { getDatabaseConfig } from './database';
