import { getConfigInfo } from '../config';

export class ConfigService {
  /**
   * Get configuration information
   */
  public getConfigInfo() {
    return getConfigInfo();
  }

  /**
   * Get environment variable information
   */
  public getEnvironmentInfo() {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      arch: process.arch,
      version: process.version,
      variables: {
        EZACCOUNTING_BACKEND_URL: process.env.EZACCOUNTING_BACKEND_URL,
        EZACCOUNTING_DB_PATH: process.env.EZACCOUNTING_DB_PATH,
        EZACCOUNTING_DB_NAME: process.env.EZACCOUNTING_DB_NAME,
        BACKEND_URL: process.env.BACKEND_URL,
        DATABASE_PATH: process.env.DATABASE_PATH,
        DATABASE_NAME: process.env.DATABASE_NAME
      }
    };
  }

  /**
   * Get usage examples for configuration
   */
  public getUsageExamples() {
    return {
      windows: {
        commandPrompt: 'set EZACCOUNTING_BACKEND_URL=http://your-backend:3000 && EZAccounting.exe',
        powershell: '$env:EZACCOUNTING_BACKEND_URL="http://your-backend:3000"; .\\EZAccounting.exe',
        batchFile: 'run-custom.bat'
      },
      linux: {
        terminal: 'EZACCOUNTING_BACKEND_URL=http://your-backend:3000 ./EZAccounting',
        bash: 'export EZACCOUNTING_BACKEND_URL=http://your-backend:3000 && ./EZAccounting'
      },
      mac: {
        terminal: 'EZACCOUNTING_BACKEND_URL=http://your-backend:3000 ./EZAccounting.app',
        bash: 'export EZACCOUNTING_BACKEND_URL=http://your-backend:3000 && ./EZAccounting.app'
      }
    };
  }
}
