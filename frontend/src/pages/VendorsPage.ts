import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Vendor interface (based on Org model)
export interface Vendor {
    org_id: number;
    name: string;
    gstin?: string;
    state?: string;
    email?: string;
    phone?: string;
    business_address?: string;
    org_type: 'CUSTOMER' | 'SUPPLIER';
    created_at?: Date;
    updated_at?: Date;
}

export interface VendorsPageProps {
    container: HTMLElement;
    showSidebar?: boolean;
    onNavigate?: (path: string) => void;
}

/**
 * VendorsPage Component
 * Main page for managing customers and suppliers
 */
export class VendorsPage {
    private container: HTMLElement;
    private props: VendorsPageProps;
    private vendors: Vendor[] = [];
    private sidebar: Sidebar | null = null;
    private header: Header | null = null;
    private editingVendor: Vendor | null = null;
    private currentFilter: 'ALL' | 'CUSTOMER' | 'SUPPLIER' = 'ALL';

    constructor(props: VendorsPageProps) {
        this.container = props.container;
        this.props = props;
    }

    public async render(): Promise<void> {
        this.container.innerHTML = this.getPageHTML();
        this.initializeComponents();
        this.attachEventListeners();
        await this.loadVendors();
    }

    private getPageHTML(): string {
        return `
      <div class="vendors-page">
        <div class="page-layout">
          ${this.props.showSidebar ? '<div class="sidebar-container"></div>' : ''}
          <div class="main-content">
            <div class="header-container"></div>
            <div class="content-container">
              <div class="vendors-toolbar">
                <div class="filter-tabs">
                  <button class="filter-tab active" data-filter="ALL">All</button>
                  <button class="filter-tab" data-filter="CUSTOMER">Customers</button>
                  <button class="filter-tab" data-filter="SUPPLIER">Suppliers</button>
                </div>
                <div class="toolbar-right">
                  <div class="search-box">
                    <input type="text" id="vendor-search" placeholder="Search vendors..." class="search-input">
                  </div>
                  <button id="add-vendor-btn" class="btn btn-primary">
                    <span class="btn-icon">➕</span>
                    Add Vendor
                  </button>
                </div>
              </div>
              <div class="vendors-table-container">
                <table class="vendors-table" id="vendors-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>GSTIN</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>State</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="vendors-tbody">
                    <tr><td colspan="7" class="loading">Loading vendors...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Vendor Modal -->
        <div class="modal-overlay" id="vendor-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="modal-title">Add New Vendor</h2>
              <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <form id="vendor-form" class="vendor-form">
              <div class="form-group">
                <label for="name">Organization Name *</label>
                <input type="text" id="name" name="name" required>
              </div>
              <div class="form-group">
                <label for="org_type">Type *</label>
                <select id="org_type" name="org_type" required>
                  <option value="CUSTOMER">Customer</option>
                  <option value="SUPPLIER">Supplier</option>
                </select>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="gstin">GSTIN</label>
                  <input type="text" id="gstin" name="gstin" maxlength="15" placeholder="22AAAAA0000A1Z5">
                </div>
                <div class="form-group">
                  <label for="state">State</label>
                  <input type="text" id="state" name="state">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="phone">Phone</label>
                  <input type="tel" id="phone" name="phone">
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email">
                </div>
              </div>
              <div class="form-group">
                <label for="business_address">Address</label>
                <textarea id="business_address" name="business_address" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-btn">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style>
        .vendors-page {
          height: 100vh;
          background: #f5f7fa;
        }
        
        .page-layout {
          display: flex;
          height: 100%;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .content-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
        }
        
        .vendors-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .filter-tabs {
          display: flex;
          gap: 8px;
        }
        
        .filter-tab {
          padding: 10px 20px;
          border: 1px solid #ddd;
          background: white;
          color: #333;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .filter-tab:hover {
          border-color: #667eea;
        }
        
        .filter-tab.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }
        
        .toolbar-right {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        
        .search-box {
          flex: 1;
          min-width: 200px;
        }
        
        .search-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        
        .btn-secondary {
          background: #e9ecef;
          color: #495057;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }
        
        .vendors-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .vendors-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .vendors-table th,
        .vendors-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .vendors-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #555;
          font-size: 13px;
          text-transform: uppercase;
        }
        
        .vendors-table td {
          font-size: 14px;
          color: #333;
        }
        
        .vendors-table tbody tr:hover {
          background: #f8f9fa;
        }
        
        .type-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .type-customer {
          background: #e3f2fd;
          color: #1976d2;
        }
        
        .type-supplier {
          background: #fce4ec;
          color: #c2185b;
        }
        
        .action-buttons {
          display: flex;
          gap: 8px;
        }
        
        .loading, .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
        }
        
        .modal-header h2 {
          margin: 0;
          font-size: 20px;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #999;
          cursor: pointer;
        }
        
        .vendor-form {
          padding: 24px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
          font-size: 14px;
        }
        
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
        }
      </style>
    `;
    }

    private initializeComponents(): void {
        // Initialize sidebar
        if (this.props.showSidebar) {
            const sidebarContainer = this.container.querySelector('.sidebar-container') as HTMLElement;
            if (sidebarContainer) {
                this.sidebar = new Sidebar(sidebarContainer, {
                    currentPath: '/vendors',
                    onNavigate: this.props.onNavigate
                });
                this.sidebar.render();
            }
        }

        // Initialize header
        const headerContainer = this.container.querySelector('.header-container') as HTMLElement;
        if (headerContainer) {
            this.header = new Header(headerContainer, {
                title: 'Vendors',
                subtitle: 'Manage your customers and suppliers',
                icon: '🏢',
                showCreateButton: false,
                showSidebarToggle: true,
                onSidebarToggle: () => this.sidebar?.toggle()
            });
            this.header.render();
        }
    }

    private attachEventListeners(): void {
        // Filter tabs
        const filterTabs = this.container.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.getAttribute('data-filter') as 'ALL' | 'CUSTOMER' | 'SUPPLIER';
                this.filterVendors();
            });
        });

        // Add vendor button
        const addBtn = this.container.querySelector('#add-vendor-btn');
        addBtn?.addEventListener('click', () => this.openModal());

        // Search input
        const searchInput = this.container.querySelector('#vendor-search') as HTMLInputElement;
        searchInput?.addEventListener('input', () => this.filterVendors());

        // Modal close
        const modalClose = this.container.querySelector('#modal-close');
        modalClose?.addEventListener('click', () => this.closeModal());

        const cancelBtn = this.container.querySelector('#cancel-btn');
        cancelBtn?.addEventListener('click', () => this.closeModal());

        // Form submit
        const form = this.container.querySelector('#vendor-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Close modal on overlay click
        const modal = this.container.querySelector('#vendor-modal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    private async loadVendors(): Promise<void> {
        const tbody = this.container.querySelector('#vendors-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="7" class="loading">Loading vendors...</td></tr>';

        try {
            const result = await (window as any).electronAPI.getVendors();
            if (result.success) {
                this.vendors = result.data || [];
                this.filterVendors();
            } else {
                tbody.innerHTML = `<tr><td colspan="7" class="loading">Error: ${result.error}</td></tr>`;
            }
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="7" class="loading">Failed to load vendors</td></tr>`;
        }
    }

    private filterVendors(): void {
        const searchInput = this.container.querySelector('#vendor-search') as HTMLInputElement;
        const searchQuery = searchInput?.value.toLowerCase() || '';

        let filtered = [...this.vendors];

        // Apply type filter
        if (this.currentFilter !== 'ALL') {
            filtered = filtered.filter(v => v.org_type === this.currentFilter);
        }

        // Apply search filter
        if (searchQuery) {
            filtered = filtered.filter(v =>
                v.name.toLowerCase().includes(searchQuery) ||
                (v.gstin && v.gstin.toLowerCase().includes(searchQuery)) ||
                (v.email && v.email.toLowerCase().includes(searchQuery))
            );
        }

        this.renderVendors(filtered);
    }

    private renderVendors(vendors: Vendor[]): void {
        const tbody = this.container.querySelector('#vendors-tbody');
        if (!tbody) return;

        if (vendors.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No vendors found</td></tr>';
            return;
        }

        tbody.innerHTML = vendors.map(vendor => `
      <tr>
        <td><strong>${vendor.name}</strong></td>
        <td>
          <span class="type-badge ${vendor.org_type === 'CUSTOMER' ? 'type-customer' : 'type-supplier'}">
            ${vendor.org_type}
          </span>
        </td>
        <td>${vendor.gstin || '-'}</td>
        <td>${vendor.phone || '-'}</td>
        <td>${vendor.email || '-'}</td>
        <td>${vendor.state || '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-secondary btn-sm" id="edit-${vendor.org_id}" title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></button>
            <button class="btn btn-danger btn-sm" id="delete-${vendor.org_id}" title="Delete" style="background: #dc3545; color: white; border: none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
          </div>
        </td>
      </tr>
    `).join('');

        // Attach event listeners
        vendors.forEach(vendor => {
            const editBtn = tbody.querySelector(`#edit-${vendor.org_id}`);
            editBtn?.addEventListener('click', () => this.openModal(vendor));

            const deleteBtn = tbody.querySelector(`#delete-${vendor.org_id}`);
            deleteBtn?.addEventListener('click', () => this.deleteVendor(vendor));
        });
    }

    private openModal(vendor?: Vendor): void {
        this.editingVendor = vendor || null;
        const modal = this.container.querySelector('#vendor-modal') as HTMLElement;
        const title = this.container.querySelector('#modal-title');
        const form = this.container.querySelector('#vendor-form') as HTMLFormElement;

        if (modal && title && form) {
            title.textContent = vendor ? 'Edit Vendor' : 'Add New Vendor';

            (form.querySelector('#name') as HTMLInputElement).value = vendor?.name || '';
            (form.querySelector('#org_type') as HTMLSelectElement).value = vendor?.org_type || 'CUSTOMER';
            (form.querySelector('#gstin') as HTMLInputElement).value = vendor?.gstin || '';
            (form.querySelector('#state') as HTMLInputElement).value = vendor?.state || '';
            (form.querySelector('#phone') as HTMLInputElement).value = vendor?.phone || '';
            (form.querySelector('#email') as HTMLInputElement).value = vendor?.email || '';
            (form.querySelector('#business_address') as HTMLTextAreaElement).value = vendor?.business_address || '';

            modal.style.display = 'flex';
        }
    }

    private closeModal(): void {
        const modal = this.container.querySelector('#vendor-modal') as HTMLElement;
        if (modal) {
            modal.style.display = 'none';
            this.editingVendor = null;
        }
    }

    private async handleFormSubmit(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const vendorData = {
            name: formData.get('name') as string,
            org_type: formData.get('org_type') as string,
            gstin: formData.get('gstin') as string || null,
            state: formData.get('state') as string || null,
            phone: formData.get('phone') as string || null,
            email: formData.get('email') as string || null,
            business_address: formData.get('business_address') as string || null
        };

        try {
            let result;
            if (this.editingVendor) {
                result = await (window as any).electronAPI.updateVendor(this.editingVendor.org_id, vendorData);
            } else {
                result = await (window as any).electronAPI.createVendor(vendorData);
            }

            if (result.success) {
                this.closeModal();
                await this.loadVendors();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to save vendor: ${error}`);
        }
    }

    private async deleteVendor(vendor: Vendor): Promise<void> {
        if (!confirm(`Are you sure you want to delete "${vendor.name}"?`)) {
            return;
        }

        try {
            const result = await (window as any).electronAPI.deleteVendor(vendor.org_id);
            if (result.success) {
                await this.loadVendors();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to delete vendor: ${error}`);
        }
    }

    public destroy(): void {
        this.container.innerHTML = '';
        this.sidebar = null;
        this.header = null;
    }
}
