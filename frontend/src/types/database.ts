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

// Invoice-related interfaces
export interface Org {
  org_id: number;
  name: string;
  user_name: string | null;
  gstin: string | null;
  state: string | null;
  city_state: string | null;
  email: string | null;
  phone: string | null;
  business_address: string | null;
  invoice_series: string | null;
  signature_url: string | null;
  org_type: 'BUSINESS' | 'CUSTOMER' | 'SUPPLIER';
  created_at: Date;
  updated_at: Date;
}

export interface Item {
  item_id: number;
  item_name: string;
  item_description: string | null;
  item_sku: string | null;
  item_gst: number;
  item_unit_price: number;
  item_category: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  invoice_item_id: number;
  invoice_id: number;
  item_id: number;
  quantity: number;
  unit_price: number;
  item_total_amount: number;
  item_gst_amount: number;
  item_net_amount: number;
  created_at: Date;
  updated_at: Date;
  item?: Item;
}

export interface Invoice {
  invoice_id: number;
  invoice_number: string;
  org_id: number;
  invoice_date: Date;
  due_date: Date | null;
  status: InvoiceStatus;
  total_amount: number;
  gst_amount: number;
  net_amount: number;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
  org?: Org;
  invoice_items?: InvoiceItem[];
}

// Enums
export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
export type OrgType = 'BUSINESS' | 'CUSTOMER' | 'SUPPLIER';

// Enum values for easier usage
export const InvoiceStatusEnum = {
  DRAFT: 'DRAFT' as InvoiceStatus,
  SENT: 'SENT' as InvoiceStatus,
  PAID: 'PAID' as InvoiceStatus,
  OVERDUE: 'OVERDUE' as InvoiceStatus,
  CANCELLED: 'CANCELLED' as InvoiceStatus
} as const;

// Invoice filters and search
export interface InvoiceFilters {
  status?: InvoiceStatus;
  customerId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  searchTerm?: string;
  search?: string; // Alias for searchTerm for backward compatibility
}

// Invoice statistics
export interface InvoiceStats {
  total: number;
  totalAmount: number;
  draft: number;
  sent: number;
  paid: number;
  overdue: number;
}
