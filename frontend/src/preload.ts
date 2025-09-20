import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getBackendUrl: () => ipcRenderer.invoke('get-backend-url'),
  checkBackendConnection: () => ipcRenderer.invoke('check-backend-connection'),
  
  // Add more API methods as needed
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data: any) => ipcRenderer.invoke('save-file', data),
});

// Type definitions for the exposed API
export interface ElectronAPI {
  getBackendUrl: () => Promise<string>;
  checkBackendConnection: () => Promise<{ connected: boolean; data?: any; error?: string }>;
  openFile: () => Promise<any>;
  saveFile: (data: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}


