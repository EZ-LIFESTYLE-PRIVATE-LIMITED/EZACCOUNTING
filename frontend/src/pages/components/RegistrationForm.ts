export class RegistrationForm {
  /**
   * Render the registration form
   */
  public static render(): string {
    return `
      <form id="registration-form" class="registration-form">
        <div class="form-row">
          <div class="form-group">
            <label for="userName">Your Name</label>
            <input 
              type="text" 
              id="userName" 
              name="userName" 
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="organizationName">Organization Name</label>
            <input 
              type="text" 
              id="organizationName" 
              name="organizationName" 
              placeholder="Enter organization name"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="gstin">GSTIN</label>
            <input 
              type="text" 
              id="gstin" 
              name="gstin" 
              placeholder="22AAAAA0000A1Z5"
              maxlength="15"
              required
            />
          </div>
          
          <div class="form-group">
            <label for="mobileNumber">Mobile Number</label>
            <div class="input-with-icon">
              <span class="input-icon">📱</span>
              <input 
                type="tel" 
                id="mobileNumber" 
                name="mobileNumber" 
                placeholder="9876543210"
                maxlength="10"
                required
              />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="cityState">City / State</label>
            <div class="input-with-icon">
              <span class="input-icon">📍</span>
              <input 
                type="text" 
                id="cityState" 
                name="cityState" 
                placeholder="Mumbai, Maharashtra"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="invoiceSeries">Invoice Series (Optional)</label>
            <div class="input-with-icon">
              <span class="input-icon">📄</span>
              <input 
                type="text" 
                id="invoiceSeries" 
                name="invoiceSeries" 
                placeholder="INV-"
              />
            </div>
          </div>
        </div>

        <div class="form-group full-width">
          <label for="businessAddress">Business Address</label>
          <textarea 
            id="businessAddress" 
            name="businessAddress" 
            placeholder="Enter complete business address"
            rows="3"
            required
          ></textarea>
        </div>

        <div class="signature-section">
          <div class="signature-header">
            <span class="signature-icon">📄</span>
            <h3>Digital Signature (Optional)</h3>
          </div>
          <div class="signature-upload">
            <div class="upload-info">
              <p>Upload your digital signature.</p>
              <p class="upload-formats">Supported formats: PNG, JPG (Max 2MB)</p>
            </div>
            <div class="file-upload-container">
              <input 
                type="file" 
                id="signature-file" 
                name="signatureFile" 
                accept=".png,.jpg,.jpeg"
                style="display: none;"
              />
              <button type="button" class="file-upload-btn" onclick="document.getElementById('signature-file').click()">
                Choose File
              </button>
              <span id="file-name" class="file-name">No file chosen</span>
            </div>
          </div>
        </div>

        <div id="message" class="message" style="display: none;"></div>

        <div class="form-actions">
          <button type="submit" id="submit-btn" class="submit-btn">
            Complete Registration
            <span id="loading-spinner" class="loading-spinner" style="display: none;">⏳</span>
          </button>
        </div>
      </form>
    `;
  }
}
