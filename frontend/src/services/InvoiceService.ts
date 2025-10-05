import { logger } from '../utils/logger';

// Types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId: string;
  amount: number;
  gstAmount: number;
  date: string;
  dueDate: string;
  status: InvoiceStatus;
  description?: string;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
  gstRate: number;
  gstAmount: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  searchTerm?: string;
}

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
   */
  private initializeDummyData(): void {
    this.dummyInvoices = [
      {
        id: '1',
        invoiceNumber: 'INV-001',
        customerName: 'Tech Solutions Pvt Ltd',
        customerId: 'CUST-001',
        amount: 25000,
        gstAmount: 4500,
        date: '2024-01-15',
        dueDate: '2024-02-15',
        status: InvoiceStatus.PAID,
        description: 'Software development services',
        items: [
          {
            id: '1',
            description: 'Web Development',
            quantity: 1,
            rate: 25000,
            amount: 25000,
            gstRate: 18,
            gstAmount: 4500
          }
        ]
      },
      {
        id: '2',
        invoiceNumber: 'INV-002',
        customerName: 'Global Enterprises',
        customerId: 'CUST-002',
        amount: 15750,
        gstAmount: 2835,
        date: '2024-01-12',
        dueDate: '2024-02-12',
        status: InvoiceStatus.PENDING,
        description: 'Consulting services',
        items: [
          {
            id: '2',
            description: 'Business Consulting',
            quantity: 1,
            rate: 15750,
            amount: 15750,
            gstRate: 18,
            gstAmount: 2835
          }
        ]
      },
      {
        id: '3',
        invoiceNumber: 'INV-003',
        customerName: 'Startup Inc',
        customerId: 'CUST-003',
        amount: 8500,
        gstAmount: 1530,
        date: '2024-01-10',
        dueDate: '2024-02-10',
        status: InvoiceStatus.OVERDUE,
        description: 'Design services',
        items: [
          {
            id: '3',
            description: 'UI/UX Design',
            quantity: 1,
            rate: 8500,
            amount: 8500,
            gstRate: 18,
            gstAmount: 1530
          }
        ]
      },
      {
        id: '4',
        invoiceNumber: 'INV-004',
        customerName: 'Digital Marketing Co',
        customerId: 'CUST-004',
        amount: 32000,
        gstAmount: 5760,
        date: '2024-01-08',
        dueDate: '2024-02-08',
        status: InvoiceStatus.DRAFT,
        description: 'Marketing campaign',
        items: [
          {
            id: '4',
            description: 'Digital Marketing Campaign',
            quantity: 1,
            rate: 32000,
            amount: 32000,
            gstRate: 18,
            gstAmount: 5760
          }
        ]
      },
      {
        id: '5',
        invoiceNumber: 'INV-005',
        customerName: 'E-commerce Solutions',
        customerId: 'CUST-005',
        amount: 18500,
        gstAmount: 3330,
        date: '2024-01-05',
        dueDate: '2024-02-05',
        status: InvoiceStatus.SENT,
        description: 'E-commerce platform development',
        items: [
          {
            id: '5',
            description: 'E-commerce Development',
            quantity: 1,
            rate: 18500,
            amount: 18500,
            gstRate: 18,
            gstAmount: 3330
          }
        ]
      }
    ];
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
          return this.dummyInvoices.find(invoice => invoice.id === id) || null;
        
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
          return this.createDummyInvoice(invoice);
        
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
          return this.updateDummyInvoice(id, updates);
        
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
          return this.deleteDummyInvoice(id);
        
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
  public async getInvoiceStats(): Promise<{
    total: number;
    paid: number;
    pending: number;
    overdue: number;
    draft: number;
    totalAmount: number;
  }> {
    try {
      const invoices = await this.getInvoices();
      
      return {
        total: invoices.length,
        paid: invoices.filter(inv => inv.status === InvoiceStatus.PAID).length,
        pending: invoices.filter(inv => inv.status === InvoiceStatus.PENDING).length,
        overdue: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
        draft: invoices.filter(inv => inv.status === InvoiceStatus.DRAFT).length,
        totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0)
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
          invoice.customerName.toLowerCase().includes(searchLower) ||
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.description?.toLowerCase().includes(searchLower)
        );
      }
    }

    return filtered;
  }

  private createDummyInvoice(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice {
    const newId = (this.dummyInvoices.length + 1).toString();
    const newInvoiceNumber = `INV-${String(newId).padStart(3, '0')}`;
    
    const newInvoice: Invoice = {
      ...invoice,
      id: newId,
      invoiceNumber: newInvoiceNumber
    };
    
    this.dummyInvoices.push(newInvoice);
    return newInvoice;
  }

  private updateDummyInvoice(id: string, updates: Partial<Invoice>): Invoice {
    const index = this.dummyInvoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      throw new Error(`Invoice with ID ${id} not found`);
    }
    
    this.dummyInvoices[index] = { ...this.dummyInvoices[index], ...updates };
    return this.dummyInvoices[index];
  }

  private deleteDummyInvoice(id: string): boolean {
    const index = this.dummyInvoices.findIndex(invoice => invoice.id === id);
    if (index === -1) {
      return false;
    }
    
    this.dummyInvoices.splice(index, 1);
    return true;
  }

  // Database methods (to be implemented)
  private async getInvoicesFromDatabase(filters?: InvoiceFilters): Promise<Invoice[]> {
    // TODO: Implement database queries using Prisma
    logger.info('Database method not implemented yet, falling back to dummy data');
    return this.getDummyInvoices(filters);
  }

  private async getInvoiceFromDatabase(id: string): Promise<Invoice | null> {
    // TODO: Implement database query using Prisma
    logger.info('Database method not implemented yet, falling back to dummy data');
    return this.dummyInvoices.find(invoice => invoice.id === id) || null;
  }

  private async createInvoiceInDatabase(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    // TODO: Implement database creation using Prisma
    logger.info('Database method not implemented yet, falling back to dummy data');
    return this.createDummyInvoice(invoice);
  }

  private async updateInvoiceInDatabase(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    // TODO: Implement database update using Prisma
    logger.info('Database method not implemented yet, falling back to dummy data');
    return this.updateDummyInvoice(id, updates);
  }

  private async deleteInvoiceFromDatabase(id: string): Promise<boolean> {
    // TODO: Implement database deletion using Prisma
    logger.info('Database method not implemented yet, falling back to dummy data');
    return this.deleteDummyInvoice(id);
  }

  // API methods (to be implemented)
  private async getInvoicesFromAPI(filters?: InvoiceFilters): Promise<Invoice[]> {
    // TODO: Implement API calls
    logger.info('API method not implemented yet, falling back to dummy data');
    return this.getDummyInvoices(filters);
  }

  private async getInvoiceFromAPI(id: string): Promise<Invoice | null> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to dummy data');
    return this.dummyInvoices.find(invoice => invoice.id === id) || null;
  }

  private async createInvoiceInAPI(invoice: Omit<Invoice, 'id' | 'invoiceNumber'>): Promise<Invoice> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to dummy data');
    return this.createDummyInvoice(invoice);
  }

  private async updateInvoiceInAPI(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to dummy data');
    return this.updateDummyInvoice(id, updates);
  }

  private async deleteInvoiceFromAPI(id: string): Promise<boolean> {
    // TODO: Implement API call
    logger.info('API method not implemented yet, falling back to dummy data');
    return this.deleteDummyInvoice(id);
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
