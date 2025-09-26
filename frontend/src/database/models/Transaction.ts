import { Transaction as ITransaction } from '../../types/database';

export class Transaction implements ITransaction {
  public id?: number;
  public account_id: number;
  public description: string;
  public amount: number;
  public transaction_type: 'debit' | 'credit';
  public date?: string;
  public created_at?: string;

  constructor(data: Partial<ITransaction>) {
    this.id = data.id;
    this.account_id = data.account_id || 0;
    this.description = data.description || '';
    this.amount = data.amount || 0;
    this.transaction_type = data.transaction_type || 'debit';
    this.date = data.date;
    this.created_at = data.created_at;
  }

  /**
   * Convert to plain object
   */
  public toObject(): ITransaction {
    return {
      id: this.id,
      account_id: this.account_id,
      description: this.description,
      amount: this.amount,
      transaction_type: this.transaction_type,
      date: this.date,
      created_at: this.created_at
    };
  }

  /**
   * Create from database row
   */
  public static fromRow(row: any): Transaction {
    return new Transaction({
      id: row.id,
      account_id: row.account_id,
      description: row.description,
      amount: row.amount,
      transaction_type: row.transaction_type,
      date: row.date,
      created_at: row.created_at
    });
  }

  /**
   * Validate transaction data
   */
  public validate(): string[] {
    const errors: string[] = [];
    
    if (!this.account_id || this.account_id <= 0) {
      errors.push('Valid account ID is required');
    }
    
    if (!this.description.trim()) {
      errors.push('Transaction description is required');
    }
    
    if (typeof this.amount !== 'number' || isNaN(this.amount) || this.amount <= 0) {
      errors.push('Amount must be a positive number');
    }
    
    if (!['debit', 'credit'].includes(this.transaction_type)) {
      errors.push('Transaction type must be debit or credit');
    }
    
    return errors;
  }
}
