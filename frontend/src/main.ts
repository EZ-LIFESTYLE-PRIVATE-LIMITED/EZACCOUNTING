import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { databaseService } from './database';
import { getAppConfig, getConfigInfo } from './config';

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

// Get configurable backend URL
const config = getAppConfig();
const BACKEND_URL = config.backendUrl;

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
    icon: path.join(__dirname, '../assets/icon.png'), // Optional: add an icon
    titleBarStyle: 'default',
    show: false // Don't show until ready
  });

  // Load the app
  mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open DevTools in development
  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// This method will be called when Electron has finished initialization
app.whenReady().then(async () => {
  // Initialize database
  try {
    await databaseService.initialize();
    await databaseService.createTables();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }

  createWindow();
  createMenu();

  app.on('activate', () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', async () => {
  // Close database connection before quitting
  try {
    await databaseService.close();
  } catch (error) {
    console.error('Error closing database:', error);
  }
  
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Create application menu
function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Handle new file
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
              // Handle file opening
              console.log('Selected file:', result.filePaths[0]);
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
              detail: 'Version 1.0.0\nA simple accounting solution for your business.'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// IPC handlers for communication with renderer process
ipcMain.handle('get-backend-url', () => {
  return config.backendUrl;
});

ipcMain.handle('check-backend-connection', async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    const data = await response.json();
    return { connected: true, data };
  } catch (error) {
    return { connected: false, error: (error as Error).message };
  }
});

// Database IPC handlers
ipcMain.handle('db-insert-test-record', async (event, name: string, value: string) => {
  try {
    const id = await databaseService.insertTestRecord(name, value);
    return { success: true, id };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('db-get-test-records', async () => {
  try {
    const records = await databaseService.getTestRecords();
    return { success: true, records };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('db-get-database-info', async () => {
  try {
    const info = await databaseService.getDatabaseInfo();
    return { success: true, info };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('db-is-connected', () => {
  return databaseService.isConnected();
});

// Configuration IPC handlers
ipcMain.handle('get-config-info', () => {
  return getConfigInfo();
});

export default app;
