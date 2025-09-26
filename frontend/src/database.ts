import Database from 'better-sqlite3';
import { getAppConfig } from './config';

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private config = getAppConfig();

  constructor() {
    // Use configurable database path
    this.dbPath = this.config.databasePath;
  }

  /**
   * Initialize the database connection
   */
  public async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      console.log('SQLite database connected at:', this.dbPath);
    } catch (err) {
      console.error('Error opening database:', err);
      throw err;
    }
  }

  /**
   * Create initial tables for the application
   */
  public async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const createTablesSQL = `
      -- Test table to verify SQLite functionality
      CREATE TABLE IF NOT EXISTS test_table (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        value TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Future accounting tables (placeholder for now)
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'income', 'expense')),
        balance REAL DEFAULT 0.0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id INTEGER NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('debit', 'credit')),
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (account_id) REFERENCES accounts (id)
      );
    `;

    try {
      this.db.exec(createTablesSQL);
      console.log('Tables created successfully');
    } catch (err) {
      console.error('Error creating tables:', err);
      throw err;
    }
  }

  /**
   * Insert a test record to verify functionality
   */
  public async insertTestRecord(name: string, value: string): Promise<number> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const sql = 'INSERT INTO test_table (name, value) VALUES (?, ?)';
    
    try {
      const stmt = this.db.prepare(sql);
      const result = stmt.run(name, value);
      console.log('Test record inserted with ID:', result.lastInsertRowid);
      return result.lastInsertRowid as number;
    } catch (err) {
      console.error('Error inserting test record:', err);
      throw err;
    }
  }

  /**
   * Get all test records
   */
  public async getTestRecords(): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const sql = 'SELECT * FROM test_table ORDER BY created_at DESC';
    
    try {
      const stmt = this.db.prepare(sql);
      const rows = stmt.all();
      return rows;
    } catch (err) {
      console.error('Error fetching test records:', err);
      throw err;
    }
  }

  /**
   * Get database information
   */
  public async getDatabaseInfo(): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const sql = `
      SELECT 
        name,
        type,
        sql
      FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `;
    
    try {
      const stmt = this.db.prepare(sql);
      const rows = stmt.all();
      return {
        dbPath: this.dbPath,
        tables: rows
      };
    } catch (err) {
      console.error('Error fetching database info:', err);
      throw err;
    }
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

  /**
   * Check if database is connected
   */
  public isConnected(): boolean {
    return this.db !== null;
  }
}

// Export a singleton instance
export const databaseService = new DatabaseService();
