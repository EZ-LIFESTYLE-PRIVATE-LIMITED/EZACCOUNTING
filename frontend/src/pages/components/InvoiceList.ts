import { Invoice, InvoiceService, InvoiceFilters, InvoiceStatus } from '../../services/InvoiceService';
import { InvoiceRow, InvoiceRowProps } from './InvoiceRow';

// Types
export interface InvoiceListProps {
  invoiceService: InvoiceService;
  onView?: (invoice: Invoice) => void;
  onEdit?: (invoice: Invoice) => void;
  onDelete?: (invoice: Invoice) => void;
  onStatusChange?: (invoice: Invoice, newStatus: InvoiceStatus) => void;
  showFilters?: boolean;
  showSearch?: boolean;
}

export interface InvoiceListState {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  filters: InvoiceFilters;
  searchTerm: string;
}

/**
 * InvoiceList Component
 * Displays a table of invoices with search, filter, and action capabilities
 */
export class InvoiceList {
  private container: HTMLElement;
  private props: InvoiceListProps;
  private state: InvoiceListState;
  private invoiceRows: Map<string, InvoiceRow> = new Map();

  constructor(container: HTMLElement, props: InvoiceListProps) {
    this.container = container;
    this.props = props;
    this.state = {
      invoices: [],
      loading: false,
      error: null,
      filters: {},
      searchTerm: ''
    };
  }

  /**
   * Render the invoice list component
   */
  public render(): void {
    this.container.innerHTML = this.getInvoiceListHTML();
    this.attachEventListeners();
    this.loadInvoices();
  }

  /**
   * Get invoice list HTML structure
   */
  private getInvoiceListHTML(): string {
    return `
      <div class="invoice-list">
        <div class="invoice-list-header">
          <div class="list-title">
            <h2>All Invoices</h2>
            <div class="invoice-count">${this.state.invoices.length} invoices</div>
          </div>
        </div>

        ${this.getSearchAndFiltersHTML()}

        <div class="invoice-table-container">
          ${this.getTableHTML()}
        </div>

        ${this.getLoadingHTML()}
        ${this.getErrorHTML()}
        ${this.getEmptyStateHTML()}
      </div>
    `;
  }

  /**
   * Get search and filters HTML
   */
  private getSearchAndFiltersHTML(): string {
    if (!this.props.showSearch && !this.props.showFilters) {
      return '';
    }

    return `
      <div class="search-filters">
        ${this.props.showSearch ? this.getSearchHTML() : ''}
        ${this.props.showFilters ? this.getFiltersHTML() : ''}
      </div>
    `;
  }

  /**
   * Get search input HTML
   */
  private getSearchHTML(): string {
    return `
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            class="search-input" 
            placeholder="Search invoices..." 
            value="${this.state.searchTerm}"
          >
        </div>
      </div>
    `;
  }

  /**
   * Get filters HTML
   */
  private getFiltersHTML(): string {
    return `
      <div class="filters-container">
        <button class="filter-button" type="button">
          <span class="filter-icon">🔽</span>
          <span class="filter-text">Filter</span>
        </button>
        
        <div class="filter-dropdown" style="display: none;">
          <div class="filter-section">
            <label>Status</label>
            <select class="status-filter">
              <option value="">All Status</option>
              <option value="DRAFT" ${this.state.filters.status === InvoiceStatus.DRAFT ? 'selected' : ''}>Draft</option>
              <option value="SENT" ${this.state.filters.status === InvoiceStatus.SENT ? 'selected' : ''}>Sent</option>
              <option value="PENDING" ${this.state.filters.status === InvoiceStatus.PENDING ? 'selected' : ''}>Pending</option>
              <option value="PAID" ${this.state.filters.status === InvoiceStatus.PAID ? 'selected' : ''}>Paid</option>
              <option value="OVERDUE" ${this.state.filters.status === InvoiceStatus.OVERDUE ? 'selected' : ''}>Overdue</option>
              <option value="CANCELLED" ${this.state.filters.status === InvoiceStatus.CANCELLED ? 'selected' : ''}>Cancelled</option>
            </select>
          </div>
          
          <div class="filter-actions">
            <button class="apply-filters-btn" type="button">Apply</button>
            <button class="clear-filters-btn" type="button">Clear</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Get table HTML structure
   */
  private getTableHTML(): string {
    return `
      <table class="invoice-table">
        <thead>
          <tr>
            <th class="col-invoice-id">Invoice ID</th>
            <th class="col-customer">Customer</th>
            <th class="col-amount">Amount</th>
            <th class="col-gst">GST</th>
            <th class="col-date">Date</th>
            <th class="col-due-date">Due Date</th>
            <th class="col-status">Status</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody class="invoice-table-body">
          ${this.getInvoiceRowsHTML()}
        </tbody>
      </table>
    `;
  }

  /**
   * Get invoice rows HTML
   */
  private getInvoiceRowsHTML(): string {
    if (this.state.loading) {
      return `
        <tr class="loading-row">
          <td colspan="8" class="loading-cell">
            <div class="loading-spinner">⏳</div>
            <span>Loading invoices...</span>
          </td>
        </tr>
      `;
    }

    if (this.state.invoices.length === 0) {
      return `
        <tr class="empty-row">
          <td colspan="8" class="empty-cell">
            <div class="empty-state">
              <div class="empty-icon">📄</div>
              <h3>No invoices found</h3>
              <p>Create your first invoice to get started</p>
            </div>
          </td>
        </tr>
      `;
    }

    return this.state.invoices.map(invoice => 
      `<tr class="invoice-row-placeholder" data-invoice-id="${invoice.id}"></tr>`
    ).join('');
  }

  /**
   * Get loading HTML
   */
  private getLoadingHTML(): string {
    return `
      <div class="loading-overlay" style="display: ${this.state.loading ? 'block' : 'none'}">
        <div class="loading-spinner">⏳</div>
        <p>Loading invoices...</p>
      </div>
    `;
  }

  /**
   * Get error HTML
   */
  private getErrorHTML(): string {
    return `
      <div class="error-message" style="display: ${this.state.error ? 'block' : 'none'}">
        <div class="error-icon">⚠️</div>
        <h3>Error Loading Invoices</h3>
        <p>${this.state.error}</p>
        <button class="retry-button" type="button">Retry</button>
      </div>
    `;
  }

  /**
   * Get empty state HTML
   */
  private getEmptyStateHTML(): string {
    if (this.state.invoices.length > 0 || this.state.loading || this.state.error) {
      return '';
    }

    return `
      <div class="empty-state">
        <div class="empty-icon">📄</div>
        <h3>No invoices yet</h3>
        <p>Create your first invoice to get started with GST management</p>
        <button class="create-first-invoice-btn" type="button">Create Invoice</button>
      </div>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Search input
    const searchInput = this.container.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (event) => {
        const target = event.target as HTMLInputElement;
        this.handleSearch(target.value);
      });
    }

    // Filter button
    const filterButton = this.container.querySelector('.filter-button');
    if (filterButton) {
      filterButton.addEventListener('click', this.toggleFilterDropdown.bind(this));
    }

    // Filter dropdown
    const statusFilter = this.container.querySelector('.status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement;
        this.handleStatusFilter(target.value);
      });
    }

    // Apply filters
    const applyFiltersBtn = this.container.querySelector('.apply-filters-btn');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', this.applyFilters.bind(this));
    }

    // Clear filters
    const clearFiltersBtn = this.container.querySelector('.clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', this.clearFilters.bind(this));
    }

    // Retry button
    const retryButton = this.container.querySelector('.retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', this.loadInvoices.bind(this));
    }

    // Create first invoice button
    const createFirstBtn = this.container.querySelector('.create-first-invoice-btn');
    if (createFirstBtn) {
      createFirstBtn.addEventListener('click', () => {
        // This would typically open a create invoice modal
        console.log('Create first invoice clicked');
      });
    }
  }

  /**
   * Load invoices from service
   */
  private async loadInvoices(): Promise<void> {
    this.setState({ loading: true, error: null });
    
    try {
      const invoices = await this.props.invoiceService.getInvoices(this.state.filters);
      this.setState({ invoices, loading: false });
      this.renderInvoiceRows();
    } catch (error) {
      this.setState({ 
        error: error instanceof Error ? error.message : 'Failed to load invoices',
        loading: false 
      });
    }
  }

  /**
   * Render invoice rows
   */
  private renderInvoiceRows(): void {
    const tbody = this.container.querySelector('.invoice-table-body');
    if (!tbody) return;

    // Clear existing rows
    this.invoiceRows.clear();
    tbody.innerHTML = '';

    // Create new rows
    this.state.invoices.forEach(invoice => {
      const rowElement = document.createElement('tr');
      rowElement.className = 'invoice-row-placeholder';
      rowElement.setAttribute('data-invoice-id', invoice.id);
      tbody.appendChild(rowElement);

      const rowProps: InvoiceRowProps = {
        invoice,
        onView: this.props.onView,
        onEdit: this.props.onEdit,
        onDelete: this.props.onDelete,
        onStatusChange: this.props.onStatusChange
      };

      const invoiceRow = new InvoiceRow(rowElement, rowProps);
      invoiceRow.render();
      this.invoiceRows.set(invoice.id, invoiceRow);
    });
  }

  /**
   * Handle search input
   */
  private handleSearch(searchTerm: string): void {
    this.setState({ searchTerm });
    
    // Debounce search
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.applyFilters();
    }, 300);
  }

  /**
   * Handle status filter change
   */
  private handleStatusFilter(status: string): void {
    const filters = { ...this.state.filters };
    
    if (status) {
      filters.status = status as InvoiceStatus;
    } else {
      delete filters.status;
    }
    
    this.setState({ filters });
  }

  /**
   * Toggle filter dropdown
   */
  private toggleFilterDropdown(): void {
    const dropdown = this.container.querySelector('.filter-dropdown') as HTMLElement;
    if (dropdown) {
      const isVisible = dropdown.style.display !== 'none';
      dropdown.style.display = isVisible ? 'none' : 'block';
    }
  }

  /**
   * Apply filters
   */
  private applyFilters(): void {
    const filters = { ...this.state.filters };
    
    if (this.state.searchTerm) {
      filters.searchTerm = this.state.searchTerm;
    } else {
      delete filters.searchTerm;
    }
    
    this.setState({ filters });
    this.loadInvoices();
  }

  /**
   * Clear all filters
   */
  private clearFilters(): void {
    this.setState({ 
      filters: {},
      searchTerm: ''
    });
    
    // Reset UI elements
    const searchInput = this.container.querySelector('.search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    
    const statusFilter = this.container.querySelector('.status-filter') as HTMLSelectElement;
    if (statusFilter) {
      statusFilter.value = '';
    }
    
    this.loadInvoices();
  }

  /**
   * Update state and re-render if needed
   */
  private setState(newState: Partial<InvoiceListState>): void {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Refresh the invoice list
   */
  public refresh(): void {
    this.loadInvoices();
  }

  /**
   * Add new invoice to the list
   */
  public addInvoice(invoice: Invoice): void {
    const invoices = [invoice, ...this.state.invoices];
    this.setState({ invoices });
    this.renderInvoiceRows();
  }

  /**
   * Update invoice in the list
   */
  public updateInvoice(invoice: Invoice): void {
    const invoices = this.state.invoices.map(inv => 
      inv.id === invoice.id ? invoice : inv
    );
    this.setState({ invoices });
    
    const invoiceRow = this.invoiceRows.get(invoice.id);
    if (invoiceRow) {
      invoiceRow.updateInvoice(invoice);
    }
  }

  /**
   * Remove invoice from the list
   */
  public removeInvoice(invoiceId: string): void {
    const invoices = this.state.invoices.filter(inv => inv.id !== invoiceId);
    this.setState({ invoices });
    
    const invoiceRow = this.invoiceRows.get(invoiceId);
    if (invoiceRow) {
      invoiceRow.destroy();
      this.invoiceRows.delete(invoiceId);
    }
    
    this.render();
  }

  /**
   * Get current state
   */
  public getState(): InvoiceListState {
    return { ...this.state };
  }

  /**
   * Destroy component and cleanup
   */
  public destroy(): void {
    // Cleanup search timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    
    // Destroy all invoice rows
    this.invoiceRows.forEach(row => row.destroy());
    this.invoiceRows.clear();
    
    this.container.innerHTML = '';
  }

  private searchTimeout: NodeJS.Timeout | null = null;
}
