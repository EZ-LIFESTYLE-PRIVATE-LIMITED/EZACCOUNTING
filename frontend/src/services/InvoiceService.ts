import { logger } from '../utils/logger';
import { 
  Invoice, 
  Org, 
  Item, 
  InvoiceItem, 
  InvoiceStatus, 
  InvoiceFilters, 
  InvoiceStats 
} from '../types/database';

// Re-export types for backward compatibility
export { 
  Invoice, 
  Org, 
  Item, 
  InvoiceItem, 
  InvoiceStatus, 
  InvoiceFilters, 
  InvoiceStats 
};

// Service-specific types

export interface InvoiceServiceConfig {
  dataSource: 'dummy' | 'database' | 'api';
  apiBaseUrl?: string;
}

// Service class
export class InvoiceService {
  private config: InvoiceServiceConfig;
  private dummyInvoices: Invoice[] = [];

  constructor(config: InvoiceServiceConfig = { dataSource: 'dummy' }) {
    this.config = config;
    this.initializeDummyData();
  }

  /**
   * Initialize dummy data for development
   * No dummy data - only database and API sources
   */
  private initializeDummyData(): void {
    this.dummyInvoices = [];
  }

  /**
   * Get all invoices with optional filtering
   */
  public async getInvoices(filters?: InvoiceFilters): Promise<Invoice[]> {
    try {
      logger.info('Fetching invoices with filters:', filters);

      switch (this.config.dataSource) {
        case 'dummy':
          return this.getDummyInvoices(filters);
        
        case 'database':
          return await this.getInvoicesFromDatabase(filters);
        
        case 'api':
          return await this.getInvoicesFromAPI(filters);
        
        default:
          throw new Error(`Unsupported data source: ${this.config.dataSource}`);
      }
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      throw error;
    }
  }

  /**
   * Get invoice by ID
   */
  public async getInvoiceById(id: string): Promise<Invoice | null> {
    try {
      logger.info('Fetching invoice by ID:', id);

      switch (this.config.dataSource) {
        case 'dummy':
          // Fallback to database if dummy data is not available
          return await this.getInvoiceFromDatabase(id);
        
        case 'database':
          return await this.getInvoiceFromDatabase(id);
        
        case 'api':
          return await this.getInvoiceFromAPI(id);
        
        default:
          throw new Error(`Unsupported data source: ${this.config.dataSource}`);
      }
    } catch (error) {
      logger.error('Error fetching invoice by ID:', error);
      throw error;
    }
  }

  /**
   * Create new invoice
   */
  public async createInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    try {
      logger.info('Creating new invoice:', invoice);

      switch (this.config.dataSource) {
        case 'dummy':
          // Fallback to database if dummy data is not available
          return await this.createInvoiceInDatabase(invoice);
        
        case 'database':
          return await this.createInvoiceInDatabase(invoice);
        
        case 'api':
          return await this.createInvoiceInAPI(invoice);
        
        default:
          throw new Error(`Unsupported data source: ${this.config.dataSource}`);
      }
    } catch (error) {
      logger.error('Error creating invoice:', error);
      throw error;
    }
  }

  /**
   * Update existing invoice
   */
  public async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    try {
      logger.info('Updating invoice:', { id, updates });

      switch (this.config.dataSource) {
        case 'dummy':
          // Fallback to database if dummy data is not available
          return await this.updateInvoiceInDatabase(id, updates);
        
        case 'database':
          return await this.updateInvoiceInDatabase(id, updates);
        
        case 'api':
          return await this.updateInvoiceInAPI(id, updates);
        
        default:
          throw new Error(`Unsupported data source: ${this.config.dataSource}`);
      }
    } catch (error) {
      logger.error('Error updating invoice:', error);
      throw error;
    }
  }

  /**
   * Delete invoice
   */
  public async deleteInvoice(id: string): Promise<boolean> {
    try {
      logger.info('Deleting invoice:', id);

      switch (this.config.dataSource) {
        case 'dummy':
          // Fallback to database if dummy data is not available
          return await this.deleteInvoiceFromDatabase(id);
        
        case 'database':
          return await this.deleteInvoiceFromDatabase(id);
        
        case 'api':
          return await this.deleteInvoiceFromAPI(id);
        
        default:
          throw new Error(`Unsupported data source: ${this.config.dataSource}`);
      }
    } catch (error) {
      logger.error('Error deleting invoice:', error);
      throw error;
    }
  }

  /**
   * Get invoice statistics
   */
  public async getInvoiceStats(): Promise<InvoiceStats> {
    try {
      const invoices = await this.getInvoices();
      
      return {
        total: invoices.length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
        draft: invoices.filter(inv => inv.status === 'DRAFT').length,
        sent: invoices.filter(inv => inv.status === 'SENT').length,
        paid: invoices.filter(inv => inv.status === 'PAID').length,
        overdue: invoices.filter(inv => inv.status === 'OVERDUE').length
      };
    } catch (error) {
      logger.error('Error getting invoice stats:', error);
      throw error;
    }
  }

  // Dummy data methods
  private getDummyInvoices(filters?: InvoiceFilters): Invoice[] {
    let filtered = [...this.dummyInvoices];

    if (filters) {
      if (filters.status) {
        filtered = filtered.filter(invoice => invoice.status === filters.status);
      }
      
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(invoice => 
          invoice.org?.name.toLowerCase().includes(searchLower) ||
          invoice.invoice_number.toLowerCase().includes(searchLower)
        );
      }
    }

    return filtered;
  }

  // Dummy data methods removed - using database only

  // Database methods
  private async getInvoicesFromDatabase(filters?: InvoiceFilters): Promise<Invoice[]> {
    try {
      console.log('InvoiceService: getInvoicesFromDatabase called with filters:', filters);
      
      // For browser environment, use IPC to communicate with main process
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        console.log('InvoiceService: Using IPC to fetch invoices with filters:', filters);
        console.log('InvoiceService: electronAPI available:', !!(window as any).electronAPI);
        console.log('InvoiceService: electronAPI.getInvoices available:', !!(window as any).electronAPI?.getInvoices);
        
        const result = await (window as any).electronAPI.getInvoices(filters);
        console.log('InvoiceService: IPC result:', result);
        
        if (result.success) {
          console.log('InvoiceService: Successfully fetched', result.data.length, 'invoices');
          console.log('InvoiceService: First invoice sample:', result.data[0] ? {
            id: result.data[0].invoice_id,
            number: result.data[0].invoice_number,
            customer: result.data[0].org?.name,
            amount: result.data[0].total_amount
          } : 'No invoices');
          return result.data;
        } else {
          console.error('InvoiceService: IPC error:', result.error);
          throw new Error(result.error);
        }
      }
      
      // Fallback to dummy data if IPC is not available
      console.log('InvoiceService: IPC not available, falling back to dummy data');
      console.log('InvoiceService: window available:', typeof window !== 'undefined');
      console.log('InvoiceService: electronAPI available:', !!(window as any).electronAPI);
      logger.info('IPC not available, falling back to dummy data');
      return this.getDummyInvoices(filters);
    } catch (error) {
      console.error('InvoiceService: Error fetching invoices from database:', error);
      logger.error('Error fetching invoices from database:', error);
      // Fallback to dummy data on error
      console.log('InvoiceService: Falling back to dummy data due to error');
      return this.getDummyInvoices(filters);
    }
  }

  private async getInvoiceFromDatabase(id: string): Promise<Invoice | null> {
    // TODO: Implement database query using Prisma
    logger.info('Database getInvoiceFromDatabase method not implemented yet');
    return null;
  }

  private async createInvoiceInDatabase(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    // TODO: Implement database creation using Prisma
    logger.info('Database creation method not implemented yet');
    throw new Error('Database creation method not implemented yet');
  }

  private async updateInvoiceInDatabase(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    // TODO: Implement database update using Prisma
    logger.info('Database update method not implemented yet');
    throw new Error('Database update method not implemented yet');
  }

  private async deleteInvoiceFromDatabase(id: string): Promise<boolean> {
    // TODO: Implement database deletion using Prisma
    logger.info('Database deletion method not implemented yet');
    return false;
  }

  // API methods (to be implemented)
  private async getInvoicesFromAPI(filters?: InvoiceFilters): Promise<Invoice[]> {
    // TODO: Implement API calls
    logger.info('API method not implemented yet, falling back to database');
    return this.getInvoicesFromDatabase(filters);
  }

  private async getInvoiceFromAPI(id: string): Promise<Invoice | null> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to database');
    return this.getInvoiceFromDatabase(id);
  }

  private async createInvoiceInAPI(invoice: Omit<Invoice, 'invoice_id' | 'invoice_number'>): Promise<Invoice> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to database');
    // Convert the invoice to the expected format
    const convertedInvoice = invoice as Omit<Invoice, 'id' | 'invoiceNumber'>;
    return this.createInvoiceInDatabase(convertedInvoice);
  }

  private async updateInvoiceInAPI(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to database');
    return this.updateInvoiceInDatabase(id, updates);
  }

  private async deleteInvoiceFromAPI(id: string): Promise<boolean> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to database');
    return this.deleteInvoiceFromDatabase(id);
  }

  /**
   * Update service configuration
   */
  public updateConfig(newConfig: Partial<InvoiceServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info('Invoice service configuration updated:', this.config);
  }

  /**
   * Get current configuration
   */
  public getConfig(): InvoiceServiceConfig {
    return { ...this.config };
  }
}
