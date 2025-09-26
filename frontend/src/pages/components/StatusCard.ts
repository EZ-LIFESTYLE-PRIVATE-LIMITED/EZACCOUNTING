export class StatusCard {
  public static render(): string {
    return `
      <div class="card">
        <div class="card-header">
          <h3>Backend Status</h3>
        </div>
        <div class="card-body">
          <div class="status-section">
            <div class="status-item">
              <span class="status-indicator" id="backend-status"></span>
              <span class="status-text" id="backend-status-text">Not checked</span>
              <div class="loading-spinner" id="backend-loading" style="display: none;"></div>
            </div>
            <button id="check-backend" class="btn btn-primary">Check Backend</button>
          </div>
        </div>
      </div>
    `;
  }
}
