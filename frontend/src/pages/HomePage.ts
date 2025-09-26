import { StatusCard } from './components/StatusCard';
import { DatabaseCard } from './components/DatabaseCard';
import { ConfigCard } from './components/ConfigCard';

export class HomePage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Render the home page
   */
  public render(): void {
    this.container.innerHTML = `
      <div class="container">
        <header class="header">
          <h1>EZAccounting</h1>
          <p>Professional Accounting Management System</p>
        </header>

        <main class="main-content">
          <div class="cards-grid">
            ${StatusCard.render()}
            ${DatabaseCard.render()}
            ${ConfigCard.render()}
          </div>
        </main>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Attach event listeners to page elements
   */
  private attachEventListeners(): void {
    // Status card events
    const checkBackendBtn = this.container.querySelector('#check-backend');
    if (checkBackendBtn) {
      checkBackendBtn.addEventListener('click', this.checkBackendConnection.bind(this));
    }

    // Database card events
    const testDbBtn = this.container.querySelector('#test-database');
    const addRecordBtn = this.container.querySelector('#add-test-record');
    const viewRecordsBtn = this.container.querySelector('#view-records');

    if (testDbBtn) {
      testDbBtn.addEventListener('click', this.testDatabaseOperations.bind(this));
    }
    if (addRecordBtn) {
      addRecordBtn.addEventListener('click', this.addTestRecord.bind(this));
    }
    if (viewRecordsBtn) {
      viewRecordsBtn.addEventListener('click', this.viewTestRecords.bind(this));
    }

    // Config card events
    const showConfigBtn = this.container.querySelector('#show-config');
    if (showConfigBtn) {
      showConfigBtn.addEventListener('click', this.showConfigurationInfo.bind(this));
    }
  }

  /**
   * Check backend connection
   */
  private async checkBackendConnection(): Promise<void> {
    const statusIndicator = this.container.querySelector('#backend-status') as HTMLElement;
    const statusText = this.container.querySelector('#backend-status-text') as HTMLElement;
    const loadingSpinner = this.container.querySelector('#backend-loading') as HTMLElement;

    if (statusIndicator && statusText && loadingSpinner) {
      loadingSpinner.style.display = 'inline-block';
      statusText.textContent = 'Checking connection...';

      try {
        const result = await window.electronAPI.getBackendUrl();
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = `Connected to: ${result}`;
      } catch (error) {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Backend connection failed';
      } finally {
        loadingSpinner.style.display = 'none';
      }
    }
  }

  /**
   * Test database operations
   */
  private async testDatabaseOperations(): Promise<void> {
    const statusIndicator = this.container.querySelector('#db-status') as HTMLElement;
    const statusText = this.container.querySelector('#db-status-text') as HTMLElement;
    const loadingSpinner = this.container.querySelector('#db-loading') as HTMLElement;

    if (statusIndicator && statusText && loadingSpinner) {
      loadingSpinner.style.display = 'inline-block';
      statusText.textContent = 'Testing database...';

      try {
        const isConnected = await window.electronAPI.dbIsConnected();
        if (isConnected) {
          statusIndicator.className = 'status-indicator connected';
          statusText.textContent = 'Database connected and ready';
        } else {
          statusIndicator.className = 'status-indicator disconnected';
          statusText.textContent = 'Database not connected';
        }
      } catch (error) {
        statusIndicator.className = 'status-indicator disconnected';
        statusText.textContent = 'Database test failed';
      } finally {
        loadingSpinner.style.display = 'none';
      }
    }
  }

  /**
   * Add test record
   */
  private async addTestRecord(): Promise<void> {
    const name = `Test Record ${Date.now()}`;
    const value = `Value ${Math.random().toString(36).substr(2, 9)}`;

    try {
      const result = await window.electronAPI.dbInsertTestRecord(name, value);
      if (result.success) {
        alert(`Test record added successfully with ID: ${(result as any).data}`);
      } else {
        alert(`Failed to add test record: ${result.error}`);
      }
    } catch (error) {
      alert(`Error adding test record: ${error}`);
    }
  }

  /**
   * View test records
   */
  private async viewTestRecords(): Promise<void> {
    try {
      const result = await window.electronAPI.dbGetTestRecords();
      console.log('View records result:', result);
      
      if (result.success && (result as any).data) {
        const records = (result as any).data;
        console.log('Records data:', records);
        console.log('Is records an array?', Array.isArray(records));
        
        if (Array.isArray(records) && records.length > 0) {
          const recordsList = records.map((record: any) => 
            `ID: ${record.id}, Name: ${record.name}, Value: ${record.value}, Created: ${record.created_at}`
          ).join('\n');
          
          alert(`Test Records:\n\n${recordsList}`);
        } else {
          alert('No test records found in database.');
        }
      } else {
        alert(`Failed to fetch records: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error in viewTestRecords:', error);
      alert(`Error fetching records: ${error}`);
    }
  }

  /**
   * Show configuration information
   */
  private async showConfigurationInfo(): Promise<void> {
    try {
      const configInfo = await window.electronAPI.getConfigInfo();
      const configText = `
Configuration Information:

Backend URL: ${configInfo.backendUrl}
Database Path: ${configInfo.databasePath}
Database Name: ${configInfo.databaseName}
User Data Path: ${configInfo.userDataPath}
Custom DB Path: ${configInfo.isCustomDbPath ? 'Yes' : 'No'}
Custom Backend URL: ${configInfo.isCustomBackendUrl ? 'Yes' : 'No'}
      `;
      
      alert(configText);
    } catch (error) {
      alert(`Error getting configuration: ${error}`);
    }
  }
}
