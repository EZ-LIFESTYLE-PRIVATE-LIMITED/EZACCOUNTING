import { PrismaClient, InvoiceItem, Prisma } from '../../generated/prisma';

export class InvoiceItemPrisma {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new invoice item
   */
  async create(data: Prisma.InvoiceItemCreateInput): Promise<InvoiceItem> {
    return await this.prisma.invoiceItem.create({
      data,
    });
  }

  /**
   * Find invoice item by ID
   */
  async findById(id: number): Promise<InvoiceItem | null> {
    return await this.prisma.invoiceItem.findUnique({
      where: { invoice_item_id: id },
    });
  }

  /**
   * Find invoice items by invoice ID
   */
  async findByInvoiceId(invoiceId: number): Promise<InvoiceItem[]> {
    return await this.prisma.invoiceItem.findMany({
      where: { invoice_id: invoiceId },
      orderBy: { invoice_item_id: 'asc' },
    });
  }

  /**
   * Find invoice items by item ID
   */
  async findByItemId(itemId: number): Promise<InvoiceItem[]> {
    return await this.prisma.invoiceItem.findMany({
      where: { item_id: itemId },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Get all invoice items
   */
  async findAll(): Promise<InvoiceItem[]> {
    return await this.prisma.invoiceItem.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Update invoice item
   */
  async update(id: number, data: Prisma.InvoiceItemUpdateInput): Promise<InvoiceItem | null> {
    try {
      return await this.prisma.invoiceItem.update({
        where: { invoice_item_id: id },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  /**
   * Delete invoice item
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.invoiceItem.delete({
        where: { invoice_item_id: id },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Record not found
      }
      throw error;
    }
  }

  /**
   * Delete all invoice items for a specific invoice
   */
  async deleteByInvoiceId(invoiceId: number): Promise<number> {
    const result = await this.prisma.invoiceItem.deleteMany({
      where: { invoice_id: invoiceId },
    });
    return result.count;
  }

  /**
   * Get invoice items with item details
   */
  async findWithItemDetails(invoiceId: number): Promise<Array<InvoiceItem & { item: any }>> {
    return await this.prisma.invoiceItem.findMany({
      where: { invoice_id: invoiceId },
      include: {
        item: true,
      },
      orderBy: { invoice_item_id: 'asc' },
    });
  }

  /**
   * Calculate totals for an invoice
   */
  async calculateInvoiceTotals(invoiceId: number): Promise<{
    total_amount: number;
    gst_amount: number;
    net_amount: number;
  }> {
    const result = await this.prisma.invoiceItem.aggregate({
      where: { invoice_id: invoiceId },
      _sum: {
        item_total_amount: true,
        item_gst_amount: true,
        item_net_amount: true,
      },
    });

    return {
      total_amount: result._sum.item_total_amount || 0,
      gst_amount: result._sum.item_gst_amount || 0,
      net_amount: result._sum.item_net_amount || 0,
    };
  }

  /**
   * Create multiple invoice items in a transaction
   */
  async createMany(items: Prisma.InvoiceItemCreateManyInput[]): Promise<{ count: number }> {
    return await this.prisma.invoiceItem.createMany({
      data: items,
    });
  }

  /**
   * Update invoice items for an invoice (replace all items)
   */
  async updateInvoiceItems(invoiceId: number, items: Prisma.InvoiceItemCreateManyInput[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.invoiceItem.deleteMany({
        where: { invoice_id: invoiceId },
      });

      // Create new items
      if (items.length > 0) {
        await tx.invoiceItem.createMany({
          data: items.map(item => ({
            ...item,
            invoice_id: invoiceId,
          })),
        });
      }
    });
  }

  /**
   * Get invoice items with full details (invoice, item, organization)
   */
  async findWithFullDetails(invoiceId: number): Promise<Array<InvoiceItem & { 
    item: any; 
    invoice: any & { org: any } 
  }>> {
    return await this.prisma.invoiceItem.findMany({
      where: { invoice_id: invoiceId },
      include: {
        item: true,
        invoice: {
          include: {
            org: true,
          },
        },
      },
      orderBy: { invoice_item_id: 'asc' },
    });
  }

  /**
   * Get item usage statistics
   */
  async getItemUsageStats(itemId: number): Promise<{
    totalQuantity: number;
    totalAmount: number;
    invoiceCount: number;
  }> {
    const [aggregate, count] = await Promise.all([
      this.prisma.invoiceItem.aggregate({
        where: { item_id: itemId },
        _sum: {
          quantity: true,
          item_total_amount: true,
        },
      }),
      this.prisma.invoiceItem.count({
        where: { item_id: itemId },
      }),
    ]);

    return {
      totalQuantity: aggregate._sum.quantity || 0,
      totalAmount: aggregate._sum.item_total_amount || 0,
      invoiceCount: count,
    };
  }
}
