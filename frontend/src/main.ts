import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { databaseConnection } from './database/connection';
import { PrismaService } from './database/services/PrismaService';
import { getPrismaClient } from './database/prisma-client';
import { getAppConfig } from './config/app';
import { getDatabaseConfig } from './config/database';
import { logger } from './utils/logger';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let prismaService: PrismaService | null = null;
let prismaClient: any = null;

// Get application configuration
const appConfig = getAppConfig();
const databaseConfig = getDatabaseConfig();

/**
 * Check if this is a first-time user
 */
async function checkFirstTimeUser(): Promise<boolean> {
  if (!prismaClient) {
    return true; // If no database, assume first time user
  }
  
  try {
    const businessOrg = await prismaClient.org.findFirst({
      where: { org_type: 'BUSINESS' }
    });
    
    return !businessOrg; // Return true if no business organization exists
  } catch (error) {
    logger.error('Error checking first time user:', error);
    return true; // Assume first time user on error
  }
}

/**
 * Show registration page
 */
async function showRegistrationPage(): Promise<void> {
  if (!mainWindow) return;
  
  try {
    // Load the main HTML file and inject registration flag
    const mainHTMLPath = path.join(__dirname, 'renderer/index.html');
    const registrationURL = `file://${mainHTMLPath}?registration=true`;
    await mainWindow.loadURL(registrationURL);
    logger.info('Registration page loaded');
  } catch (error) {
    logger.error('Error loading registration page:', error);
  }
}

/**
 * Show home page
 */
async function showHomePage(): Promise<void> {
  if (!mainWindow) return;
  
  try {
    // Load the main application
    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));
    logger.info('Home page loaded');
  } catch (error) {
    logger.error('Error loading home page:', error);
  }
}


/**
 * Create the main application window
 */
function createWindow(): void {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', async () => {
    mainWindow?.show();
    logger.info('Main window shown');
    
    // Check if this is a first-time user and show registration if needed
    try {
      const isFirstTime = await checkFirstTimeUser();
      if (isFirstTime) {
        await showRegistrationPage();
      } else {
        await showHomePage();
      }
    } catch (error) {
      logger.error('Error checking first-time user status:', error);
      // Default to home page on error
      await showHomePage();
    }
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
    logger.info('Main window closed');
  });

  // Open DevTools in development
  if (appConfig.environment === 'development' || process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

/**
 * Initialize database and services
 */
async function initializeServices(): Promise<void> {
  try {
    logger.info('Initializing database connection...');
    await databaseConnection.initialize();
    
    // Initialize services
    prismaService = new PrismaService();
    prismaClient = getPrismaClient();
    
    logger.info('Services initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    throw error;
  }
}

/**
 * Cleanup services before app exit
 */
async function cleanupServices(): Promise<void> {
  try {
    logger.info('Cleaning up services...');
    await databaseConnection.close();
    logger.info('Services cleaned up successfully');
  } catch (error) {
    logger.error('Error during cleanup:', error);
  }
}

/**
 * Create application menu
 */
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'New File',
              message: 'New file functionality will be implemented here.'
            });
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow!, {
              properties: ['openFile'],
              filters: [
                { name: 'JSON Files', extensions: ['json'] },
                { name: 'All Files', extensions: ['*'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              logger.info('Selected file:', result.filePaths[0]);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About EZAccounting',
          click: () => {
            dialog.showMessageBox(mainWindow!, {
              type: 'info',
              title: 'About EZAccounting',
              message: 'EZAccounting Desktop Application',
              detail: `Version ${appConfig.version}\nA professional accounting solution for your business.`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

/**
 * Save signature file to user data directory
 */
async function saveSignatureFile(fileData: any): Promise<string> {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    
    // Create signatures directory in user data path
    const signaturesDir = path.join(databaseConfig.userDataPath, 'signatures');
    await fs.mkdir(signaturesDir, { recursive: true });
    
    // Generate unique filename
    const timestamp = Date.now();
    const extension = path.extname(fileData.name);
    const filename = `signature_${timestamp}${extension}`;
    const filePath = path.join(signaturesDir, filename);
    
    // Convert base64 string to buffer and save file
    const buffer = Buffer.from(fileData.data, 'base64');
    await fs.writeFile(filePath, buffer);
    
    logger.info('Signature file saved:', filePath);
    return filePath;
  } catch (error) {
    logger.error('Error saving signature file:', error);
    throw error;
  }
}

/**
 * Setup IPC handlers
 */
function setupIpcHandlers(): void {
  // Backend connection handlers
  ipcMain.handle('get-backend-url', () => {
    return appConfig.backendUrl;
  });

  ipcMain.handle('check-backend-connection', async () => {
    try {
      const response = await fetch(`${appConfig.backendUrl}/health`);
      const data = await response.json();
      return { connected: true, data };
    } catch (error) {
      return { connected: false, error: (error as Error).message };
    }
  });

  // Database handlers
  ipcMain.handle('db-insert-test-record', async (event, name: string, value: string) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      const result = await prismaClient.testTable.create({
        data: {
          name,
          value,
        },
      });
      console.log('Test record inserted with ID:', result.id);
      return { success: true, data: result.id };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('db-get-test-records', async () => {
    if (!prismaClient) {
      console.log('IPC: prismaClient not initialized');
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      console.log('IPC: Calling testService.getTestRecords()');
      const result = await prismaClient.testTable.findMany({
        orderBy: { created_at: 'desc' },
      });
      console.log('Raw database result:', result);
      console.log('Is array?', Array.isArray(result));
      console.log('IPC: Result from testService:', { success: true, data: result });
      return { success: true, data: result };
    } catch (error) {
      console.log('IPC: Error in db-get-test-records:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('db-get-database-info', async () => {
    if (!prismaService) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      const stats = await prismaService.getStatistics();
      return { 
        success: true, 
        data: {
          ...stats,
          connected: true
        }
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('db-is-connected', async () => {
    try {
      if (!prismaClient) {
        return false;
      }
      
      // Test the connection by running a simple query
      await prismaClient.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  });

  // Configuration handlers
  ipcMain.handle('get-config-info', () => {
    return {
      backendUrl: appConfig.backendUrl,
      databasePath: databaseConfig.path,
      databaseName: databaseConfig.name,
      userDataPath: databaseConfig.userDataPath,
      isCustomDbPath: databaseConfig.isCustomPath,
      isCustomBackendUrl: !!(process.env.EZACCOUNTING_BACKEND_URL || process.env.BACKEND_URL)
    };
  });

  // Registration handlers
  ipcMain.handle('check-first-time-user', async () => {
    if (!prismaClient) {
      return true; // If no database, assume first time user
    }
    
    try {
      const businessOrg = await prismaClient.org.findFirst({
        where: { org_type: 'BUSINESS' }
      });
      
      return !businessOrg; // Return true if no business organization exists
    } catch (error) {
      logger.error('Error checking first time user:', error);
      return true; // Assume first time user on error
    }
  });

  ipcMain.handle('save-registration-data', async (event, data) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      // Handle file upload if signature file is provided
      let signatureUrl = null;
      if (data.signatureFile && data.signatureFile.data) {
        signatureUrl = await saveSignatureFile(data.signatureFile);
      }
      
      // Create business organization record
      const orgData = {
        name: data.organizationName,
        user_name: data.userName,
        gstin: data.gstin,
        phone: data.mobileNumber,
        city_state: data.cityState,
        business_address: data.businessAddress,
        invoice_series: data.invoiceSeries || 'INV-',
        signature_url: signatureUrl,
        org_type: 'BUSINESS' as const
      };
      
      const newOrg = await prismaClient.org.create({
        data: orgData
      });
      
      logger.info('Registration data saved successfully:', { orgId: newOrg.org_id });
      return { success: true };
    } catch (error) {
      logger.error('Error saving registration data:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Navigation is now handled directly in the renderer process
  // No need for IPC communication for this
}

// App event handlers
app.whenReady().then(async () => {
  try {
    await initializeServices();
    createWindow();
    createMenu();
    setupIpcHandlers();
    
    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Failed to start application:', error);
    app.quit();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', async () => {
  await cleanupServices();
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

export default app;