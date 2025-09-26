import Database from 'better-sqlite3';
import { Transaction } from '../../types/database';
import { DatabaseResult } from '../../types/database';

export class TransactionService {
  private db: Database.Database;

  constructor(database: Database.Database) {
    this.db = database;
  }

  /**
   * Create a new transaction
   */
  public async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<DatabaseResult<number>> {
    try {
      const sql = `
        INSERT INTO transactions (account_id, description, amount, transaction_type, date) 
        VALUES (?, ?, ?, ?, ?)
      `;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(
        transaction.account_id,
        transaction.description,
        transaction.amount,
        transaction.transaction_type,
        transaction.date || new Date().toISOString()
      );
      
      console.log('Transaction created with ID:', result.lastInsertRowid);
      return {
        success: true,
        data: result.lastInsertRowid as number
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get all transactions
   */
  public async getAllTransactions(): Promise<DatabaseResult<Transaction[]>> {
    try {
      const sql = `
        SELECT t.*, a.name as account_name 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id 
        ORDER BY t.date DESC, t.created_at DESC
      `;
      const stmt = this.db.prepare(sql);
      const rows = stmt.all() as Transaction[];
      
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get transactions by account ID
   */
  public async getTransactionsByAccount(accountId: number): Promise<DatabaseResult<Transaction[]>> {
    try {
      const sql = `
        SELECT t.*, a.name as account_name 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id 
        WHERE t.account_id = ? 
        ORDER BY t.date DESC, t.created_at DESC
      `;
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(accountId) as Transaction[];
      
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error fetching transactions by account:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get transaction by ID
   */
  public async getTransactionById(id: number): Promise<DatabaseResult<Transaction>> {
    try {
      const sql = `
        SELECT t.*, a.name as account_name 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id 
        WHERE t.id = ?
      `;
      const stmt = this.db.prepare(sql);
      const row = stmt.get(id) as Transaction;
      
      if (!row) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }
      
      return {
        success: true,
        data: row
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Update transaction
   */
  public async updateTransaction(id: number, updates: Partial<Transaction>): Promise<DatabaseResult<boolean>> {
    try {
      const sql = `
        UPDATE transactions 
        SET account_id = ?, description = ?, amount = ?, 
            transaction_type = ?, date = ?
        WHERE id = ?
      `;
      const stmt = this.db.prepare(sql);
      const result = stmt.run(
        updates.account_id,
        updates.description,
        updates.amount,
        updates.transaction_type,
        updates.date,
        id
      );
      
      if (result.changes === 0) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error updating transaction:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Delete transaction
   */
  public async deleteTransaction(id: number): Promise<DatabaseResult<boolean>> {
    try {
      const sql = 'DELETE FROM transactions WHERE id = ?';
      const stmt = this.db.prepare(sql);
      const result = stmt.run(id);
      
      if (result.changes === 0) {
        return {
          success: false,
          error: 'Transaction not found'
        };
      }
      
      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }

  /**
   * Get transactions by date range
   */
  public async getTransactionsByDateRange(startDate: string, endDate: string): Promise<DatabaseResult<Transaction[]>> {
    try {
      const sql = `
        SELECT t.*, a.name as account_name 
        FROM transactions t 
        LEFT JOIN accounts a ON t.account_id = a.id 
        WHERE t.date BETWEEN ? AND ? 
        ORDER BY t.date DESC, t.created_at DESC
      `;
      const stmt = this.db.prepare(sql);
      const rows = stmt.all(startDate, endDate) as Transaction[];
      
      return {
        success: true,
        data: rows
      };
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      return {
        success: false,
        error: (error as Error).message
      };
    }
  }
}
