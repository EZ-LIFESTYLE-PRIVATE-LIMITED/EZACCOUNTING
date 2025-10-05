import { PrismaClient, Item, Prisma } from '../../generated/prisma';

export class ItemPrisma {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new item
   */
  async create(data: Prisma.ItemCreateInput): Promise<Item> {
    return await this.prisma.item.create({
      data,
    });
  }

  /**
   * Find item by ID
   */
  async findById(id: number): Promise<Item | null> {
    return await this.prisma.item.findUnique({
      where: { item_id: id },
    });
  }

  /**
   * Find item by SKU
   */
  async findBySku(sku: string): Promise<Item | null> {
    return await this.prisma.item.findFirst({
      where: { item_sku: sku },
    });
  }

  /**
   * Find items by category
   */
  async findByCategory(category: string): Promise<Item[]> {
    return await this.prisma.item.findMany({
      where: { item_category: category },
      orderBy: { item_name: 'asc' },
    });
  }

  /**
   * Get all items
   */
  async findAll(): Promise<Item[]> {
    return await this.prisma.item.findMany({
      orderBy: { item_name: 'asc' },
    });
  }

  /**
   * Update item
   */
  async update(id: number, data: Prisma.ItemUpdateInput): Promise<Item | null> {
    try {
      return await this.prisma.item.update({
        where: { item_id: id },
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
   * Delete item
   */
  async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.item.delete({
        where: { item_id: id },
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
   * Search items by name
   */
  async searchByName(query: string): Promise<Item[]> {
    return await this.prisma.item.findMany({
      where: {
        item_name: {
          contains: query,
        },
      },
      orderBy: { item_name: 'asc' },
    });
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const result = await this.prisma.item.findMany({
      select: { item_category: true },
      where: { item_category: { not: null } },
      distinct: ['item_category'],
      orderBy: { item_category: 'asc' },
    });

    return result.map(item => item.item_category!).filter(Boolean);
  }

  /**
   * Get items with their invoice items
   */
  async findWithInvoiceItems(id: number): Promise<Item & { invoice_items: any[] } | null> {
    return await this.prisma.item.findUnique({
      where: { item_id: id },
      include: {
        invoice_items: {
          orderBy: { created_at: 'desc' },
        },
      },
    });
  }

  /**
   * Count items by category
   */
  async countByCategory(): Promise<Array<{ item_category: string | null; count: number }>> {
    const result = await this.prisma.item.groupBy({
      by: ['item_category'],
      _count: {
        item_category: true,
      },
    });

    return result.map(item => ({
      item_category: item.item_category,
      count: item._count.item_category,
    }));
  }
}
