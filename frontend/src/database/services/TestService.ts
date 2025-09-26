import Database from 'better-sqlite3';
import { TestRecord } from '../../types/database';
import { DatabaseResult } from '../../types/database';

export class TestService {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
  }

  /**
   * Insert a test record
   */
  public async insertTestRecord(name: string, value: string): Promise<DatabaseResult<number>> {
    try {
      const sql = 'INSERT INTO test_table (name, value) VALUES (?, ?)';
      const stmt = this.db.prepare(sql);
      const result = stmt.run(name, value);
      
      console.log('Test record inserted with ID:', result.lastInsertRowid);
      return {
        success: true,
        data: result.lastInsertRowid as number
      };
    } catch (error) {
      console.error('Error inserting test record:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get all test records
   */
  public async getTestRecords(): Promise<DatabaseResult<TestRecord[]>> {
    try {
      // First check if table exists
      const tableCheckSql = "SELECT name FROM sqlite_master WHERE type='table' AND name='test_table'";
      const tableCheckStmt = this.db.prepare(tableCheckSql);
      const tableExists = tableCheckStmt.get();
      
      if (!tableExists) {
        console.log('test_table does not exist, returning empty array');
        return {
          success: true,
          data: []
        };
      }
      
      const sql = 'SELECT * FROM test_table ORDER BY created_at DESC';
      const stmt = this.db.prepare(sql);
      const rows = stmt.all() as TestRecord[];
      
      console.log('Raw database result:', rows);
      console.log('Is array?', Array.isArray(rows));
      
      // Ensure rows is an array
      const safeRows = Array.isArray(rows) ? rows : [];
      
      return {
        success: true,
        data: safeRows
      };
    } catch (error) {
      console.error('Error fetching test records:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get test record by ID
   */
  public async getTestRecordById(id: number): Promise<DatabaseResult<TestRecord>> {
    try {
      const sql = 'SELECT * FROM test_table WHERE id = ?';
      const stmt = this.db.prepare(sql);
      const row = stmt.get(id) as TestRecord;
      
      if (!row) {
        return {
          success: false,
          error: 'Test record not found'
        };
      }
      
      return {
        success: true,
        data: row
      };
    } catch (error) {
      console.error('Error fetching test record:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Delete test record by ID
   */
  public async deleteTestRecord(id: number): Promise<DatabaseResult<boolean>> {
    try {
      const sql = 'DELETE FROM test_table WHERE id = ?';
      const stmt = this.db.prepare(sql);
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        return {
          success: false,
          error: 'Test record not found'
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error deleting test record:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get database information
   */
  public async getDatabaseInfo(): Promise<DatabaseResult<any>> {
    try {
      const sql = `
        SELECT 
          name,
          type,
          sql
        FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `;
      const stmt = this.db.prepare(sql);
      const tables = stmt.all();
      
      return {
        success: true,
        data: {
          tables
        }
      };
    } catch (error) {
      console.error('Error fetching database info:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}
