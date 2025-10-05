import { Invoice, InvoiceService, InvoiceStatus } from '../services/InvoiceService';
import { Sidebar, NavigationItem } from './components/Sidebar';
import { Header } from './components/Header';
import { InvoiceList, InvoiceListProps } from './components/InvoiceList';

// Types
export interface InvoicePageProps {
  container: HTMLElement;
  invoiceService?: InvoiceService;
  showSidebar?: boolean;
  onNavigate?: (path: string) => void;
}

export interface InvoicePageState {
  currentView: string;
  sidebarVisible: boolean;
  loading: boolean;
}

/**
 * InvoicePage Component
 * Main page component that orchestrates all invoice-related functionality
 */
export class InvoicePage {
  private container: HTMLElement;
  private props: InvoicePageProps;
  private state: InvoicePageState;
  
  // Child components
  private sidebar: Sidebar | null = null;
  private header: Header | null = null;
  private invoiceList: InvoiceList | null = null;
  
  // Services
  private invoiceService: InvoiceService;

  constructor(props: InvoicePageProps) {
    this.container = props.container;
    this.props = props;
    this.state = {
      currentView: 'invoices',
      sidebarVisible: props.showSidebar ?? true,
      loading: false
    };

    // Initialize invoice service
    this.invoiceService = props.invoiceService || new InvoiceService({ dataSource: 'dummy' });
  }

  /**
   * Render the invoice page
   */
  public render(): void {
    this.container.innerHTML = this.getInvoicePageHTML();
    this.initializeComponents();
    this.attachEventListeners();
  }

  /**
   * Get invoice page HTML structure
   */
  private getInvoicePageHTML(): string {
    return `
      <div class="invoice-page">
        <div class="page-layout">
          ${this.state.sidebarVisible ? '<div class="sidebar-container"></div>' : ''}
          
          <div class="main-content">
            <div class="header-container"></div>
            <div class="content-container">
              <div class="invoice-list-container"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize child components
   */
  private initializeComponents(): void {
    // Initialize sidebar
    if (this.state.sidebarVisible) {
      const sidebarContainer = this.container.querySelector('.sidebar-container') as HTMLElement;
      if (sidebarContainer) {
        this.sidebar = new Sidebar(sidebarContainer, {
          currentPath: '/invoices',
          onNavigate: this.props.onNavigate
        });
        this.sidebar.render();
      }
    }

    // Initialize header
    const headerContainer = this.container.querySelector('.header-container') as HTMLElement;
    if (headerContainer) {
      this.header = new Header(headerContainer, {
        title: 'Dashboard',
        subtitle: 'Manage your GST and accounting',
        icon: '📊',
        showCreateButton: true,
        createButtonText: 'Create Invoice',
        createButtonIcon: '➕',
        onCreateClick: this.handleCreateInvoice.bind(this),
        showSidebarToggle: true,
        onSidebarToggle: this.toggleSidebar.bind(this)
      });
      this.header.render();
    }

    // Initialize invoice list
    const invoiceListContainer = this.container.querySelector('.invoice-list-container') as HTMLElement;
    if (invoiceListContainer) {
      const invoiceListProps: InvoiceListProps = {
        invoiceService: this.invoiceService,
        onView: this.handleViewInvoice.bind(this),
        onEdit: this.handleEditInvoice.bind(this),
        onDelete: this.handleDeleteInvoice.bind(this),
        onStatusChange: this.handleStatusChange.bind(this),
        showFilters: true,
        showSearch: true
      };

      this.invoiceList = new InvoiceList(invoiceListContainer, invoiceListProps);
      this.invoiceList.render();
    }
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Global keyboard shortcuts
    document.addEventListener('keydown', this.handleKeydown.bind(this));
    
    // Window resize handling
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeydown(event: KeyboardEvent): void {
    // Only handle shortcuts when this page is active
    if (!this.container.contains(document.activeElement)) return;

    // Ctrl/Cmd + N: Create new invoice
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      this.handleCreateInvoice();
    }

    // Escape: Close any open modals/dropdowns
    if (event.key === 'Escape') {
      this.handleEscape();
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    // Adjust layout based on screen size
    const isSmallScreen = window.innerWidth < 768;
    if (isSmallScreen && this.state.sidebarVisible) {
      this.hideSidebar();
    }
  }

  /**
   * Handle create invoice action
   */
  private handleCreateInvoice(): void {
    console.log('Create invoice clicked');
    
    // Show loading state on create button
    if (this.header) {
      this.header.setCreateButtonLoading(true);
    }

    // Simulate API call
    setTimeout(() => {
      if (this.header) {
        this.header.setCreateButtonLoading(false);
      }
      
      // Here you would typically open a create invoice modal
      this.showCreateInvoiceModal();
    }, 1000);
  }

  /**
   * Handle view invoice action
   */
  private handleViewInvoice(invoice: Invoice): void {
    console.log('View invoice:', invoice);
    
    // Here you would typically open an invoice view modal or navigate to detail page
    this.showInvoiceDetailModal(invoice);
  }

  /**
   * Handle edit invoice action
   */
  private handleEditInvoice(invoice: Invoice): void {
    console.log('Edit invoice:', invoice);
    
    // Here you would typically open an edit invoice modal
    this.showEditInvoiceModal(invoice);
  }

  /**
   * Handle delete invoice action
   */
  private handleDeleteInvoice(invoice: Invoice): void {
    console.log('Delete invoice:', invoice);
    
    // Show confirmation dialog
    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}?`)) {
      this.deleteInvoice(invoice);
    }
  }

  /**
   * Handle status change action
   */
  private handleStatusChange(invoice: Invoice, newStatus: InvoiceStatus): void {
    console.log('Status change:', invoice.invoiceNumber, newStatus);
    
    // Update invoice status
    this.updateInvoiceStatus(invoice, newStatus);
  }

  /**
   * Toggle sidebar visibility
   */
  private toggleSidebar(): void {
    if (this.state.sidebarVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }

  /**
   * Show sidebar
   */
  private showSidebar(): void {
    this.state.sidebarVisible = true;
    
    const sidebarContainer = this.container.querySelector('.sidebar-container') as HTMLElement;
    if (sidebarContainer) {
      sidebarContainer.style.display = 'block';
      
      // Re-initialize sidebar if it was destroyed
      if (!this.sidebar) {
        this.sidebar = new Sidebar(sidebarContainer, {
          currentPath: '/invoices',
          onNavigate: this.props.onNavigate
        });
        this.sidebar.render();
      }
    }
  }

  /**
   * Hide sidebar
   */
  private hideSidebar(): void {
    this.state.sidebarVisible = false;
    
    const sidebarContainer = this.container.querySelector('.sidebar-container') as HTMLElement;
    if (sidebarContainer) {
      sidebarContainer.style.display = 'none';
    }
  }

  /**
   * Handle escape key
   */
  private handleEscape(): void {
    // Close any open modals, dropdowns, etc.
    console.log('Escape pressed - closing modals');
  }

  /**
   * Show create invoice modal
   */
  private showCreateInvoiceModal(): void {
    // TODO: Implement create invoice modal
    alert('Create Invoice Modal - To be implemented');
  }

  /**
   * Show invoice detail modal
   */
  private showInvoiceDetailModal(invoice: Invoice): void {
    // TODO: Implement invoice detail modal
    alert(`Invoice Detail Modal for ${invoice.invoiceNumber} - To be implemented`);
  }

  /**
   * Show edit invoice modal
   */
  private showEditInvoiceModal(invoice: Invoice): void {
    // TODO: Implement edit invoice modal
    alert(`Edit Invoice Modal for ${invoice.invoiceNumber} - To be implemented`);
  }

  /**
   * Delete invoice
   */
  private async deleteInvoice(invoice: Invoice): Promise<void> {
    try {
      await this.invoiceService.deleteInvoice(invoice.id);
      
      // Update the invoice list
      if (this.invoiceList) {
        this.invoiceList.removeInvoice(invoice.id);
      }
      
      console.log(`Invoice ${invoice.invoiceNumber} deleted successfully`);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert(`Failed to delete invoice: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update invoice status
   */
  private async updateInvoiceStatus(invoice: Invoice, newStatus: InvoiceStatus): Promise<void> {
    try {
      const updatedInvoice = await this.invoiceService.updateInvoice(invoice.id, {
        status: newStatus
      });
      
      // Update the invoice list
      if (this.invoiceList) {
        this.invoiceList.updateInvoice(updatedInvoice);
      }
      
      console.log(`Invoice ${invoice.invoiceNumber} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating invoice status:', error);
      alert(`Failed to update invoice status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Refresh the page data
   */
  public refresh(): void {
    if (this.invoiceList) {
      this.invoiceList.refresh();
    }
  }

  /**
   * Update invoice service configuration
   */
  public updateInvoiceService(config: { dataSource: 'dummy' | 'database' | 'api'; apiBaseUrl?: string }): void {
    this.invoiceService.updateConfig(config);
    this.refresh();
  }

  /**
   * Get current state
   */
  public getState(): InvoicePageState {
    return { ...this.state };
  }

  /**
   * Get invoice service
   */
  public getInvoiceService(): InvoiceService {
    return this.invoiceService;
  }

  /**
   * Destroy component and cleanup
   */
  public destroy(): void {
    // Remove event listeners
    document.removeEventListener('keydown', this.handleKeydown);
    window.removeEventListener('resize', this.handleResize);
    
    // Destroy child components
    if (this.sidebar) {
      this.sidebar.destroy();
      this.sidebar = null;
    }
    
    if (this.header) {
      this.header.destroy();
      this.header = null;
    }
    
    if (this.invoiceList) {
      this.invoiceList.destroy();
      this.invoiceList = null;
    }
    
    // Clear container
    this.container.innerHTML = '';
  }
}
