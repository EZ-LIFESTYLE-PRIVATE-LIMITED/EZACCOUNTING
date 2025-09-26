import Database from 'better-sqlite3';
import { getDatabaseConfig } from '../config/database';
import { MigrationRunner } from './migrations/migration-runner';

export class DatabaseConnection {
  private db: Database.Database | null = null;
  private config = getDatabaseConfig();
  private migrationRunner: MigrationRunner;

  constructor() {
    this.migrationRunner = new MigrationRunner();
  }

  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    try {
      this.db = new Database(this.config.path);
      console.log('SQLite database connected at:', this.config.path);
      
      // Run migrations
      await this.migrationRunner.runMigrations(this.db);
      
    } catch (err) {
      console.error('Error opening database:', err);
      throw err;
    }
  }

  /**
   * Get the database instance
   */
  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Check if database is connected
   */
  public isConnected(): boolean {
    return this.db !== null;
  }

  /**
   * Get database configuration
   */
  public getConfig() {
    return this.config;
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (!this.db) {
      return;
    }

    try {
      this.db.close();
      console.log('Database connection closed');
      this.db = null;
    } catch (err) {
      console.error('Error closing database:', err);
      throw err;
    }
  }
}

// Export singleton instance
export const databaseConnection = new DatabaseConnection();
