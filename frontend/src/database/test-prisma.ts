import { PrismaService } from './services/PrismaService';

/**
 * Test Prisma integration
 * This file can be used to test the Prisma ORM integration
 */
export class PrismaTest {
  private prismaService: PrismaService;

  constructor() {
    this.prismaService = new PrismaService();
  }

  /**
   * Run all tests
   */
  async runTests(): Promise<void> {
    console.log('🧪 Starting Prisma integration tests...');

    try {
      // Test 1: Database connection
      await this.testDatabaseConnection();

      // Test 2: Organization operations
      await this.testOrganizationOperations();

      // Test 3: Item operations
      await this.testItemOperations();

      // Test 4: Invoice operations
      await this.testInvoiceOperations();

      // Test 5: Complex operations
      await this.testComplexOperations();

      console.log('✅ All Prisma tests passed!');
    } catch (error) {
      console.error('❌ Prisma tests failed:', error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  private async testDatabaseConnection(): Promise<void> {
    console.log('🔌 Testing database connection...');
    
    const isHealthy = await this.prismaService.healthCheck();
    if (!isHealthy) {
      throw new Error('Database connection failed');
    }

    const stats = await this.prismaService.getStatistics();
    console.log('📊 Database statistics:', stats);
  }

  /**
   * Test organization operations
   */
  private async testOrganizationOperations(): Promise<void> {
    console.log('🏢 Testing organization operations...');

    // Create organization
    const org = await this.prismaService.org.create({
      name: 'Test Organization',
      gstin: '29TEST1234F1Z5',
      state: 'Karnataka',
      email: 'test@example.com',
      phone: '+91-9876543210',
      org_type: 'BUSINESS',
    });

    console.log('✅ Created organization:', org.org_id);

    // Find organization
    const foundOrg = await this.prismaService.org.findById(org.org_id);
    if (!foundOrg) {
      throw new Error('Organization not found');
    }

    // Update organization
    const updatedOrg = await this.prismaService.org.update(org.org_id, {
      name: 'Updated Test Organization',
    });

    if (!updatedOrg) {
      throw new Error('Organization update failed');
    }

    // Search organizations
    const searchResults = await this.prismaService.org.searchByName('Test');
    if (searchResults.length === 0) {
      throw new Error('Organization search failed');
    }

    console.log('✅ Organization operations completed');
  }

  /**
   * Test item operations
   */
  private async testItemOperations(): Promise<void> {
    console.log('📦 Testing item operations...');

    // Create item
    const item = await this.prismaService.item.create({
      item_name: 'Test Item',
      item_description: 'A test item for testing',
      item_sku: 'TEST-001',
      item_gst: 18.0,
      item_category: 'Test Category',
    });

    console.log('✅ Created item:', item.item_id);

    // Find item
    const foundItem = await this.prismaService.item.findById(item.item_id);
    if (!foundItem) {
      throw new Error('Item not found');
    }

    // Update item
    const updatedItem = await this.prismaService.item.update(item.item_id, {
      item_name: 'Updated Test Item',
    });

    if (!updatedItem) {
      throw new Error('Item update failed');
    }

    // Get categories
    const categories = await this.prismaService.item.getCategories();
    console.log('📋 Categories:', categories);

    console.log('✅ Item operations completed');
  }

  /**
   * Test invoice operations
   */
  private async testInvoiceOperations(): Promise<void> {
    console.log('🧾 Testing invoice operations...');

    // Get or create organization for invoice
    let org = await this.prismaService.org.findByType('BUSINESS');
    if (org.length === 0) {
      org = [await this.prismaService.org.create({
        name: 'Invoice Test Org',
        org_type: 'BUSINESS',
      })];
    }

    // Create invoice
    const invoice = await this.prismaService.invoice.create({
      invoice_number: 'TEST-001',
      org: {
        connect: { org_id: org[0].org_id }
      },
      invoice_date: new Date(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'DRAFT',
      total_amount: 1000.0,
      gst_amount: 180.0,
      net_amount: 820.0,
    });

    console.log('✅ Created invoice:', invoice.invoice_id);

    // Find invoice
    const foundInvoice = await this.prismaService.invoice.findById(invoice.invoice_id);
    if (!foundInvoice) {
      throw new Error('Invoice not found');
    }

    // Update invoice status
    const updatedInvoice = await this.prismaService.invoice.updateStatus(invoice.invoice_id, 'SENT');
    if (!updatedInvoice) {
      throw new Error('Invoice status update failed');
    }

    // Get invoice statistics
    const stats = await this.prismaService.invoice.getStatistics();
    console.log('📊 Invoice statistics:', stats);

    console.log('✅ Invoice operations completed');
  }

  /**
   * Test complex operations
   */
  private async testComplexOperations(): Promise<void> {
    console.log('🔄 Testing complex operations...');

    // Get or create test data
    let org = await this.prismaService.org.findByType('BUSINESS');
    if (org.length === 0) {
      org = [await this.prismaService.org.create({
        name: 'Complex Test Org',
        org_type: 'BUSINESS',
      })];
    }

    let item = await this.prismaService.item.findBySku('TEST-001');
    if (!item) {
      item = await this.prismaService.item.create({
        item_name: 'Complex Test Item',
        item_sku: 'TEST-001',
        item_gst: 18.0,
      });
    }

    // Test transaction
    await this.prismaService.transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoice.create({
        data: {
          invoice_number: 'COMPLEX-001',
          org: {
            connect: { org_id: org[0].org_id }
          },
          invoice_date: new Date(),
          status: 'DRAFT',
          total_amount: 1180.0,
          gst_amount: 180.0,
          net_amount: 1000.0,
        }
      });

      // Create invoice item
      await tx.invoiceItem.create({
        data: {
          invoice: {
            connect: { invoice_id: invoice.invoice_id }
          },
          item: {
            connect: { item_id: item.item_id }
          },
          quantity: 1.0,
          item_total_amount: 1180.0,
          item_gst_amount: 180.0,
          item_igst_amount: 180.0,
          item_cgst_amount: 0.0,
          item_sgst_amount: 0.0,
          item_net_amount: 1000.0,
        }
      });

      console.log('✅ Complex transaction completed');
    });

    // Test createInvoiceWithItems
    const invoiceWithItems = await this.prismaService.createInvoiceWithItems({
      invoice: {
        invoice_number: 'COMPLEX-002',
        org: {
          connect: { org_id: org[0].org_id }
        },
        invoice_date: new Date(),
        status: 'DRAFT',
        total_amount: 2360.0,
        gst_amount: 360.0,
        net_amount: 2000.0,
      },
      items: [
        {
          item: {
            connect: { item_id: item.item_id }
          },
          quantity: 2.0,
          item_total_amount: 2360.0,
          item_gst_amount: 360.0,
          item_igst_amount: 360.0,
          item_cgst_amount: 0.0,
          item_sgst_amount: 0.0,
          item_net_amount: 2000.0,
        },
      ],
    });

    console.log('✅ Created invoice with items:', invoiceWithItems.invoice.invoice_id);

    console.log('✅ Complex operations completed');
  }

  /**
   * Cleanup test data
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Delete test invoices and related data
      await this.prismaService.transaction(async (tx) => {
        // Delete invoice items first
        await tx.invoiceItem.deleteMany({
          where: {
            invoice: {
              invoice_number: {
                in: ['TEST-001', 'COMPLEX-001', 'COMPLEX-002'],
              },
            },
          },
        });

        // Delete invoices
        await tx.invoice.deleteMany({
          where: {
            invoice_number: {
              in: ['TEST-001', 'COMPLEX-001', 'COMPLEX-002'],
            },
          },
        });

        // Delete test items
        await tx.item.deleteMany({
          where: {
            item_sku: 'TEST-001',
          },
        });

        // Delete test organizations
        await tx.org.deleteMany({
          where: {
            name: {
              contains: 'Test',
            },
          },
        });
      });

      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.error('❌ Test data cleanup failed:', error);
    }
  }
}

// Export test instance
export const prismaTest = new PrismaTest();
