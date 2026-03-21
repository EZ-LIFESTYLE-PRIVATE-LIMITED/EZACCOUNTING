import { logger } from '../utils/logger';
import { getPrismaClient } from './prisma-client';

/**
 * Development Data Seeder
 * Automatically seeds the database with dummy data for development
 */
export class DevSeeder {
  private prismaClient = getPrismaClient();

  /**
   * Auto-seed development data if database is empty
   */
  public async seedIfEmpty(): Promise<void> {
    try {
      logger.info('Checking if database needs seeding...');

      if (!this.prismaClient) {
        logger.warn('PrismaClient not available for seeding');
        return;
      }

      // Check if we already have data
      const existingInvoices = await this.prismaClient.invoice.count();
      if (existingInvoices > 0) {
        logger.info(`Database already has ${existingInvoices} invoices, skipping seeding`);
        return;
      }

      logger.info('Database is empty, seeding with development data...');

      await this.seedOrganizations();
      await this.seedItems();
      await this.seedInvoices();

      logger.info('🎉 Development data seeded successfully! (3 orgs, 5 items, 5 invoices)');
    } catch (error) {
      logger.error('Failed to seed development data:', error);
      // Don't throw error, just log it - we want the app to continue even if seeding fails
    }
  }

  /**
   * Seed Organizations
   */
  private async seedOrganizations(): Promise<void> {
    await this.prismaClient.org.createMany({
      data: [
        {
          org_id: 1,
          name: 'Tech Solutions Pvt Ltd',
          user_name: 'John Doe',
          gstin: '29ABCDE1234F1Z5',
          state: 'Maharashtra',
          city_state: 'Mumbai, Maharashtra',
          email: 'john@techsolutions.com',
          phone: '+91-9876543210',
          business_address: '123 Business Park, Mumbai',
          invoice_series: 'TS',
          signature_url: null,
          org_type: 'BUSINESS'
        },
        {
          org_id: 2,
          name: 'Global Enterprises',
          user_name: 'Jane Smith',
          gstin: '27FGHIJ5678K9L3',
          state: 'Karnataka',
          city_state: 'Bangalore, Karnataka',
          email: 'jane@globalent.com',
          phone: '+91-9876543211',
          business_address: '456 Tech Hub, Bangalore',
          invoice_series: 'GE',
          signature_url: null,
          org_type: 'BUSINESS'
        },
        {
          org_id: 3,
          name: 'Startup Inc',
          user_name: 'Bob Johnson',
          gstin: '33MNOPQ9012R5S7',
          state: 'Delhi',
          city_state: 'New Delhi, Delhi',
          email: 'bob@startupinc.com',
          phone: '+91-9876543212',
          business_address: '789 Innovation Center, Delhi',
          invoice_series: 'SI',
          signature_url: null,
          org_type: 'BUSINESS'
        }
      ]
    });
    logger.info('✅ Seeded 3 organizations');
  }

  /**
   * Seed Items
   */
  private async seedItems(): Promise<void> {
    await this.prismaClient.item.createMany({
      data: [
        {
          item_id: 1,
          item_name: 'Web Development',
          item_description: 'Custom website development services',
          item_sku: 'WEB-001',
          item_gst: 18.0,
          item_category: 'Services'
        },
        {
          item_id: 2,
          item_name: 'Mobile App Development',
          item_description: 'iOS and Android app development',
          item_sku: 'MOB-002',
          item_gst: 18.0,
          item_category: 'Services'
        },
        {
          item_id: 3,
          item_name: 'Digital Marketing',
          item_description: 'SEO and social media marketing',
          item_sku: 'DIG-003',
          item_gst: 18.0,
          item_category: 'Services'
        },
        {
          item_id: 4,
          item_name: 'Consulting',
          item_description: 'Business consulting services',
          item_sku: 'CON-004',
          item_gst: 18.0,
          item_category: 'Services'
        },
        {
          item_id: 5,
          item_name: 'Training',
          item_description: 'Technical training programs',
          item_sku: 'TRN-005',
          item_gst: 18.0,
          item_category: 'Services'
        }
      ]
    });
    logger.info('✅ Seeded 5 items');
  }

  /**
   * Seed Invoices
   */
  private async seedInvoices(): Promise<void> {
    await this.prismaClient.invoice.createMany({
      data: [
        {
          invoice_id: 1,
          invoice_number: 'INV-001',
          org_id: 1,
          invoice_date: new Date('2024-01-15'),
          due_date: new Date('2024-02-15'),
          status: 'PAID',
          total_amount: 25000.00,
          gst_amount: 4500.00,
          net_amount: 20500.00
        },
        {
          invoice_id: 2,
          invoice_number: 'INV-002',
          org_id: 2,
          invoice_date: new Date('2024-01-20'),
          due_date: new Date('2024-02-20'),
          status: 'SENT',
          total_amount: 15750.00,
          gst_amount: 2835.00,
          net_amount: 12915.00
        },
        {
          invoice_id: 3,
          invoice_number: 'INV-003',
          org_id: 3,
          invoice_date: new Date('2024-01-25'),
          due_date: new Date('2024-02-25'),
          status: 'OVERDUE',
          total_amount: 8500.00,
          gst_amount: 1530.00,
          net_amount: 6970.00
        },
        {
          invoice_id: 4,
          invoice_number: 'INV-004',
          org_id: 1,
          invoice_date: new Date('2024-02-01'),
          due_date: new Date('2024-03-01'),
          status: 'DRAFT',
          total_amount: 32000.00,
          gst_amount: 5760.00,
          net_amount: 26240.00
        },
        {
          invoice_id: 5,
          invoice_number: 'INV-005',
          org_id: 2,
          invoice_date: new Date('2024-02-05'),
          due_date: new Date('2024-03-05'),
          status: 'SENT',
          total_amount: 18500.00,
          gst_amount: 3330.00,
          net_amount: 15170.00
        }
      ]
    });
    logger.info('✅ Seeded 5 invoices');
  }

  /**
   * Clear all development data
   */
  public async clearAllData(): Promise<void> {
    try {
      logger.info('Clearing all development data...');
      
      await this.prismaClient.invoiceItem.deleteMany();
      await this.prismaClient.invoice.deleteMany();
      await this.prismaClient.item.deleteMany();
      await this.prismaClient.org.deleteMany();
      
      logger.info('🗑️ All development data cleared');
    } catch (error) {
      logger.error('Failed to clear development data:', error);
      throw error;
    }
  }

  /**
   * Reseed all data (clear + seed)
   */
  public async reseed(): Promise<void> {
    await this.clearAllData();
    await this.seedIfEmpty();
  }
}
