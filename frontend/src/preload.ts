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
  
  // Registration API methods
  saveRegistrationData: (data: any) => ipcRenderer.invoke('save-registration-data', data),
  checkFirstTimeUser: () => ipcRenderer.invoke('check-first-time-user'),
  
  // Invoice API methods
  getInvoices: (filters?: any) => ipcRenderer.invoke('getInvoices', filters),
  getInvoiceById: (id: string) => ipcRenderer.invoke('getInvoiceById', id),
  createInvoice: (invoice: any) => ipcRenderer.invoke('createInvoice', invoice),
  updateInvoice: (id: string, updates: any) => ipcRenderer.invoke('updateInvoice', id, updates),
  deleteInvoice: (id: string) => ipcRenderer.invoke('deleteInvoice', id),
  
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
  
  // Registration API types
  saveRegistrationData: (data: any) => Promise<{ success: boolean; error?: string }>;
  checkFirstTimeUser: () => Promise<boolean>;
  
  // Invoice API types
  getInvoices: (filters?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getInvoiceById: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  createInvoice: (invoice: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateInvoice: (id: string, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteInvoice: (id: string) => Promise<{ success: boolean; error?: string }>;
  
  openFile: () => Promise<any>;
  saveFile: (data: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}


