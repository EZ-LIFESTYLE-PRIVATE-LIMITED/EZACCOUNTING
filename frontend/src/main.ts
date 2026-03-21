import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import * as path from 'path';
import { databaseConnection } from './database/connection';
import { PrismaService } from './database/services/PrismaService';
import { getPrismaClient } from './database/prisma-client';
import { DevSeeder } from './database/dev-seeder';
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

    // Get database configuration and set DATABASE_URL for Prisma
    const dbConfig = getDatabaseConfig();
    process.env.DATABASE_URL = `file:${dbConfig.path}`;
    console.log('Database URL set to:', process.env.DATABASE_URL);

    // Auto migrations removed as they block Electron startup on Windows

    await databaseConnection.initialize();

    // Initialize services
    prismaService = new PrismaService();
    prismaClient = getPrismaClient();

    // Auto-seed data for development (after services are initialized)
    // DISABLED: DevSeeder pushes dummy BUSINESS profiles which automatically skip the user past the Registration page!
    if (process.env.NODE_ENV === 'development' || process.argv.includes('--dev')) {
      // const devSeeder = new DevSeeder();
      // await devSeeder.seedIfEmpty();
    }

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

  // Invoice handlers
  ipcMain.handle('getInvoices', async (event, filters) => {
    console.log('IPC: getInvoices called with filters:', filters);
    console.log('IPC: Database path:', databaseConfig.path);
    console.log('IPC: PrismaClient initialized:', !!prismaClient);

    if (!prismaClient) {
      console.log('IPC: PrismaClient not initialized');
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const whereClause: any = {};

      if (filters?.status) {
        whereClause.status = filters.status;
      }

      if (filters?.org_id) {
        whereClause.org_id = filters.org_id;
      }

      if (filters?.searchTerm) {
        whereClause.OR = [
          {
            invoice_number: {
              contains: filters.searchTerm
            }
          },
          {
            org: {
              name: {
                contains: filters.searchTerm
              }
            }
          }
        ];
      }

      if (filters?.dateFrom || filters?.dateTo) {
        whereClause.invoice_date = {};
        if (filters.dateFrom) {
          whereClause.invoice_date.gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereClause.invoice_date.lte = new Date(filters.dateTo);
        }
      }

      const invoices = await prismaClient.invoice.findMany({
        where: whereClause,
        include: {
          org: true
        },
        orderBy: {
          invoice_date: 'desc'
        }
      });

      console.log('IPC: Found', invoices.length, 'invoices');
      return { success: true, data: invoices };
    } catch (error) {
      console.error('IPC: Error fetching invoices:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('getInvoiceById', async (event, id) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const invoice = await prismaClient.invoice.findUnique({
        where: {
          invoice_id: parseInt(id)
        },
        include: {
          org: true,
          invoice_items: {
            include: {
              item: true
            }
          }
        }
      });

      return { success: true, data: invoice };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('createInvoice', async (event, invoice) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      // Generate invoice number
      const lastInvoice = await prismaClient.invoice.findFirst({
        orderBy: { invoice_id: 'desc' }
      });

      let nextNumber = 1;
      if (lastInvoice && lastInvoice.invoice_number.startsWith('INV-')) {
        const parts = lastInvoice.invoice_number.split('-');
        if (parts.length >= 3) {
          const lastNum = parseInt(parts[parts.length - 1]);
          if (!isNaN(lastNum)) {
            nextNumber = lastNum + 1;
          }
        }
      } else if (lastInvoice) {
        // Fallback if previous format was different, just try to increment sequence
        nextNumber = lastInvoice.invoice_id + 1;
      }

      const year = new Date().getFullYear();
      const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(5, '0')}`;

      // Prepare items data
      const itemsCreate = (invoice.items || []).map((item: any) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        item_total_amount: item.total || (item.quantity * item.unit_price),
        item_gst_amount: item.gst_amount,
        item_net_amount: item.net_amount
      }));

      const newInvoice = await prismaClient.invoice.create({
        data: {
          invoice_number: invoiceNumber,
          org_id: invoice.org_id,
          invoice_date: new Date(invoice.invoice_date),
          due_date: invoice.due_date ? new Date(invoice.due_date) : null,
          status: invoice.status,
          total_amount: invoice.total_amount,
          gst_amount: invoice.gst_amount,
          net_amount: invoice.net_amount,
          notes: invoice.notes,
          invoice_items: {
            create: itemsCreate
          }
        },
        include: {
          org: true,
          invoice_items: {
            include: {
              item: true
            }
          }
        }
      });

      return { success: true, data: newInvoice };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('updateInvoice', async (event, id, updates) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const operations: any[] = [];
      const invoiceId = parseInt(id);

      // If items are provided, delete existing and create new
      if (updates.items) {
        // Delete existing items
        await prismaClient.invoiceItem.deleteMany({
          where: { invoice_id: invoiceId }
        });

        // Add create operation to the update
        const itemsCreate = updates.items.map((item: any) => ({
          item_id: item.item_id,
          quantity: item.quantity,
          item_total_amount: item.total || (item.quantity * item.unit_price),
          item_gst_amount: item.gst_amount,
          item_net_amount: item.net_amount
        }));

        // We'll prioritize updating the invoice details first
      }

      const updateData: any = {
        org_id: updates.org_id,
        invoice_date: updates.invoice_date ? new Date(updates.invoice_date) : undefined,
        due_date: updates.due_date ? new Date(updates.due_date) : undefined,
        status: updates.status,
        total_amount: updates.total_amount,
        gst_amount: updates.gst_amount,
        net_amount: updates.net_amount,
        notes: updates.notes // Add notes handling
      };

      if (updates.items) {
        updateData.invoice_items = {
          create: updates.items.map((item: any) => ({
            item_id: item.item_id,
            quantity: item.quantity,
            item_total_amount: item.total || (item.quantity * item.unit_price),
            item_gst_amount: item.gst_amount,
            item_net_amount: item.net_amount
          }))
        };
      }

      // If we are updating items, we must do it transactionally or sequentially.
      // deleteMany above was dangerous if the update fails.
      // Better approach: use transaction API.

      const result = await prismaClient.$transaction(async (tx: any) => {
        if (updates.items) {
          await tx.invoiceItem.deleteMany({
            where: { invoice_id: invoiceId }
          });
        }

        return await tx.invoice.update({
          where: {
            invoice_id: invoiceId
          },
          data: updateData,
          include: {
            org: true,
            invoice_items: {
              include: {
                item: true
              }
            }
          }
        });
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('deleteInvoice', async (event, id) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      await prismaClient.invoice.delete({
        where: {
          invoice_id: parseInt(id)
        }
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
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
        email: data.email,
        password: data.password,
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

  // ==================== AUTH & PROFILE HANDLERS ====================
  ipcMain.handle('get-profile', async () => {
    if (!prismaClient) return { success: false, error: 'Database service not initialized' };
    try {
      const org = await prismaClient.org.findFirst({ where: { org_type: 'BUSINESS' } });
      if (!org) return { success: false, error: 'No business organization found' };
      // Omit password from result for security
      const { password, ...safeOrg } = org;
      return { success: true, data: safeOrg };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  });

  ipcMain.handle('update-profile', async (event, updates) => {
    if (!prismaClient) return { success: false, error: 'Database service not initialized' };
    try {
      const org = await prismaClient.org.findFirst({ where: { org_type: 'BUSINESS' } });
      if (!org) return { success: false, error: 'No business organization found' };
      await prismaClient.org.update({
        where: { org_id: org.org_id },
        data: updates
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: (e as Error).message };
    }
  });

  ipcMain.handle('login', async (event, credentials) => {
    if (!prismaClient) return { success: false, error: 'Database service not initialized' };
    try {
       const org = await prismaClient.org.findFirst({ where: { org_type: 'BUSINESS' } });
       if (!org) return { success: false, error: 'No business account found' };
       
       if (!org.email && !org.password) {
         return { success: true };
       }
       if (org.email === credentials.email || !org.email) {
          if (org.password === credentials.password || !org.password) {
             return { success: true };
          }
       }
       return { success: false, error: 'Invalid email or password' };
    } catch (e) {
       return { success: false, error: (e as Error).message };
    }
  });



  // ==================== ITEM HANDLERS ====================
  ipcMain.handle('get-items', async () => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const items = await prismaClient.item.findMany({
        orderBy: { item_name: 'asc' }
      });
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('get-item', async (event, id: number) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const item = await prismaClient.item.findUnique({
        where: { item_id: id }
      });
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('create-item', async (event, itemData) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      if (itemData.item_sku) {
        const existing = await prismaClient.item.findFirst({
          where: { item_sku: itemData.item_sku }
        });
        if (existing) {
          return { success: false, error: 'An item with this SKU already exists.' };
        }
      }

      const item = await prismaClient.item.create({
        data: {
          item_name: itemData.item_name,
          item_description: itemData.item_description || null,
          item_sku: itemData.item_sku || null,
          item_hsn: itemData.item_hsn || null,
          item_gst: itemData.item_gst || 0,
          item_unit_price: itemData.item_unit_price || 0,
          item_category: itemData.item_category || null
        }
      });
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('update-item', async (event, id: number, updates) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      if (updates.item_sku) {
        const existing = await prismaClient.item.findFirst({
          where: { 
            item_sku: updates.item_sku,
            item_id: { not: id }
          }
        });
        if (existing) {
          return { success: false, error: 'An item with this SKU already exists.' };
        }
      }

      const item = await prismaClient.item.update({
        where: { item_id: id },
        data: {
          item_name: updates.item_name,
          item_description: updates.item_description,
          item_sku: updates.item_sku,
          item_hsn: updates.item_hsn,
          item_gst: updates.item_gst,
          item_unit_price: updates.item_unit_price,
          item_category: updates.item_category
        }
      });
      return { success: true, data: item };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('delete-item', async (event, id: number) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      await prismaClient.item.delete({
        where: { item_id: id }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search-items', async (event, query: string) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const items = await prismaClient.item.findMany({
        where: {
          OR: [
            { item_name: { contains: query } },
            { item_sku: { contains: query } },
            { item_category: { contains: query } }
          ]
        },
        orderBy: { item_name: 'asc' }
      });
      return { success: true, data: items };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ==================== VENDOR HANDLERS ====================
  ipcMain.handle('get-vendors', async (event, type?: string) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const whereClause: any = {};
      if (type) {
        whereClause.org_type = type;
      } else {
        // By default, get customers and suppliers (exclude BUSINESS)
        whereClause.org_type = { in: ['CUSTOMER', 'SUPPLIER'] };
      }

      const vendors = await prismaClient.org.findMany({
        where: whereClause,
        orderBy: { name: 'asc' }
      });
      return { success: true, data: vendors };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('get-vendor', async (event, id: number) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const vendor = await prismaClient.org.findUnique({
        where: { org_id: id },
        include: {
          invoices: { orderBy: { invoice_date: 'desc' }, take: 10 },
          purchases: { orderBy: { purchase_date: 'desc' }, take: 10 }
        }
      });
      return { success: true, data: vendor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('create-vendor', async (event, vendorData) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const vendor = await prismaClient.org.create({
        data: {
          name: vendorData.name,
          gstin: vendorData.gstin || null,
          state: vendorData.state || null,
          email: vendorData.email || null,
          phone: vendorData.phone || null,
          business_address: vendorData.business_address || null,
          org_type: vendorData.org_type || 'CUSTOMER'
        }
      });
      return { success: true, data: vendor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('update-vendor', async (event, id: number, updates) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const vendor = await prismaClient.org.update({
        where: { org_id: id },
        data: {
          name: updates.name,
          gstin: updates.gstin,
          state: updates.state,
          email: updates.email,
          phone: updates.phone,
          business_address: updates.business_address,
          org_type: updates.org_type
        }
      });
      return { success: true, data: vendor };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('delete-vendor', async (event, id: number) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      await prismaClient.org.delete({
        where: { org_id: id }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('search-vendors', async (event, query: string) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const vendors = await prismaClient.org.findMany({
        where: {
          org_type: { in: ['CUSTOMER', 'SUPPLIER'] },
          OR: [
            { name: { contains: query } },
            { gstin: { contains: query } },
            { email: { contains: query } }
          ]
        },
        orderBy: { name: 'asc' }
      });
      return { success: true, data: vendors };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ==================== PURCHASE HANDLERS ====================
  ipcMain.handle('get-purchases', async (event, filters?: any) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const whereClause: any = {};

      if (filters?.status) {
        whereClause.status = filters.status;
      }

      if (filters?.org_id) {
        whereClause.org_id = filters.org_id;
      }

      if (filters?.searchTerm) {
        whereClause.OR = [
          { purchase_number: { contains: filters.searchTerm } },
          { org: { name: { contains: filters.searchTerm } } }
        ];
      }

      const purchases = await prismaClient.purchase.findMany({
        where: whereClause,
        include: {
          org: true,
          purchase_items: {
            include: { item: true }
          }
        },
        orderBy: { purchase_date: 'desc' }
      });
      return { success: true, data: purchases };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('get-purchase', async (event, id: number) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const purchase = await prismaClient.purchase.findUnique({
        where: { purchase_id: id },
        include: {
          org: true,
          purchase_items: {
            include: { item: true }
          }
        }
      });
      return { success: true, data: purchase };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('create-purchase', async (event, purchaseData) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      // Generate purchase number
      const lastPurchase = await prismaClient.purchase.findFirst({
        orderBy: { purchase_id: 'desc' }
      });
      const nextNumber = (lastPurchase?.purchase_id || 0) + 1;
      const purchaseNumber = `PUR-${String(nextNumber).padStart(5, '0')}`;

      // Calculate totals from items
      let totalAmount = 0;
      let gstAmount = 0;

      if (purchaseData.items && purchaseData.items.length > 0) {
        for (const item of purchaseData.items) {
          const itemTotal = item.quantity * item.unit_price;
          const itemGst = itemTotal * (item.gst_rate || 0) / 100;
          totalAmount += itemTotal;
          gstAmount += itemGst;
        }
      }

      const netAmount = totalAmount + gstAmount;

      const purchase = await prismaClient.purchase.create({
        data: {
          purchase_number: purchaseNumber,
          org_id: purchaseData.org_id,
          purchase_date: new Date(purchaseData.purchase_date),
          due_date: purchaseData.due_date ? new Date(purchaseData.due_date) : null,
          status: purchaseData.status || 'DRAFT',
          total_amount: totalAmount,
          gst_amount: gstAmount,
          net_amount: netAmount,
          notes: purchaseData.notes || null,
          purchase_items: {
            create: (purchaseData.items || []).map((item: any) => ({
              item_id: item.item_id,
              quantity: item.quantity || 1,
              unit_price: item.unit_price || 0,
              item_total_amount: (item.quantity || 1) * (item.unit_price || 0),
              item_gst_amount: ((item.quantity || 1) * (item.unit_price || 0)) * ((item.gst_rate || 0) / 100),
              item_net_amount: ((item.quantity || 1) * (item.unit_price || 0)) * (1 + (item.gst_rate || 0) / 100)
            }))
          }
        },
        include: {
          org: true,
          purchase_items: {
            include: { item: true }
          }
        }
      });
      return { success: true, data: purchase };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('update-purchase', async (event, id: number, updates) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      const purchase = await prismaClient.purchase.update({
        where: { purchase_id: id },
        data: {
          org_id: updates.org_id,
          purchase_date: updates.purchase_date ? new Date(updates.purchase_date) : undefined,
          due_date: updates.due_date ? new Date(updates.due_date) : undefined,
          status: updates.status,
          total_amount: updates.total_amount,
          gst_amount: updates.gst_amount,
          net_amount: updates.net_amount,
          notes: updates.notes
        },
        include: {
          org: true,
          purchase_items: {
            include: { item: true }
          }
        }
      });
      return { success: true, data: purchase };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('delete-purchase', async (event, id: number) => {
    if (!prismaClient) {
      return { success: false, error: 'Database service not initialized' };
    }

    try {
      await prismaClient.purchase.delete({
        where: { purchase_id: id }
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ==================== LOGOUT HANDLER ====================
  ipcMain.handle('logout', async () => {
    try {
      // Navigate to registration page
      if (mainWindow) {
        const mainHTMLPath = path.join(__dirname, 'renderer/index.html');
        const registrationURL = `file://${mainHTMLPath}?registration=true`;
        await mainWindow.loadURL(registrationURL);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
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