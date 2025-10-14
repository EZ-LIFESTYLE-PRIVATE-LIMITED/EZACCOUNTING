export class ConfigCard {
  public static render(): string {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Configuration Settings</h3>
        </div>
        <div class="card-body">
          <div class="config-section">
            <div class="config-item">
              <label>Backend URL:</label>
              <span id="config-backend-url">Loading...</span>
            </div>
            <div class="config-item">
              <label>Database Path:</label>
              <span id="config-db-path">Loading...</span>
            </div>
            <div class="config-item">
              <label>User Data Directory:</label>
              <span id="config-user-data">Loading...</span>
            </div>
            <button id="show-config" class="btn btn-outline">Show Full Configuration</button>
          </div>
        </div>
      </div>
    `;
  }
}
