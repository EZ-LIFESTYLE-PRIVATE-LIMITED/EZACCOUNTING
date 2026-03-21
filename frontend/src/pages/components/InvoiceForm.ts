/**
 * InvoiceForm Component
 * A modal form for creating and editing invoices with item selection
 */

export interface InvoiceFormItem {
    item_id: number;
    item_name: string;
    quantity: number;
    unit_price: number;
    gst_rate: number;
    total: number;
    gst_amount: number;
    net_amount: number;
}

export interface InvoiceFormData {
    invoice_id?: number;
    org_id: number;
    invoice_date: string;
    due_date?: string;
    status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    items: InvoiceFormItem[];
    notes?: string;
}

export interface Customer {
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

export interface InvoiceFormProps {
    container: HTMLElement;
    invoice?: InvoiceFormData;
    onSave?: (invoice: InvoiceFormData) => void;
    onCancel?: () => void;
}

export class InvoiceForm {
    private container: HTMLElement;
    private props: InvoiceFormProps;
    private customers: Customer[] = [];
    private items: Item[] = [];
    private invoiceItems: InvoiceFormItem[] = [];
    private invoice: InvoiceFormData | null = null;

    constructor(props: InvoiceFormProps) {
        this.container = props.container;
        this.props = props;
        this.invoice = props.invoice || null;

        if (props.invoice?.items) {
            this.invoiceItems = [...props.invoice.items];
        }
    }

    public async render(): Promise<void> {
        this.container.innerHTML = this.getHTML();
        await this.loadData();
        this.attachEventListeners();
        this.updateTotals();
    }

    private getHTML(): string {
        const isEdit = !!this.invoice?.invoice_id;

        return `
      <div class="modal-overlay" id="invoice-form-modal">
        <div class="modal-content modal-large">
          <div class="modal-header">
            <h2>${isEdit ? 'Edit Invoice' : 'Create New Invoice'}</h2>
            <button class="modal-close" id="modal-close">&times;</button>
          </div>
          <form id="invoice-form" class="invoice-form">
            <div class="form-row">
              <div class="form-group">
                <label for="org_id">Customer *</label>
                <select id="org_id" name="org_id" required>
                  <option value="">Select Customer</option>
                </select>
              </div>
              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" name="status">
                  <option value="DRAFT">Draft</option>
                  <option value="SENT">Sent</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="invoice_date">Invoice Date *</label>
                <input type="date" id="invoice_date" name="invoice_date" required 
                       value="${this.invoice?.invoice_date || new Date().toISOString().split('T')[0]}">
              </div>
              <div class="form-group">
                <label for="due_date">Due Date</label>
                <input type="date" id="due_date" name="due_date"
                       value="${this.invoice?.due_date || ''}">
              </div>
            </div>
            
            <div class="items-section">
              <h3>Line Items</h3>
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
                <span>CGST:</span>
                <span id="cgst-total">₹0.00</span>
              </div>
              <div class="total-row">
                <span>SGST:</span>
                <span id="sgst-total">₹0.00</span>
              </div>
              <div class="total-row total-final">
                <span>Grand Total:</span>
                <span id="grand-total">₹0.00</span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea id="notes" name="notes" rows="2">${this.invoice?.notes || ''}</textarea>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" id="cancel-btn">Cancel</button>
              <button type="submit" class="btn btn-primary" id="save-btn">
                ${isEdit ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <style>
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
          max-width: 550px;
          max-height: 90vh;
          overflow-y: auto;
        }
        
        .modal-large {
          max-width: 750px;
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
        
        .invoice-form {
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
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
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
        
        .btn-secondary:hover {
          background: #dee2e6;
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
          color: #333;
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
          font-size: 14px;
        }
        
        .remove-item-btn:hover {
          background: #c82333;
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
          color: #555;
        }
        
        .total-final {
          font-weight: 600;
          font-size: 16px;
          color: #333;
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

    private async loadData(): Promise<void> {
        await Promise.all([
            this.loadCustomers(),
            this.loadItems()
        ]);

        // Populate dropdowns
        this.updateCustomerDropdown();

        // Add initial item row or existing items
        if (this.invoiceItems.length === 0) {
            this.addItemRow();
        } else {
            this.renderItemRows();
        }

        // Set form values if editing
        if (this.invoice) {
            const orgSelect = this.container.querySelector('#org_id') as HTMLSelectElement;
            const statusSelect = this.container.querySelector('#status') as HTMLSelectElement;

            if (orgSelect && this.invoice.org_id) {
                orgSelect.value = this.invoice.org_id.toString();
            }
            if (statusSelect && this.invoice.status) {
                statusSelect.value = this.invoice.status;
            }
        }
    }

    private async loadCustomers(): Promise<void> {
        try {
            const result = await (window as any).electronAPI.getVendors('CUSTOMER');
            if (result.success) {
                this.customers = result.data || [];
            }
        } catch (error) {
            console.error('Failed to load customers:', error);
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

    private updateCustomerDropdown(): void {
        const select = this.container.querySelector('#org_id') as HTMLSelectElement;
        if (select) {
            select.innerHTML = '<option value="">Select Customer</option>' +
                this.customers.map(c =>
                    `<option value="${c.org_id}">${c.name}${c.gstin ? ` (${c.gstin})` : ''}</option>`
                ).join('');
        }
    }

    private attachEventListeners(): void {
        const form = this.container.querySelector('#invoice-form') as HTMLFormElement;
        form?.addEventListener('submit', (e) => this.handleSubmit(e));

        const closeBtn = this.container.querySelector('#modal-close');
        closeBtn?.addEventListener('click', () => this.handleCancel());

        const cancelBtn = this.container.querySelector('#cancel-btn');
        cancelBtn?.addEventListener('click', () => this.handleCancel());

        const modal = this.container.querySelector('#invoice-form-modal');
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) this.handleCancel();
        });

        const addItemBtn = this.container.querySelector('#add-item-row');
        addItemBtn?.addEventListener('click', () => this.addItemRow());
    }

    private addItemRow(): void {
        this.invoiceItems.push({
            item_id: 0,
            item_name: '',
            quantity: 1,
            unit_price: 0,
            gst_rate: 0,
            total: 0,
            gst_amount: 0,
            net_amount: 0
        });
        this.renderItemRows();
    }

    private renderItemRows(): void {
        const itemsList = this.container.querySelector('#items-list');
        if (!itemsList) return;

        itemsList.innerHTML = this.invoiceItems.map((item, index) => `
      <div class="item-row" data-index="${index}">
        <div>
          <label>Item</label>
          <select class="item-select" data-index="${index}">
            <option value="">Select Item</option>
            ${this.items.map(i =>
            `<option value="${i.item_id}" ${i.item_id === item.item_id ? 'selected' : ''}>${i.item_name}</option>`
        ).join('')}
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
          <input type="number" class="item-gst" data-index="${index}" value="${item.gst_rate}" readonly>
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
            this.invoiceItems[index] = {
                ...this.invoiceItems[index],
                item_id: item.item_id,
                item_name: item.item_name,
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
            this.invoiceItems[index].quantity = parseFloat(input.value) || 1;
        } else if (input.classList.contains('item-price')) {
            this.invoiceItems[index].unit_price = parseFloat(input.value) || 0;
        }

        this.updateTotals();
    }

    private removeItemRow(e: Event): void {
        const btn = e.target as HTMLButtonElement;
        const index = parseInt(btn.getAttribute('data-index') || '0');
        this.invoiceItems.splice(index, 1);
        this.renderItemRows();
        this.updateTotals();
    }

    private updateTotals(): void {
        let subtotal = 0;
        let gstTotal = 0;

        this.invoiceItems.forEach(item => {
            const itemTotal = item.quantity * item.unit_price;
            const itemGst = itemTotal * (item.gst_rate / 100);
            item.total = itemTotal;
            item.gst_amount = itemGst;
            item.net_amount = itemTotal + itemGst;
            subtotal += itemTotal;
            gstTotal += itemGst;
        });

        // GST is split as CGST and SGST (each half of total GST for intra-state)
        const cgst = gstTotal / 2;
        const sgst = gstTotal / 2;
        const grandTotal = subtotal + gstTotal;

        const subtotalEl = this.container.querySelector('#subtotal');
        const cgstEl = this.container.querySelector('#cgst-total');
        const sgstEl = this.container.querySelector('#sgst-total');
        const totalEl = this.container.querySelector('#grand-total');

        if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
        if (cgstEl) cgstEl.textContent = `₹${cgst.toFixed(2)}`;
        if (sgstEl) sgstEl.textContent = `₹${sgst.toFixed(2)}`;
        if (totalEl) totalEl.textContent = `₹${grandTotal.toFixed(2)}`;
    }

    private async handleSubmit(e: Event): Promise<void> {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const validItems = this.invoiceItems.filter(item => item.item_id > 0);

        // Calculate totals
        let totalAmount = 0;
        let gstAmount = 0;

        validItems.forEach(item => {
            totalAmount += item.total;
            gstAmount += item.gst_amount;
        });

        const invoiceData: InvoiceFormData = {
            invoice_id: this.invoice?.invoice_id,
            org_id: parseInt(formData.get('org_id') as string),
            invoice_date: formData.get('invoice_date') as string,
            due_date: formData.get('due_date') as string || undefined,
            status: formData.get('status') as InvoiceFormData['status'],
            items: validItems,
            notes: formData.get('notes') as string || undefined
        };

        if (this.props.onSave) {
            this.props.onSave(invoiceData);
        }
    }

    private handleCancel(): void {
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        this.destroy();
    }

    public destroy(): void {
        this.container.innerHTML = '';
    }
}
