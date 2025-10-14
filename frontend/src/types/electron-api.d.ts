// Type definitions for the Electron API exposed to the renderer process
export interface ElectronAPI {
  getBackendUrl: () => Promise<string>;
  checkBackendConnection: () => Promise<{ connected: boolean; data?: any; error?: string }>;
  
  // Database API types
  dbInsertTestRecord: (name: string, value: string) => Promise<{ success: boolean; id?: number; error?: string }>;
  dbGetTestRecords: () => Promise<{ success: boolean; records?: any[]; error?: string }>;
  dbGetDatabaseInfo: () => Promise<{ success: boolean; info?: any; error?: string }>;
  dbIsConnected: () => Promise<boolean>;
  
  // Configuration API types
  getConfigInfo: () => Promise<{
    backendUrl: string;
    databasePath: string;
    databaseName: string;
    userDataPath: string;
    isCustomDbPath: boolean;
    isCustomBackendUrl: boolean;
  }>;
  
  // Registration API types
  saveRegistrationData: (data: any) => Promise<{ success: boolean; error?: string }>;
  checkFirstTimeUser: () => Promise<boolean>;
  
  openFile: () => Promise<any>;
  saveFile: (data: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
