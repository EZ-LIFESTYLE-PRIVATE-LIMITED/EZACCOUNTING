import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  checkBackendConnection: () => ipcRenderer.invoke('check-backend-connection'),
  
  // Database API methods
  dbInsertTestRecord: (name: string, value: string) => ipcRenderer.invoke('db-insert-test-record', name, value),
  dbGetTestRecords: () => ipcRenderer.invoke('db-get-test-records'),
  dbGetDatabaseInfo: () => ipcRenderer.invoke('db-get-database-info'),
  dbIsConnected: () => ipcRenderer.invoke('db-is-connected'),
  
  // Configuration API methods
  getConfigInfo: () => ipcRenderer.invoke('get-config-info'),
  
  // Add more API methods as needed
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data: any) => ipcRenderer.invoke('save-file', data),
});

// Type definitions for the exposed API
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
  
  openFile: () => Promise<any>;
  saveFile: (data: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}


