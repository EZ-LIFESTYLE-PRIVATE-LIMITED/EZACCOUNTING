import { PrismaClient, Invoice, InvoiceStatus, Prisma } from '../../generated/prisma';

export class InvoicePrisma {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new invoice
   */
  async create(data: Prisma.InvoiceCreateInput): Promise<Invoice> {
    return await this.prisma.invoice.create({
      data,
    });
  }

  /**
   * Find invoice by ID
   */
  async findById(id: number): Promise<Invoice | null> {
    return await this.prisma.invoice.findUnique({
      where: { invoice_id: id },
    });
  }

  /**
   * Find invoice by invoice number
   */
  async findByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
    return await this.prisma.invoice.findUnique({
      where: { invoice_number: invoiceNumber },
    });
  }

  /**
   * Find invoices by organization
   */
  async findByOrgId(orgId: number): Promise<Invoice[]> {
    return await this.prisma.invoice.findMany({
      where: { org_id: orgId },
      orderBy: { invoice_date: 'desc' },
    });
  }

  /**
   * Find invoices by status
   */
  async findByStatus(status: InvoiceStatus): Promise<Invoice[]> {
    return await this.prisma.invoice.findMany({
      where: { status },
      orderBy: { invoice_date: 'desc' },
    });
  }

  /**
   * Get all invoices
   */
  async findAll(): Promise<Invoice[]> {
    return await this.prisma.invoice.findMany({
      orderBy: { invoice_date: 'desc' },
    });
  }

  /**
   * Update invoice
   */
  async update(id: number, data: Prisma.InvoiceUpdateInput): Promise<Invoice | null> {
    try {
      return await this.prisma.invoice.update({
        where: { invoice_id: id },
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
   * Delete invoice
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.invoice.delete({
        where: { invoice_id: id },
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
   * Get invoices by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    return await this.prisma.invoice.findMany({
      where: {
        invoice_date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { invoice_date: 'desc' },
    });
  }

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices(): Promise<Invoice[]> {
    const today = new Date();
    return await this.prisma.invoice.findMany({
      where: {
        status: {
          notIn: ['PAID', 'CANCELLED'],
        },
        due_date: {
          lt: today,
        },
      },
      orderBy: { due_date: 'asc' },
    });
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: number, status: InvoiceStatus): Promise<Invoice | null> {
    try {
      return await this.prisma.invoice.update({
        where: { invoice_id: id },
        data: { status },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  /**
   * Generate next invoice number
   */
  async generateInvoiceNumber(): Promise<string> {
    const count = await this.prisma.invoice.count();
    const nextNumber = count + 1;
    return `INV-${String(nextNumber).padStart(6, '0')}`;
  }

  /**
   * Get invoice with organization and items
   */
  async findWithDetails(id: number): Promise<Invoice & { org: any; invoice_items: any[] } | null> {
    return await this.prisma.invoice.findUnique({
      where: { invoice_id: id },
      include: {
        org: true,
        invoice_items: {
          include: {
            item: true,
          },
        },
      },
    });
  }

  /**
   * Get invoice statistics
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Array<{ status: InvoiceStatus; count: number }>;
    totalAmount: number;
    overdueCount: number;
  }> {
    const [total, byStatus, totalAmount, overdueCount] = await Promise.all([
      this.prisma.invoice.count(),
      this.prisma.invoice.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.invoice.aggregate({
        _sum: { total_amount: true },
      }),
      this.prisma.invoice.count({
        where: {
          status: { notIn: ['PAID', 'CANCELLED'] },
          due_date: { lt: new Date() },
        },
      }),
    ]);

    return {
      total,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.status,
      })),
      totalAmount: totalAmount._sum.total_amount || 0,
      overdueCount,
    };
  }
}
