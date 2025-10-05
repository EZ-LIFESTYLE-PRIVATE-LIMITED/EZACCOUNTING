import { Invoice, InvoiceStatus } from '../../services/InvoiceService';

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
          <span class="action-icon">👁️</span>
        </button>
        
        <button class="action-btn edit-btn" type="button" title="Edit Invoice" data-action="edit">
          <span class="action-icon">✏️</span>
        </button>
        
        <button class="action-btn delete-btn" type="button" title="Delete Invoice" data-action="delete">
          <span class="action-icon">🗑️</span>
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
      case InvoiceStatus.PAID:
        return 'status-paid';
      case InvoiceStatus.PENDING:
        return 'status-pending';
      case InvoiceStatus.OVERDUE:
        return 'status-overdue';
      case InvoiceStatus.DRAFT:
        return 'status-draft';
      case InvoiceStatus.SENT:
        return 'status-sent';
      case InvoiceStatus.CANCELLED:
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
      case InvoiceStatus.PAID:
        return 'Paid';
      case InvoiceStatus.PENDING:
        return 'Pending';
      case InvoiceStatus.OVERDUE:
        return 'Overdue';
      case InvoiceStatus.DRAFT:
        return 'Draft';
      case InvoiceStatus.SENT:
        return 'Sent';
      case InvoiceStatus.CANCELLED:
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
    return dueDate < today && this.invoice.status !== InvoiceStatus.PAID;
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
