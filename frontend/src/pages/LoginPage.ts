export class LoginPage {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="registration-container">
        <div class="registration-card" style="max-width: 400px;">
          <div class="registration-header">
            <div class="header-icon">🔐</div>
            <h1>Login</h1>
            <p>Welcome back! Please enter your details.</p>
          </div>
          
          <div class="registration-form-container">
            <form id="login-form" class="registration-form">
              <div id="message" style="display: none;" class="message error"></div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email">
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password">
              </div>
              
              <div class="form-actions">
                <button type="submit" class="submit-btn" id="login-btn">
                  Login <span class="loading-spinner" id="loading-spinner" style="display: none;">⏳</span>
                </button>
              </div>
              <div style="margin-top: 20px; text-align: center; font-size: 14px;">
                <a href="#" id="go-to-register" style="color: #667eea; text-decoration: none; font-weight: 500;">Don't have an account? Register here</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const form = this.container.querySelector('#login-form') as HTMLFormElement;
    if (form) {
      form.addEventListener('submit', this.handleLogin.bind(this));
    }
    
    const registerLink = this.container.querySelector('#go-to-register');
    if (registerLink) {
      registerLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof (window as any).showRegistrationPage === 'function') {
          (window as any).showRegistrationPage();
        }
      });
    }
  }

  private async handleLogin(event: Event): Promise<void> {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const btn = this.container.querySelector('#login-btn') as HTMLButtonElement;
    const spinner = this.container.querySelector('#loading-spinner') as HTMLElement;
    btn.disabled = true;
    spinner.style.display = 'inline-block';

    try {
      const result = await (window as any).electronAPI.login({ email, password });
      if (result.success) {
        if (typeof (window as any).showInvoicePage === 'function') {
          (window as any).showInvoicePage();
        } else {
          window.location.reload();
        }
      } else {
        this.showError(result.error || 'Invalid credentials');
      }
    } catch (error) {
      this.showError('Login error: ' + error);
    } finally {
      btn.disabled = false;
      spinner.style.display = 'none';
    }
  }

  private showError(msg: string): void {
    const messageDiv = this.container.querySelector('#message') as HTMLElement;
    if (messageDiv) {
      messageDiv.textContent = msg;
      messageDiv.style.display = 'block';
    }
  }
}
