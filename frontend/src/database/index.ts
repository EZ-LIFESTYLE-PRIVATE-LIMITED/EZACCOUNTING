// Database layer exports
export { DatabaseConnection } from './connection';
export { MigrationRunner } from './migrations/migration-runner';

// Models (classes)
export * from './models';

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
