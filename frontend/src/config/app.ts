export interface AppConfig {
  backendUrl: string;
  appName: string;
  version: string;
  environment: 'development' | 'production' | 'test';
}

/**
 * Get application configuration
 */
export function getAppConfig(): AppConfig {
  return {
    backendUrl: process.env.EZACCOUNTING_BACKEND_URL || 
                process.env.BACKEND_URL || 
                'http://localhost:3000',
    appName: 'EZAccounting',
    version: '1.0.0',
    environment: (process.env.NODE_ENV as any) || 'development'
  };
}
