// Configuration type definitions

export interface ConfigInfo {
  backendUrl: string;
  databasePath: string;
  databaseName: string;
  userDataPath: string;
  isCustomDbPath: boolean;
  isCustomBackendUrl: boolean;
}

export interface EnvironmentInfo {
  nodeEnv: string;
  platform: string;
  arch: string;
  version: string;
  variables: {
    EZACCOUNTING_BACKEND_URL?: string;
    EZACCOUNTING_DB_PATH?: string;
    EZACCOUNTING_DB_NAME?: string;
    BACKEND_URL?: string;
    DATABASE_PATH?: string;
    DATABASE_NAME?: string;
  };
}
