// Database model interfaces

export interface TestRecord {
  id?: number;
  name: string;
  value: string;
  created_at?: string;
}

export interface Account {
  id?: number;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id?: number;
  account_id: number;
  description: string;
  amount: number;
  transaction_type: 'debit' | 'credit';
  date?: string;
  created_at?: string;
}

export interface DatabaseInfo {
  dbPath: string;
  tables: Array<{
    name: string;
    type: string;
    sql: string;
  }>;
}

export interface DatabaseResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
