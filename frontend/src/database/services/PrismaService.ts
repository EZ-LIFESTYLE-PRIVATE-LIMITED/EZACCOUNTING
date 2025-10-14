import { PrismaClient } from '../../generated/prisma';
import { getPrismaClient } from '../prisma-client';
import { OrgPrisma } from '../models/OrgPrisma';
import { ItemPrisma } from '../models/ItemPrisma';
import { InvoicePrisma } from '../models/InvoicePrisma';
import { InvoiceItemPrisma } from '../models/InvoiceItemPrisma';

/**
 * Prisma Service - Centralized service for all Prisma model operations
 * Provides a clean interface to all database operations using Prisma ORM
 */
export class PrismaService {
  private prisma: PrismaClient;
  
  // Model services
  public readonly org: OrgPrisma;
  public readonly item: ItemPrisma;
  public readonly invoice: InvoicePrisma;
  public readonly invoiceItem: InvoiceItemPrisma;

  constructor() {
    this.prisma = getPrismaClient();
    
    // Initialize model services
    this.org = new OrgPrisma(this.prisma);
    this.item = new ItemPrisma(this.prisma);
    this.invoice = new InvoicePrisma(this.prisma);
    this.invoiceItem = new InvoiceItemPrisma(this.prisma);
  }

  /**
   * Get the underlying Prisma client
   */
  get client(): PrismaClient {
    return this.prisma;
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(fn);
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }

  /**
   * Health check - test database connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<{
    orgs: number;
    items: number;
    invoices: number;
    invoiceItems: number;
    accounts: number;
    transactions: number;
    testRecords: number;
  }> {
    const [orgs, items, invoices, invoiceItems, accounts, transactions, testRecords] = await Promise.all([
      this.prisma.org.count(),
      this.prisma.item.count(),
      this.prisma.invoice.count(),
      this.prisma.invoiceItem.count(),
      this.prisma.account.count(),
      this.prisma.transaction.count(),
      this.prisma.testTable.count(),
    ]);

    return {
      orgs,
      items,
      invoices,
      invoiceItems,
      accounts,
      transactions,
      testRecords,
    };
  }

  /**
   * Create a complete invoice with items in a transaction
   */
  async createInvoiceWithItems(data: {
    invoice: {
      invoice_number: string;
      org: { connect: { org_id: number } };
      invoice_date: Date;
      due_date?: Date;
      status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
      total_amount: number;
      gst_amount: number;
      net_amount: number;
    };
    items: Array<{
      item: { connect: { item_id: number } };
      quantity: number;
      item_total_amount: number;
      item_gst_amount: number;
      item_igst_amount: number;
      item_cgst_amount: number;
      item_sgst_amount: number;
      item_net_amount: number;
    }>;
  }) {
    return await this.transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoice.create({
        data: data.invoice,
      });

      // Create invoice items
      const invoiceItems = await Promise.all(
        data.items.map(item =>
          tx.invoiceItem.create({
            data: {
              ...item,
              invoice: {
                connect: { invoice_id: invoice.invoice_id }
              },
            },
          })
        )
      );

      return {
        invoice,
        invoiceItems,
      };
    });
  }

  /**
   * Update invoice with items in a transaction
   */
  async updateInvoiceWithItems(
    invoiceId: number,
    data: {
      invoice?: {
        invoice_number?: string;
        org?: { connect: { org_id: number } };
        invoice_date?: Date;
        due_date?: Date;
        status?: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
        total_amount?: number;
        gst_amount?: number;
        net_amount?: number;
      };
      items?: Array<{
        item: { connect: { item_id: number } };
        quantity: number;
        item_total_amount: number;
        item_gst_amount: number;
        item_igst_amount: number;
        item_cgst_amount: number;
        item_sgst_amount: number;
        item_net_amount: number;
      }>;
    }
  ) {
    return await this.transaction(async (tx) => {
      let invoice = null;

      // Update invoice if data provided
      if (data.invoice) {
        invoice = await tx.invoice.update({
          where: { invoice_id: invoiceId },
          data: data.invoice,
        });
      }

      // Update items if provided
      if (data.items) {
        // Delete existing items
        await tx.invoiceItem.deleteMany({
          where: { invoice_id: invoiceId },
        });

        // Create new items
        const invoiceItems = await Promise.all(
          data.items.map(item =>
            tx.invoiceItem.create({
              data: {
                ...item,
                invoice: {
                  connect: { invoice_id: invoiceId }
                },
              },
            })
          )
        );

        return {
          invoice: invoice || await tx.invoice.findUnique({ where: { invoice_id: invoiceId } }),
          invoiceItems,
        };
      }

      return {
        invoice: invoice || await tx.invoice.findUnique({ where: { invoice_id: invoiceId } }),
        invoiceItems: [],
      };
    });
  }
}

// Export singleton instance
export const prismaService = new PrismaService();
