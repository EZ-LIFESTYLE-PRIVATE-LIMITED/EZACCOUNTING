import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { databaseConnection } from './database/connection';
import { TestService } from './database/services/TestService';
import { getAppConfig } from './config/app';
import { getDatabaseConfig } from './config/database';
import { logger } from './utils/logger';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;
let testService: TestService | null = null;

// Get application configuration
const appConfig = getAppConfig();
const databaseConfig = getDatabaseConfig();

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
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    logger.info('Main window shown');
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
    testService = new TestService(databaseConnection.getDatabase());
    
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
    if (!testService) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      const result = await testService.insertTestRecord(name, value);
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('db-get-test-records', async () => {
    if (!testService) {
      console.log('IPC: testService not initialized');
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      console.log('IPC: Calling testService.getTestRecords()');
      const result = await testService.getTestRecords();
      console.log('IPC: Result from testService:', result);
      return result;
    } catch (error) {
      console.log('IPC: Error in db-get-test-records:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('db-get-database-info', async () => {
    if (!testService) {
      return { success: false, error: 'Database service not initialized' };
    }
    
    try {
      const result = await testService.getDatabaseInfo();
      return result;
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('db-is-connected', () => {
    return databaseConnection.isConnected();
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