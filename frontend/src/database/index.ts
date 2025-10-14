// Database layer exports
export { DatabaseConnection } from './connection';

// Prisma exports
export { getPrismaClient, disconnectPrisma, initializePrisma } from './prisma-client';

// Models (classes) - legacy better-sqlite3
// export * from './models'; // Commented out - legacy models removed

// Prisma model exports
export { OrgPrisma } from './models/OrgPrisma';
export { ItemPrisma } from './models/ItemPrisma';
export { InvoicePrisma } from './models/InvoicePrisma';
export { InvoiceItemPrisma } from './models/InvoiceItemPrisma';

// Services
export * from './services';

// Types (interfaces) - use type-only exports to avoid conflicts
export type { 
  TestRecord as ITestRecord,
  Account as IAccount,
  Transaction as ITransaction,
  DatabaseInfo,
  DatabaseResult
} from '../types/database';
