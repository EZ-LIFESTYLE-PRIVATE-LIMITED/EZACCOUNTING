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

  // Registration & Auth API methods
  saveRegistrationData: (data: any) => ipcRenderer.invoke('save-registration-data', data),
  checkFirstTimeUser: () => ipcRenderer.invoke('check-first-time-user'),
  login: (credentials: any) => ipcRenderer.invoke('login', credentials),
  getProfile: () => ipcRenderer.invoke('get-profile'),
  updateProfile: (data: any) => ipcRenderer.invoke('update-profile', data),

  // Invoice API methods
  getInvoices: (filters?: any) => ipcRenderer.invoke('getInvoices', filters),
  getInvoiceById: (id: number) => ipcRenderer.invoke('getInvoiceById', id),
  createInvoice: (invoice: any) => ipcRenderer.invoke('createInvoice', invoice),
  updateInvoice: (id: number, updates: any) => ipcRenderer.invoke('updateInvoice', id, updates),
  deleteInvoice: (id: number) => ipcRenderer.invoke('deleteInvoice', id),

  // Item API methods
  getItems: () => ipcRenderer.invoke('get-items'),
  getItemById: (id: number) => ipcRenderer.invoke('get-item', id),
  createItem: (item: any) => ipcRenderer.invoke('create-item', item),
  updateItem: (id: number, updates: any) => ipcRenderer.invoke('update-item', id, updates),
  deleteItem: (id: number) => ipcRenderer.invoke('delete-item', id),
  searchItems: (query: string) => ipcRenderer.invoke('search-items', query),

  // Vendor (Org) API methods
  getVendors: (type?: string) => ipcRenderer.invoke('get-vendors', type),
  getVendorById: (id: number) => ipcRenderer.invoke('get-vendor', id),
  createVendor: (vendor: any) => ipcRenderer.invoke('create-vendor', vendor),
  updateVendor: (id: number, updates: any) => ipcRenderer.invoke('update-vendor', id, updates),
  deleteVendor: (id: number) => ipcRenderer.invoke('delete-vendor', id),
  searchVendors: (query: string) => ipcRenderer.invoke('search-vendors', query),

  // Purchase API methods
  getPurchases: (filters?: any) => ipcRenderer.invoke('get-purchases', filters),
  getPurchaseById: (id: number) => ipcRenderer.invoke('get-purchase', id),
  createPurchase: (purchase: any) => ipcRenderer.invoke('create-purchase', purchase),
  updatePurchase: (id: number, updates: any) => ipcRenderer.invoke('update-purchase', id, updates),
  deletePurchase: (id: number) => ipcRenderer.invoke('delete-purchase', id),

  // Logout
  logout: () => ipcRenderer.invoke('logout'),

  // File operations
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

  // Registration & Auth API types
  saveRegistrationData: (data: any) => Promise<{ success: boolean; error?: string }>;
  checkFirstTimeUser: () => Promise<boolean>;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  getProfile: () => Promise<{ success: boolean; data?: any; error?: string }>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;

  // Invoice API types
  getInvoices: (filters?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getInvoiceById: (id: number) => Promise<{ success: boolean; data?: any; error?: string }>;
  createInvoice: (invoice: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateInvoice: (id: number, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteInvoice: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Item API types
  getItems: () => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getItemById: (id: number) => Promise<{ success: boolean; data?: any; error?: string }>;
  createItem: (item: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateItem: (id: number, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteItem: (id: number) => Promise<{ success: boolean; error?: string }>;
  searchItems: (query: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;

  // Vendor API types
  getVendors: (type?: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getVendorById: (id: number) => Promise<{ success: boolean; data?: any; error?: string }>;
  createVendor: (vendor: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateVendor: (id: number, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteVendor: (id: number) => Promise<{ success: boolean; error?: string }>;
  searchVendors: (query: string) => Promise<{ success: boolean; data?: any[]; error?: string }>;

  // Purchase API types
  getPurchases: (filters?: any) => Promise<{ success: boolean; data?: any[]; error?: string }>;
  getPurchaseById: (id: number) => Promise<{ success: boolean; data?: any; error?: string }>;
  createPurchase: (purchase: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  updatePurchase: (id: number, updates: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  deletePurchase: (id: number) => Promise<{ success: boolean; error?: string }>;

  // Logout
  logout: () => Promise<{ success: boolean }>;

  // File operations
  openFile: () => Promise<any>;
  saveFile: (data: any) => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
