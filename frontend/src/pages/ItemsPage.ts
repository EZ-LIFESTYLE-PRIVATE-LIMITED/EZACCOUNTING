import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

// Item interface
export interface Item {
    item_id: number;
    item_name: string;
    item_description?: string;
    item_sku?: string;
    item_hsn?: string;
    item_gst: number;
    item_unit_price: number;
    item_category?: string;
    created_at?: Date;
    updated_at?: Date;
}

export interface ItemsPageProps {
    container: HTMLElement;
    showSidebar?: boolean;
    onNavigate?: (path: string) => void;
}

/**
 * ItemsPage Component
 * Main page for managing items/products
 */
export class ItemsPage {
    private container: HTMLElement;
    private props: ItemsPageProps;
    private items: Item[] = [];
    private sidebar: Sidebar | null = null;
    private header: Header | null = null;
    private editingItem: Item | null = null;

    constructor(props: ItemsPageProps) {
        this.container = props.container;
        this.props = props;
    }

    public async render(): Promise<void> {
        this.container.innerHTML = this.getPageHTML();
        this.initializeComponents();
        this.attachEventListeners();
        await this.loadItems();
    }

    private getPageHTML(): string {
        return `
      <div class="items-page">
        <div class="page-layout">
          ${this.props.showSidebar ? '<div class="sidebar-container"></div>' : ''}
          <div class="main-content">
            <div class="header-container"></div>
            <div class="content-container">
              <div class="items-toolbar">
                <div class="search-box">
                  <input type="text" id="item-search" placeholder="Search items..." class="search-input">
                </div>
                <div class="toolbar-actions">
                  <button id="add-item-btn" class="btn btn-primary">
                    <span class="btn-icon">➕</span>
                    Add Item
                  </button>
                </div>
              </div>
              <div class="items-grid" id="items-grid">
                <div class="loading-spinner">Loading items...</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Item Modal -->
        <div class="modal-overlay" id="item-modal" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h2 id="modal-title">Add New Item</h2>
              <button class="modal-close" id="modal-close">&times;</button>
            </div>
            <form id="item-form" class="item-form">
              <div id="form-error" class="error-message" style="display: none; color: #dc3545; margin-bottom: 16px; padding: 10px; background: #ffe6e6; border-radius: 6px;"></div>
              <div class="form-group">
                <label for="item_name">Item Name *</label>
                <input type="text" id="item_name" name="item_name" required>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="item_sku">SKU</label>
                  <input type="text" id="item_sku" name="item_sku">
                </div>
                <div class="form-group">
                  <label for="item_hsn">HSN Code</label>
                  <input type="text" id="item_hsn" name="item_hsn">
                </div>
              </div>
              <div class="form-group">
                <label for="item_category">Category</label>
                <input type="text" id="item_category" name="item_category">
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label for="item_unit_price">Unit Price (₹)</label>
                  <input type="number" id="item_unit_price" name="item_unit_price" step="0.01" min="0">
                </div>
                <div class="form-group">
                  <label for="item_gst">GST Rate (%)</label>
                  <input type="number" id="item_gst" name="item_gst" step="0.01" min="0" max="100">
                </div>
              </div>
              <div class="form-group">
                <label for="item_description">Description</label>
                <textarea id="item_description" name="item_description" rows="3"></textarea>
              </div>
              <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary" id="save-btn">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <style>
        .items-page {
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
        
        .items-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .search-box {
          flex: 1;
          max-width: 400px;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 8px;
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
        
        .btn-secondary:hover {
          background: #dee2e6;
        }
        
        .btn-danger {
          background: #dc3545;
          color: white;
        }
        
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        
        .item-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.2s;
        }
        
        .item-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }
        
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        
        .item-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .item-sku {
          font-size: 12px;
          color: #666;
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 4px;
        }
        
        .item-details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        
        .item-detail {
          display: flex;
          flex-direction: column;
        }
        
        .item-detail-label {
          font-size: 12px;
          color: #888;
          margin-bottom: 4px;
        }
        
        .item-detail-value {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
        
        .item-description {
          font-size: 14px;
          color: #666;
          margin-bottom: 16px;
          line-height: 1.5;
        }
        
        .item-actions {
          display: flex;
          gap: 8px;
        }
        
        .item-actions .btn {
          flex: 1;
          padding: 8px 12px;
          font-size: 13px;
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
          color: #333;
        }
        
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #999;
          cursor: pointer;
        }
        
        .modal-close:hover {
          color: #333;
        }
        
        .item-form {
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
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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
        
        .loading-spinner {
          text-align: center;
          padding: 60px;
          color: #666;
        }
        
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
        
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        
        .empty-state h3 {
          margin: 0 0 8px;
          color: #333;
        }
        
        .empty-state p {
          margin: 0;
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
                    currentPath: '/items',
                    onNavigate: this.props.onNavigate
                });
                this.sidebar.render();
            }
        }

        // Initialize header
        const headerContainer = this.container.querySelector('.header-container') as HTMLElement;
        if (headerContainer) {
            this.header = new Header(headerContainer, {
                title: 'Items',
                subtitle: 'Manage your products and services',
                icon: '📦',
                showCreateButton: false,
                showSidebarToggle: true,
                onSidebarToggle: () => this.sidebar?.toggle()
            });
            this.header.render();
        }
    }

    private attachEventListeners(): void {
        // Add item button
        const addBtn = this.container.querySelector('#add-item-btn');
        addBtn?.addEventListener('click', () => this.openModal());

        // Search input
        const searchInput = this.container.querySelector('#item-search') as HTMLInputElement;
        searchInput?.addEventListener('input', (e) => this.handleSearch((e.target as HTMLInputElement).value));

        // Modal close
        const modalClose = this.container.querySelector('#modal-close');
        modalClose?.addEventListener('click', () => this.closeModal());

        const cancelBtn = this.container.querySelector('#cancel-btn');
        cancelBtn?.addEventListener('click', () => this.closeModal());

        // Form submit
        const form = this.container.querySelector('#item-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Close modal on overlay click
        const modal = this.container.querySelector('#item-modal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
    }

    private async loadItems(): Promise<void> {
        const grid = this.container.querySelector('#items-grid');
        if (!grid) return;

        grid.innerHTML = '<div class="loading-spinner">Loading items...</div>';

        try {
            const result = await (window as any).electronAPI.getItems();
            if (result.success) {
                this.items = result.data || [];
                this.renderItems();
            } else {
                grid.innerHTML = `<div class="error-state">Error: ${result.error}</div>`;
            }
        } catch (error) {
            grid.innerHTML = `<div class="error-state">Failed to load items</div>`;
        }
    }

    private renderItems(): void {
        const grid = this.container.querySelector('#items-grid');
        if (!grid) return;

        if (this.items.length === 0) {
            grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📦</div>
          <h3>No Items Yet</h3>
          <p>Add your first item to get started</p>
        </div>
      `;
            return;
        }

        grid.innerHTML = this.items.map(item => this.getItemCardHTML(item)).join('');

        // Attach card event listeners
        this.items.forEach(item => {
            const editBtn = grid.querySelector(`#edit-${item.item_id}`);
            editBtn?.addEventListener('click', () => this.openModal(item));

            const deleteBtn = grid.querySelector(`#delete-${item.item_id}`);
            deleteBtn?.addEventListener('click', () => this.deleteItem(item));
        });
    }

    private getItemCardHTML(item: Item): string {
        return `
      <div class="item-card">
        <div class="item-header">
          <h3 class="item-name">${item.item_name}</h3>
          ${item.item_sku ? `<span class="item-sku">${item.item_sku}</span>` : ''}
        </div>
        ${item.item_description ? `<p class="item-description">${item.item_description}</p>` : ''}
        <div class="item-details">
          <div class="item-detail">
            <span class="item-detail-label">Unit Price</span>
            <span class="item-detail-value">₹${(item.item_unit_price || 0).toFixed(2)}</span>
          </div>
          <div class="item-detail">
            <span class="item-detail-label">GST Rate</span>
            <span class="item-detail-value">${item.item_gst || 0}%</span>
          </div>
          ${item.item_hsn ? `
          <div class="item-detail">
            <span class="item-detail-label">HSN</span>
            <span class="item-detail-value">${item.item_hsn}</span>
          </div>
          ` : ''}
          ${item.item_category ? `
          <div class="item-detail">
            <span class="item-detail-label">Category</span>
            <span class="item-detail-value">${item.item_category}</span>
          </div>
          ` : ''}
        </div>
        <div class="item-actions">
          <button class="btn btn-secondary" id="edit-${item.item_id}" title="Edit"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg> Edit</button>
          <button class="btn btn-danger" id="delete-${item.item_id}" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg> Delete</button>
        </div>
      </div>
    `;
    }

    private openModal(item?: Item): void {
        this.editingItem = item || null;
        const modal = this.container.querySelector('#item-modal') as HTMLElement;
        const title = this.container.querySelector('#modal-title');
        const form = this.container.querySelector('#item-form') as HTMLFormElement;

        if (modal && title && form) {
            title.textContent = item ? 'Edit Item' : 'Add New Item';

            // Populate form if editing
            (form.querySelector('#item_name') as HTMLInputElement).value = item?.item_name || '';
            (form.querySelector('#item_sku') as HTMLInputElement).value = item?.item_sku || '';
            const hsnInput = form.querySelector('#item_hsn') as HTMLInputElement;
            if (hsnInput) hsnInput.value = item?.item_hsn || '';
            (form.querySelector('#item_category') as HTMLInputElement).value = item?.item_category || '';
            (form.querySelector('#item_unit_price') as HTMLInputElement).value = (item?.item_unit_price || '').toString();
            (form.querySelector('#item_gst') as HTMLInputElement).value = (item?.item_gst || '').toString();
            (form.querySelector('#item_description') as HTMLTextAreaElement).value = item?.item_description || '';

            const formError = form.querySelector('#form-error') as HTMLElement;
            if (formError) formError.style.display = 'none';

            modal.style.display = 'flex';
        }
    }

    private closeModal(): void {
        const modal = this.container.querySelector('#item-modal') as HTMLElement;
        if (modal) {
            modal.style.display = 'none';
            this.editingItem = null;
        }
    }

    private async handleFormSubmit(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const itemData = {
            item_name: formData.get('item_name') as string,
            item_sku: formData.get('item_sku') as string || null,
            item_hsn: formData.get('item_hsn') as string || null,
            item_category: formData.get('item_category') as string || null,
            item_unit_price: parseFloat(formData.get('item_unit_price') as string) || 0,
            item_gst: parseFloat(formData.get('item_gst') as string) || 0,
            item_description: formData.get('item_description') as string || null
        };

        const errorDiv = form.querySelector('#form-error') as HTMLElement;
        if (errorDiv) errorDiv.style.display = 'none';

        try {
            let result;
            if (this.editingItem) {
                result = await (window as any).electronAPI.updateItem(this.editingItem.item_id, itemData);
            } else {
                result = await (window as any).electronAPI.createItem(itemData);
            }

            if (result.success) {
                this.closeModal();
                await this.loadItems();
            } else {
                if (errorDiv) {
                    errorDiv.textContent = result.error;
                    errorDiv.style.display = 'block';
                } else {
                    alert(`Error: ${result.error}`);
                }
            }
        } catch (error) {
            if (errorDiv) {
                errorDiv.textContent = `Failed to save item: ${error}`;
                errorDiv.style.display = 'block';
            } else {
                alert(`Failed to save item: ${error}`);
            }
        }
    }

    private async deleteItem(item: Item): Promise<void> {
        if (!confirm(`Are you sure you want to delete "${item.item_name}"?`)) {
            return;
        }

        try {
            const result = await (window as any).electronAPI.deleteItem(item.item_id);
            if (result.success) {
                await this.loadItems();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            alert(`Failed to delete item: ${error}`);
        }
    }

    private handleSearch(query: string): void {
        const filteredItems = this.items.filter(item =>
            item.item_name.toLowerCase().includes(query.toLowerCase()) ||
            (item.item_sku && item.item_sku.toLowerCase().includes(query.toLowerCase())) ||
            (item.item_category && item.item_category.toLowerCase().includes(query.toLowerCase()))
        );

        const grid = this.container.querySelector('#items-grid');
        if (grid) {
            if (filteredItems.length === 0) {
                grid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <h3>No Results</h3>
            <p>No items match your search</p>
          </div>
        `;
            } else {
                grid.innerHTML = filteredItems.map(item => this.getItemCardHTML(item)).join('');
                // Re-attach event listeners
                filteredItems.forEach(item => {
                    const editBtn = grid.querySelector(`#edit-${item.item_id}`);
                    editBtn?.addEventListener('click', () => this.openModal(item));
                    const deleteBtn = grid.querySelector(`#delete-${item.item_id}`);
                    deleteBtn?.addEventListener('click', () => this.deleteItem(item));
                });
            }
        }
    }

    public destroy(): void {
        this.container.innerHTML = '';
        this.sidebar = null;
        this.header = null;
    }
}
