import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Purchase interfaces
export interface PurchaseItem {
    purchase_item_id?: number;
    item_id: number;
    item?: {
        item_id: number;
        item_name: string;
        item_gst: number;
        item_unit_price: number;
    };
    quantity: number;
    unit_price: number;
    gst_rate?: number;
    item_total_amount: number;
    item_gst_amount: number;
    item_net_amount: number;
}

export interface Purchase {
    purchase_id: number;
    purchase_number: string;
    org_id: number;
    org?: {
        org_id: number;
        name: string;
        gstin?: string;
    };
    purchase_date: Date | string;
    due_date?: Date | string;
    status: 'DRAFT' | 'RECEIVED' | 'PAID' | 'CANCELLED';
    total_amount: number;
    gst_amount: number;
    net_amount: number;
    notes?: string;
    purchase_items?: PurchaseItem[];
    created_at?: Date;
    updated_at?: Date;
}

export interface Vendor {
    org_id: number;
    name: string;
    gstin?: string;
}

export interface Item {
    item_id: number;
    item_name: string;
    item_gst: number;
    item_unit_price: number;
}

export interface PurchasesPageProps {
    container: HTMLElement;
    showSidebar?: boolean;
    onNavigate?: (path: string) => void;
}

/**
 * PurchasesPage Component
 * Main page for managing purchases from suppliers
 */
export class PurchasesPage {
    private container: HTMLElement;
    private props: PurchasesPageProps;
    private purchases: Purchase[] = [];
    private vendors: Vendor[] = [];
    private items: Item[] = [];
    private sidebar: Sidebar | null = null;
    private header: Header | null = null;
    private editingPurchase: Purchase | null = null;
    private currentFilter: 'ALL' | 'DRAFT' | 'RECEIVED' | 'PAID' | 'CANCELLED' = 'ALL';
    private purchaseItems: ({ item_id: number; quantity: number; unit_price: number; gst_rate: number })[] = [];

    constructor(props: PurchasesPageProps) {
        this.container = props.container;
        this.props = props;
    }

    public async render(): Promise<void> {
        this.container.innerHTML = this.getPageHTML();
        this.initializeComponents();
        this.attachEventListeners();
        await this.loadData();
    }

    private getPageHTML(): string {
        return `
      <div class="purchases-page">
        <div class="page-layout">
          ${this.props.showSidebar ? '<div class="sidebar-container"></div>' : ''}
          <div class="main-content">
            <div class="header-container"></div>
            <div class="content-container">
              <div class="purchases-toolbar">
                <div class="filter-tabs">
                  <button class="filter-tab active" data-filter="ALL">All</button>
                  <button class="filter-tab" data-filter="DRAFT">Draft</button>
                  <button class="filter-tab" data-filter="RECEIVED">Received</button>
                  <button class="filter-tab" data-filter="PAID">Paid</button>
                  <button class="filter-tab" data-filter="CANCELLED">Cancelled</button>
                </div>
                <div class="toolbar-right">
                  <button id="add-purchase-btn" class="btn btn-primary">
                    <span class="btn-icon">➕</span>
                    New Purchase
                  </button>
                </div>
              </div>
              <div class="purchases-table-container">
                <table class="purchases-table" id="purchases-table">
                  <thead>
                    <tr>
                      <th>Purchase #</th>
                      <th>Supplier</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>GST</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody id="purchases-tbody">
                    <tr><td colspan="8" class="loading">Loading purchases...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Purchase Modal -->
        <div class="modal-overlay" id="purchase-modal" style="display: none;">
          <div class="modal-content modal-large">
            <div class="modal-header">
              <h2 id="modal-title">New Purchase</h2>
              <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <form id="purchase-form" class="purchase-form">
              <div class="form-row">
                <div class="form-group">
                  <label for="org_id">Supplier *</label>
                  <select id="org_id" name="org_id" required>
                    <option value="">Select Supplier</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="status">Status</label>
                  <select id="status" name="status">
                    <option value="DRAFT">Draft</option>
                    <option value="RECEIVED">Received</option>
                    <option value="PAID">Paid</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="purchase_date">Purchase Date *</label>
                  <input type="date" id="purchase_date" name="purchase_date" required>
                </div>
                <div class="form-group">
                  <label for="due_date">Due Date</label>
                  <input type="date" id="due_date" name="due_date">
                </div>
              </div>
              
              <div class="items-section">
                <h3>Items</h3>
                <div class="items-list" id="items-list">
                  <!-- Dynamic items will be added here -->
                </div>
                <button type="button" class="btn btn-secondary" id="add-item-row">
                  ➕ Add Item
                </button>
              </div>
              
              <div class="totals-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span id="subtotal">₹0.00</span>
                </div>
                <div class="total-row">
                  <span>GST:</span>
                  <span id="gst-total">₹0.00</span>
                </div>
                <div class="total-row total-final">
                  <span>Total:</span>
                  <span id="grand-total">₹0.00</span>
                </div>
              </div>
              
              <div class="form-group">
                <label for="notes">Notes</label>
                <textarea id="notes" name="notes" rows="2"></textarea>
              </div>
              
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-btn">Save Purchase</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style>
        .purchases-page {
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
        
        .purchases-toolbar {
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
          flex-wrap: wrap;
        }
        
        .filter-tab {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          color: #333;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
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
        
        .btn-secondary {
          background: #e9ecef;
          color: #495057;
        }
        
        .btn-sm {
          padding: 6px 12px;
          font-size: 13px;
        }
        
        .purchases-table-container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }
        
        .purchases-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .purchases-table th,
        .purchases-table td {
          padding: 14px 16px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .purchases-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #555;
          font-size: 13px;
          text-transform: uppercase;
        }
        
        .purchases-table tbody tr:hover {
          background: #f8f9fa;
        }
        
        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }
        
        .status-draft { background: #fff3cd; color: #856404; }
        .status-received { background: #cce5ff; color: #004085; }
        .status-paid { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        
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
        
        .modal-large {
          max-width: 700px;
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
        
        .purchase-form {
          padding: 24px;
        }
        
        .form-group {
          margin-bottom: 16px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
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
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        
        .items-section {
          margin: 24px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }
        
        .items-section h3 {
          margin: 0 0 16px;
          font-size: 16px;
        }
        
        .item-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr auto;
          gap: 12px;
          margin-bottom: 12px;
          align-items: end;
        }
        
        .item-row select,
        .item-row input {
          padding: 8px 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .item-row label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
          display: block;
        }
        
        .remove-item-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .totals-section {
          background: #f8f9fa;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        
        .total-final {
          font-weight: 600;
          font-size: 16px;
          border-top: 1px solid #ddd;
          padding-top: 12px;
          margin-top: 8px;
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
        if (this.props.showSidebar) {
            const sidebarContainer = this.container.querySelector('.sidebar-container') as HTMLElement;
            if (sidebarContainer) {
                this.sidebar = new Sidebar(sidebarContainer, {
                    currentPath: '/purchases',
                    onNavigate: this.props.onNavigate
                });
                this.sidebar.render();
            }
        }

        const headerContainer = this.container.querySelector('.header-container') as HTMLElement;
        if (headerContainer) {
            this.header = new Header(headerContainer, {
                title: 'Purchases',
                subtitle: 'Manage purchases from suppliers',
                icon: '🛒',
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
                this.currentFilter = tab.getAttribute('data-filter') as any;
                this.filterPurchases();
            });
        });

        // Add purchase button
        const addBtn = this.container.querySelector('#add-purchase-btn');
        addBtn?.addEventListener('click', () => this.openModal());

        // Modal controls
        const modalClose = this.container.querySelector('#modal-close');
        modalClose?.addEventListener('click', () => this.closeModal());

        const cancelBtn = this.container.querySelector('#cancel-btn');
        cancelBtn?.addEventListener('click', () => this.closeModal());

        const form = this.container.querySelector('#purchase-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        const modal = this.container.querySelector('#purchase-modal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        // Add item row button
        const addItemBtn = this.container.querySelector('#add-item-row');
        addItemBtn?.addEventListener('click', () => this.addItemRow());
    }

    private async loadData(): Promise<void> {
        await Promise.all([
            this.loadPurchases(),
            this.loadVendors(),
            this.loadItems()
        ]);
    }

    private async loadPurchases(): Promise<void> {
        const tbody = this.container.querySelector('#purchases-tbody');
        if (!tbody) return;

        tbody.innerHTML = '<tr><td colspan="8" class="loading">Loading purchases...</td></tr>';

        try {
            const result = await (window as any).electronAPI.getPurchases();
            if (result.success) {
                this.purchases = result.data || [];
                this.filterPurchases();
            } else {
                tbody.innerHTML = `<tr><td colspan="8" class="loading">Error: ${result.error}</td></tr>`;
            }
        } catch (error) {
            tbody.innerHTML = `<tr><td colspan="8" class="loading">Failed to load purchases</td></tr>`;
        }
    }

    private async loadVendors(): Promise<void> {
        try {
            const result = await (window as any).electronAPI.getVendors('SUPPLIER');
            if (result.success) {
                this.vendors = result.data || [];
                this.updateVendorDropdown();
            }
        } catch (error) {
            console.error('Failed to load vendors:', error);
        }
    }

    private async loadItems(): Promise<void> {
        try {
            const result = await (window as any).electronAPI.getItems();
            if (result.success) {
                this.items = result.data || [];
            }
        } catch (error) {
            console.error('Failed to load items:', error);
        }
    }

    private updateVendorDropdown(): void {
        const select = this.container.querySelector('#org_id') as HTMLSelectElement;
        if (select) {
            select.innerHTML = '<option value="">Select Supplier</option>' +
                this.vendors.map(v => `<option value="${v.org_id}">${v.name}${v.gstin ? ` (${v.gstin})` : ''}</option>`).join('');
        }
    }

    private filterPurchases(): void {
        let filtered = [...this.purchases];

        if (this.currentFilter !== 'ALL') {
            filtered = filtered.filter(p => p.status === this.currentFilter);
        }

        this.renderPurchases(filtered);
    }

    private renderPurchases(purchases: Purchase[]): void {
        const tbody = this.container.querySelector('#purchases-tbody');
        if (!tbody) return;

        if (purchases.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No purchases found</td></tr>';
            return;
        }

        tbody.innerHTML = purchases.map(purchase => {
            const date = new Date(purchase.purchase_date).toLocaleDateString();
            return `
        <tr>
          <td><strong>${purchase.purchase_number}</strong></td>
          <td>${purchase.org?.name || '-'}</td>
          <td>${date}</td>
          <td>₹${purchase.total_amount.toFixed(2)}</td>
          <td>₹${purchase.gst_amount.toFixed(2)}</td>
          <td><strong>₹${purchase.net_amount.toFixed(2)}</strong></td>
          <td>
            <span class="status-badge status-${purchase.status.toLowerCase()}">${purchase.status}</span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn btn-secondary btn-sm" id="view-${purchase.purchase_id}" title="View"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg></button>
              <button class="btn btn-danger btn-sm" id="delete-${purchase.purchase_id}" title="Delete" style="background: #dc3545; color: white; border: none;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg></button>
            </div>
          </td>
        </tr>
      `;
        }).join('');

        // Attach event listeners
        purchases.forEach(purchase => {
            const viewBtn = tbody.querySelector(`#view-${purchase.purchase_id}`);
            viewBtn?.addEventListener('click', () => this.viewPurchase(purchase));

            const deleteBtn = tbody.querySelector(`#delete-${purchase.purchase_id}`);
            deleteBtn?.addEventListener('click', () => this.deletePurchase(purchase));
        });
    }

    private openModal(purchase?: Purchase): void {
        this.editingPurchase = purchase || null;
        this.purchaseItems = [];

        const modal = this.container.querySelector('#purchase-modal') as HTMLElement;
        const title = this.container.querySelector('#modal-title');
        const form = this.container.querySelector('#purchase-form') as HTMLFormElement;

        if (modal && title && form) {
            title.textContent = purchase ? 'Edit Purchase' : 'New Purchase';

            (form.querySelector('#org_id') as HTMLSelectElement).value = purchase?.org_id?.toString() || '';
            (form.querySelector('#status') as HTMLSelectElement).value = purchase?.status || 'DRAFT';
            (form.querySelector('#purchase_date') as HTMLInputElement).value =
                purchase?.purchase_date ? new Date(purchase.purchase_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            (form.querySelector('#due_date') as HTMLInputElement).value =
                purchase?.due_date ? new Date(purchase.due_date).toISOString().split('T')[0] : '';
            (form.querySelector('#notes') as HTMLTextAreaElement).value = purchase?.notes || '';

            const itemsList = this.container.querySelector('#items-list');
            if (itemsList) itemsList.innerHTML = '';

            if (purchase?.purchase_items) {
                purchase.purchase_items.forEach(item => {
                    this.purchaseItems.push({
                        item_id: item.item_id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        gst_rate: item.item?.item_gst || 0
                    });
                });
                this.renderItemRows();
            } else {
                this.addItemRow();
            }

            this.updateTotals();
            modal.style.display = 'flex';
        }
    }

    private closeModal(): void {
        const modal = this.container.querySelector('#purchase-modal') as HTMLElement;
        if (modal) {
            modal.style.display = 'none';
            this.editingPurchase = null;
            this.purchaseItems = [];
        }
    }

    private addItemRow(): void {
        this.purchaseItems.push({ item_id: 0, quantity: 1, unit_price: 0, gst_rate: 0 });
        this.renderItemRows();
    }

    private renderItemRows(): void {
        const itemsList = this.container.querySelector('#items-list');
        if (!itemsList) return;

        itemsList.innerHTML = this.purchaseItems.map((item, index) => `
      <div class="item-row" data-index="${index}">
        <div>
          <label>Item</label>
          <select class="item-select" data-index="${index}">
            <option value="">Select Item</option>
            ${this.items.map(i => `<option value="${i.item_id}" ${i.item_id === item.item_id ? 'selected' : ''}>${i.item_name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Qty</label>
          <input type="number" class="item-qty" data-index="${index}" value="${item.quantity}" min="1" step="1">
        </div>
        <div>
          <label>Price</label>
          <input type="number" class="item-price" data-index="${index}" value="${item.unit_price}" min="0" step="0.01">
        </div>
        <div>
          <label>GST %</label>
          <input type="number" class="item-gst" data-index="${index}" value="${item.gst_rate}" min="0" step="0.01" readonly>
        </div>
        <button type="button" class="remove-item-btn" data-index="${index}">✕</button>
      </div>
    `).join('');

        // Attach event listeners
        itemsList.querySelectorAll('.item-select').forEach(select => {
            select.addEventListener('change', (e) => this.handleItemSelect(e));
        });

        itemsList.querySelectorAll('.item-qty, .item-price').forEach(input => {
            input.addEventListener('input', (e) => this.handleItemChange(e));
        });

        itemsList.querySelectorAll('.remove-item-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.removeItemRow(e));
        });
    }

    private handleItemSelect(e: Event): void {
        const select = e.target as HTMLSelectElement;
        const index = parseInt(select.getAttribute('data-index') || '0');
        const itemId = parseInt(select.value);
        const item = this.items.find(i => i.item_id === itemId);

        if (item) {
            this.purchaseItems[index] = {
                item_id: item.item_id,
                quantity: this.purchaseItems[index]?.quantity || 1,
                unit_price: item.item_unit_price || 0,
                gst_rate: item.item_gst || 0
            };
            this.renderItemRows();
        }
        this.updateTotals();
    }

    private handleItemChange(e: Event): void {
        const input = e.target as HTMLInputElement;
        const index = parseInt(input.getAttribute('data-index') || '0');

        if (input.classList.contains('item-qty')) {
            this.purchaseItems[index].quantity = parseFloat(input.value) || 1;
        } else if (input.classList.contains('item-price')) {
            this.purchaseItems[index].unit_price = parseFloat(input.value) || 0;
        }

        this.updateTotals();
    }

    private removeItemRow(e: Event): void {
        const btn = e.target as HTMLButtonElement;
        const index = parseInt(btn.getAttribute('data-index') || '0');
        this.purchaseItems.splice(index, 1);
        this.renderItemRows();
        this.updateTotals();
    }

    private updateTotals(): void {
        let subtotal = 0;
        let gstTotal = 0;

        this.purchaseItems.forEach(item => {
            const itemTotal = item.quantity * item.unit_price;
            const itemGst = itemTotal * (item.gst_rate / 100);
            subtotal += itemTotal;
            gstTotal += itemGst;
        });

        const grandTotal = subtotal + gstTotal;

        const subtotalEl = this.container.querySelector('#subtotal');
        const gstEl = this.container.querySelector('#gst-total');
        const totalEl = this.container.querySelector('#grand-total');

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (gstEl) gstEl.textContent = `₹${gstTotal.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₹${grandTotal.toFixed(2)}`;
    }

    private async handleFormSubmit(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const validItems = this.purchaseItems.filter(item => item.item_id > 0);

        const purchaseData = {
            org_id: parseInt(formData.get('org_id') as string),
            purchase_date: formData.get('purchase_date') as string,
            due_date: formData.get('due_date') as string || null,
            status: formData.get('status') as string,
            notes: formData.get('notes') as string || null,
            items: validItems
        };

        try {
            let result;
            if (this.editingPurchase) {
                result = await (window as any).electronAPI.updatePurchase(this.editingPurchase.purchase_id, purchaseData);
            } else {
                result = await (window as any).electronAPI.createPurchase(purchaseData);
            }

            if (result.success) {
                this.closeModal();
                await this.loadPurchases();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to save purchase: ${error}`);
        }
    }

    private viewPurchase(purchase: Purchase): void {
        // For now, just open in edit mode
        this.openModal(purchase);
    }

    private async deletePurchase(purchase: Purchase): Promise<void> {
        if (!confirm(`Are you sure you want to delete purchase "${purchase.purchase_number}"?`)) {
            return;
        }

        try {
            const result = await (window as any).electronAPI.deletePurchase(purchase.purchase_id);
            if (result.success) {
                await this.loadPurchases();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to delete purchase: ${error}`);
        }
    }

    public destroy(): void {
        this.container.innerHTML = '';
        this.sidebar = null;
        this.header = null;
    }
}
