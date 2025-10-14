import { RegistrationForm } from './components/RegistrationForm';

export class RegistrationPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  /**
   * Render the registration page
   */
  public render(): void {
    this.container.innerHTML = `
      <div class="registration-container">
        <div class="registration-card">
          <div class="registration-header">
            <div class="header-icon">📄</div>
            <h1>Welcome to EZAccounting</h1>
            <p>Let's set up your organization to get started with GST management.</p>
          </div>
          
          <div class="registration-form-container">
            ${RegistrationForm.render()}
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  /**
   * Attach event listeners to page elements
   */
  private attachEventListeners(): void {
    const form = this.container.querySelector('#registration-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    const fileInput = this.container.querySelector('#signature-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.addEventListener('change', this.handleFileUpload.bind(this));
    }
  }

  /**
   * Convert file to base64 string
   */
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  /**
   * Handle form submission
   */
  private async handleFormSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Get form values
    const signatureFile = formData.get('signatureFile') as File | null;
    let signatureFileData = null;
    
    // Convert file to base64 if present
    if (signatureFile && signatureFile.size > 0) {
      try {
        signatureFileData = await this.convertFileToBase64(signatureFile);
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }
    
    const registrationData = {
      userName: formData.get('userName') as string,
      organizationName: formData.get('organizationName') as string,
      gstin: formData.get('gstin') as string,
      mobileNumber: formData.get('mobileNumber') as string,
      cityState: formData.get('cityState') as string,
      invoiceSeries: formData.get('invoiceSeries') as string,
      businessAddress: formData.get('businessAddress') as string,
      signatureFile: signatureFileData && signatureFile ? {
        name: signatureFile.name,
        type: signatureFile.type,
        size: signatureFile.size,
        data: signatureFileData
      } : null
    };

    // Validate required fields
    if (!this.validateForm(registrationData)) {
      return;
    }

    // Show loading state
    this.showLoadingState();

    try {
      // Save registration data
      const result = await window.electronAPI.saveRegistrationData(registrationData);
      
      if (result.success) {
        this.showSuccessMessage();
        // Redirect to main dashboard after a short delay
        setTimeout(() => {
          // Call the global showHomePage function
          if (typeof (window as any).showHomePage === 'function') {
            (window as any).showHomePage();
          } else {
            // Fallback to page reload
            window.location.reload();
          }
        }, 2000);
      } else {
        this.showErrorMessage(result.error || 'Registration failed');
      }
    } catch (error) {
      this.showErrorMessage(`Registration error: ${error}`);
    } finally {
      this.hideLoadingState();
    }
  }

  /**
   * Handle file upload
   */
  private handleFileUpload(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (file) {
      // Validate file
      if (!this.validateFile(file)) {
        fileInput.value = '';
        return;
      }
      
      // Update file display
      const fileName = this.container.querySelector('#file-name');
      if (fileName) {
        fileName.textContent = file.name;
      }
    }
  }

  /**
   * Validate form data
   */
  private validateForm(data: any): boolean {
    const requiredFields = [
      { field: 'userName', name: 'Your Name' },
      { field: 'organizationName', name: 'Organization Name' },
      { field: 'gstin', name: 'GSTIN' },
      { field: 'mobileNumber', name: 'Mobile Number' },
      { field: 'cityState', name: 'City / State' },
      { field: 'businessAddress', name: 'Business Address' }
    ];

    for (const { field, name } of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        this.showErrorMessage(`${name} is required`);
        return false;
      }
    }

    // Validate GSTIN format
    if (!this.validateGSTIN(data.gstin)) {
      this.showErrorMessage('GSTIN must be 15 characters long and alphanumeric');
      return false;
    }

    // Validate mobile number
    if (!this.validateMobileNumber(data.mobileNumber)) {
      this.showErrorMessage('Please enter a valid mobile number');
      return false;
    }

    return true;
  }

  /**
   * Validate GSTIN format
   */
  private validateGSTIN(gstin: string): boolean {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  /**
   * Validate mobile number
   */
  private validateMobileNumber(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile.replace(/\D/g, ''));
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): boolean {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!allowedTypes.includes(file.type)) {
      this.showErrorMessage('Please upload a PNG or JPG file');
      return false;
    }

    if (file.size > maxSize) {
      this.showErrorMessage('File size must be less than 2MB');
      return false;
    }

    return true;
  }

  /**
   * Show loading state
   */
  private showLoadingState(): void {
    const submitBtn = this.container.querySelector('#submit-btn') as HTMLButtonElement;
    const loadingSpinner = this.container.querySelector('#loading-spinner') as HTMLElement;
    
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Completing Registration...';
    }
    
    if (loadingSpinner) {
      loadingSpinner.style.display = 'inline-block';
    }
  }

  /**
   * Hide loading state
   */
  private hideLoadingState(): void {
    const submitBtn = this.container.querySelector('#submit-btn') as HTMLButtonElement;
    const loadingSpinner = this.container.querySelector('#loading-spinner') as HTMLElement;
    
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete Registration';
    }
    
    if (loadingSpinner) {
      loadingSpinner.style.display = 'none';
    }
  }

  /**
   * Show success message
   */
  private showSuccessMessage(): void {
    const messageDiv = this.container.querySelector('#message') as HTMLElement;
    if (messageDiv) {
      messageDiv.className = 'message success';
      messageDiv.textContent = 'Registration completed successfully! Redirecting to dashboard...';
      messageDiv.style.display = 'block';
    }
  }

  /**
   * Show error message
   */
  private showErrorMessage(message: string): void {
    const messageDiv = this.container.querySelector('#message') as HTMLElement;
    if (messageDiv) {
      messageDiv.className = 'message error';
      messageDiv.textContent = message;
      messageDiv.style.display = 'block';
    }
  }
}
