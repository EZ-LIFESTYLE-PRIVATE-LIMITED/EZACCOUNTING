import { Invoice, InvoiceStatus } from '../../types/database';

// Types
export interface InvoiceRowProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onStatusChange?: (invoice: Invoice, newStatus: InvoiceStatus) => void;
}

/**
 * InvoiceRow Component
 * Displays individual invoice data in table row format
 */
export class InvoiceRow {
  private container: HTMLElement;
  private props: InvoiceRowProps;
  private invoice: Invoice;

  constructor(container: HTMLElement, props: InvoiceRowProps) {
    this.container = container;
    this.props = props;
    this.invoice = props.invoice;
  }

  /**
   * Render the invoice row component
   */
  public render(): void {
    this.container.innerHTML = this.getInvoiceRowHTML();
    this.attachEventListeners();
  }

  /**
   * Get invoice row HTML structure
   */
  private getInvoiceRowHTML(): string {
    return `
      <tr class="invoice-row" data-invoice-id="${this.invoice.invoice_id}">
        <td class="invoice-id">
          <span class="invoice-number">${this.invoice.invoice_number}</span>
        </td>
        
        <td class="customer-info">
          <div class="customer-name">${this.invoice.org?.name || 'N/A'}</div>
          ${this.invoice.org?.org_id ? `<div class="customer-id">${this.invoice.org.org_id}</div>` : ''}
        </td>
        
        <td class="amount">
          <div class="amount-value">₹${this.formatCurrency(this.invoice.total_amount)}</div>
        </td>
        
        <td class="gst-amount">
          <div class="gst-value">₹${this.formatCurrency(this.invoice.gst_amount)}</div>
        </td>
        
        <td class="date">
          <div class="date-value">${this.formatDate(this.invoice.invoice_date)}</div>
        </td>
        
        <td class="due-date">
          <div class="due-date-value">${this.formatDate(this.invoice.due_date)}</div>
        </td>
        
        <td class="status">
          ${this.getStatusBadgeHTML()}
        </td>
        
        <td class="actions">
          ${this.getActionsHTML()}
        </td>
      </tr>
    `;
  }

  /**
   * Get status badge HTML
   */
  private getStatusBadgeHTML(): string {
    const statusClass = this.getStatusClass(this.invoice.status);
    const statusText = this.getStatusText(this.invoice.status);
    
    return `
      <span class="status-badge ${statusClass}">
        ${statusText}
      </span>
    `;
  }

  /**
   * Get actions HTML
   */
  private getActionsHTML(): string {
    return `
      <div class="action-buttons">
        <button class="action-btn view-btn" type="button" title="View Invoice" data-action="view">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-icon lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
        </button>
        
        <button class="action-btn edit-btn" type="button" title="Edit Invoice" data-action="edit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-icon lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
        </button>
        
        <button class="action-btn delete-btn" type="button" title="Delete Invoice" data-action="delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="action-icon lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
        </button>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const actionButtons = this.container.querySelectorAll('.action-btn');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const action = button.getAttribute('data-action');
        this.handleAction(action);
      });
    });

    // Row click for view action
    const row = this.container.querySelector('.invoice-row') as HTMLElement;
    if (row && this.props.onView) {
      row.addEventListener('click', (event) => {
        // Don't trigger if clicking on action buttons
        if (!(event.target as HTMLElement).closest('.action-buttons')) {
          this.handleAction('view');
        }
      });
    }
  }

  /**
   * Handle action button clicks
   */
  private handleAction(action: string | null): void {
    if (!action) return;

    switch (action) {
      case 'view':
        if (this.props.onView) {
          this.props.onView(this.invoice);
        }
        break;
      
      case 'edit':
        if (this.props.onEdit) {
          this.props.onEdit(this.invoice);
        }
        break;
      
      case 'delete':
        if (this.props.onDelete) {
          this.props.onDelete(this.invoice);
        }
        break;
    }
  }

  /**
   * Update invoice data and re-render
   */
  public updateInvoice(invoice: Invoice): void {
    this.invoice = invoice;
    this.render();
  }

  /**
   * Get status CSS class
   */
  private getStatusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'PAID':
        return 'status-paid';
      case 'OVERDUE':
        return 'status-overdue';
      case 'DRAFT':
        return 'status-draft';
      case 'SENT':
        return 'status-sent';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }

  /**
   * Get status display text
   */
  private getStatusText(status: InvoiceStatus): string {
    switch (status) {
      case 'PAID':
        return 'Paid';
      case 'OVERDUE':
        return 'Overdue';
      case 'DRAFT':
        return 'Draft';
      case 'SENT':
        return 'Sent';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  /**
   * Format currency values
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format date values
   */
  private formatDate(dateInput: Date | string | null): string {
    if (!dateInput) return 'N/A';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Check if invoice is overdue
   */
  private isOverdue(): boolean {
    if (!this.invoice.due_date) return false;
    const dueDate = typeof this.invoice.due_date === 'string' ? new Date(this.invoice.due_date) : this.invoice.due_date;
    const today = new Date();
    return dueDate < today && this.invoice.status !== 'PAID';
  }

  /**
   * Highlight row based on status
   */
  public highlight(status: 'success' | 'warning' | 'error' | 'none'): void {
    const row = this.container.querySelector('.invoice-row') as HTMLElement;
    if (row) {
      row.className = `invoice-row highlight-${status}`;
    }
  }

  /**
   * Remove highlight
   */
  public removeHighlight(): void {
    const row = this.container.querySelector('.invoice-row') as HTMLElement;
    if (row) {
      row.className = 'invoice-row';
    }
  }

  /**
   * Show loading state
   */
  public showLoading(): void {
    const actions = this.container.querySelector('.actions');
    if (actions) {
      actions.innerHTML = '<div class="loading-spinner">⏳</div>';
    }
  }

  /**
   * Hide loading state
   */
  public hideLoading(): void {
    this.render();
  }

  /**
   * Get current invoice data
   */
  public getInvoice(): Invoice {
    return { ...this.invoice };
  }

  /**
   * Destroy component and cleanup
   */
  public destroy(): void {
    const actionButtons = this.container.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
      button.removeEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const action = button.getAttribute('data-action');
        this.handleAction(action);
      });
    });

    const row = this.container.querySelector('.invoice-row');
    if (row) {
      row.removeEventListener('click', (event) => {
        // Don't trigger if clicking on action buttons
        if (!(event.target as HTMLElement).closest('.action-buttons')) {
          this.handleAction('view');
        }
      });
    }

    this.container.innerHTML = '';
  }
}
