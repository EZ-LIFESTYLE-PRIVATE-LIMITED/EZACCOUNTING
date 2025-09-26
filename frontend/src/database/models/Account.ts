import { Account as IAccount } from '../../types/database';

export class Account implements IAccount {
  public id?: number;
  public name: string;
  public type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  public balance: number;
  public created_at?: string;
  public updated_at?: string;

  constructor(data: Partial<IAccount>) {
    this.id = data.id;
    this.name = data.name || '';
    this.type = data.type || 'asset';
    this.balance = data.balance || 0;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  /**
   * Convert to plain object
   */
  public toObject(): IAccount {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      balance: this.balance,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }

  /**
   * Create from database row
   */
  public static fromRow(row: any): Account {
    return new Account({
      id: row.id,
      name: row.name,
      type: row.type,
      balance: row.balance,
      created_at: row.created_at,
      updated_at: row.updated_at
    });
  }

  /**
   * Validate account data
   */
  public validate(): string[] {
    const errors: string[] = [];
    
    if (!this.name.trim()) {
      errors.push('Account name is required');
    }
    
    if (!['asset', 'liability', 'equity', 'income', 'expense'].includes(this.type)) {
      errors.push('Invalid account type');
    }
    
    if (typeof this.balance !== 'number' || isNaN(this.balance)) {
      errors.push('Balance must be a valid number');
    }
    
    return errors;
  }
}
