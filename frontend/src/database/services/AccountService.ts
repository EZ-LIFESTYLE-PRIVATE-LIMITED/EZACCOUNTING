import Database from 'better-sqlite3';
import { Account } from '../../types/database';
import { DatabaseResult } from '../../types/database';

export class AccountService {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
  }

  /**
   * Create a new account
   */
  public async createAccount(account: Omit<Account, 'id' | 'created_at' | 'updated_at'>): Promise<DatabaseResult<number>> {
    try {
      const sql = `
        INSERT INTO accounts (name, type, balance) 
        VALUES (?, ?, ?)
      `;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(account.name, account.type, account.balance);
      
      console.log('Account created with ID:', result.lastInsertRowid);
      return {
        success: true,
        data: result.lastInsertRowid as number
      };
    } catch (error) {
      console.error('Error creating account:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get all accounts
   */
  public async getAllAccounts(): Promise<DatabaseResult<Account[]>> {
    try {
      const sql = 'SELECT * FROM accounts ORDER BY type, name';
      const stmt = this.db.prepare(sql);
      const rows = stmt.all() as Account[];
      
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get account by ID
   */
  public async getAccountById(id: number): Promise<DatabaseResult<Account>> {
    try {
      const sql = 'SELECT * FROM accounts WHERE id = ?';
      const stmt = this.db.prepare(sql);
      const row = stmt.get(id) as Account;
      
      if (!row) {
        return {
          success: false,
          error: 'Account not found'
        };
      }
      
      return {
        success: true,
        data: row
      };
    } catch (error) {
      console.error('Error fetching account:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Update account
   */
  public async updateAccount(id: number, updates: Partial<Account>): Promise<DatabaseResult<boolean>> {
    try {
      const sql = `
        UPDATE accounts 
        SET name = ?, type = ?, balance = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(updates.name, updates.type, updates.balance, id);
      
      if (result.changes === 0) {
        return {
          success: false,
          error: 'Account not found'
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error updating account:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Delete account
   */
  public async deleteAccount(id: number): Promise<DatabaseResult<boolean>> {
    try {
      // Check if account has transactions
      const checkSql = 'SELECT COUNT(*) as count FROM transactions WHERE account_id = ?';
      const checkStmt = this.db.prepare(checkSql);
      const result = checkStmt.get(id) as { count: number };
      
      if (result.count > 0) {
        return {
          success: false,
          error: 'Cannot delete account with existing transactions'
        };
      }
      
      const sql = 'DELETE FROM accounts WHERE id = ?';
      const stmt = this.db.prepare(sql);
      const deleteResult = stmt.run(id);
      
      if (deleteResult.changes === 0) {
        return {
          success: false,
          error: 'Account not found'
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get accounts by type
   */
  public async getAccountsByType(type: Account['type']): Promise<DatabaseResult<Account[]>> {
    try {
      const sql = 'SELECT * FROM accounts WHERE type = ? ORDER BY name';
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(type) as Account[];
      
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error fetching accounts by type:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}
