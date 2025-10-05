import { PrismaClient, Org, OrgType, Prisma } from '../../generated/prisma';

export class OrgPrisma {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new organization
   */
  async create(data: Prisma.OrgCreateInput): Promise<Org> {
    return await this.prisma.org.create({
      data,
    });
  }

  /**
   * Find organization by ID
   */
  async findById(id: number): Promise<Org | null> {
    return await this.prisma.org.findUnique({
      where: { org_id: id },
    });
  }

  /**
   * Find organizations by type
   */
  async findByType(type: OrgType): Promise<Org[]> {
    return await this.prisma.org.findMany({
      where: { org_type: type },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Find organization by GSTIN
   */
  async findByGstin(gstin: string): Promise<Org | null> {
    return await this.prisma.org.findFirst({
      where: { gstin },
    });
  }

  /**
   * Get all organizations
   */
  async findAll(): Promise<Org[]> {
    return await this.prisma.org.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update organization
   */
  async update(id: number, data: Prisma.OrgUpdateInput): Promise<Org | null> {
    try {
      return await this.prisma.org.update({
        where: { org_id: id },
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
   * Delete organization
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.org.delete({
        where: { org_id: id },
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
   * Search organizations by name
   */
  async searchByName(query: string): Promise<Org[]> {
    return await this.prisma.org.findMany({
      where: {
        name: {
          contains: query,
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get organizations with their invoices
   */
  async findWithInvoices(id: number): Promise<Org & { invoices: any[] } | null> {
    return await this.prisma.org.findUnique({
      where: { org_id: id },
      include: {
        invoices: {
          orderBy: { invoice_date: 'desc' },
        },
      },
    });
  }

  /**
   * Count organizations by type
   */
  async countByType(): Promise<Array<{ org_type: OrgType; count: number }>> {
    const result = await this.prisma.org.groupBy({
      by: ['org_type'],
      _count: {
        org_type: true,
      },
    });

    return result.map(item => ({
      org_type: item.org_type,
      count: item._count.org_type,
    }));
  }
}
