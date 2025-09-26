export class DatabaseCard {
  public static render(): string {
    return `
      <div class="card">
        <div class="card-header">
          <h3>SQLite Database Status</h3>
        </div>
        <div class="card-body">
          <div class="status-section">
            <div class="status-item">
              <span class="status-indicator" id="db-status"></span>
              <span class="status-text" id="db-status-text">Not checked</span>
              <div class="loading-spinner" id="db-loading" style="display: none;"></div>
            </div>
            <div class="button-group">
              <button id="test-database" class="btn btn-secondary">Test Database</button>
              <button id="add-test-record" class="btn btn-success">Add Test Record</button>
              <button id="view-records" class="btn btn-info">View Records</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
