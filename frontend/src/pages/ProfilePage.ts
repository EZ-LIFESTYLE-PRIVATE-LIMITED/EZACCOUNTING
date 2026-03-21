import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';

export interface ProfilePageProps {
    container: HTMLElement;
    showSidebar?: boolean;
    onNavigate?: (path: string) => void;
}

export class ProfilePage {
    private container: HTMLElement;
    private props: ProfilePageProps;
    private sidebar: Sidebar | null = null;
    private header: Header | null = null;
    private profileData: any = null;

    constructor(props: ProfilePageProps) {
        this.container = props.container;
        this.props = props;
    }

    public async render(): Promise<void> {
        this.container.innerHTML = `
            <div class="ProfilePage" style="height: 100vh; background: #f5f7fa;">
              <div class="page-layout" style="display: flex; height: 100%;">
                ${this.props.showSidebar ? '<div class="sidebar-container"></div>' : ''}
                <div class="main-content" style="flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                  <div class="header-container"></div>
                  <div class="content-container" style="flex: 1; padding: 20px; overflow-y: auto;">
                    <div class="registration-card" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <h2 style="margin-bottom: 24px; color: #333;">Edit Business Profile</h2>
                      <form id="profile-form" class="registration-form" style="display: flex; flex-direction: column; gap: 16px;">
                        <div id="message" style="display: none; padding: 12px; border-radius: 6px;"></div>
                        
                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                          <div class="form-group" style="display: flex; flex-direction: column;">
                            <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">Your Name</label>
                            <input type="text" id="user_name" name="user_name" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                          </div>
                          <div class="form-group" style="display: flex; flex-direction: column;">
                            <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">Organization Name *</label>
                            <input type="text" id="name" name="name" required style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                          </div>
                        </div>

                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                          <div class="form-group" style="display: flex; flex-direction: column;">
                            <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">GSTIN</label>
                            <input type="text" id="gstin" name="gstin" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                          </div>
                          <div class="form-group" style="display: flex; flex-direction: column;">
                            <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">Mobile</label>
                            <input type="text" id="phone" name="phone" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                          </div>
                        </div>

                        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                          <div class="form-group" style="display: flex; flex-direction: column;">
                            <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">Email</label>
                            <input type="email" id="email" name="email" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                          </div>
                          <div class="form-group" style="display: flex; flex-direction: column;">
                            <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">Password</label>
                            <input type="password" id="password" name="password" placeholder="Leave blank to keep unchanged" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;">
                          </div>
                        </div>

                        <div class="form-group" style="display: flex; flex-direction: column;">
                          <label style="margin-bottom: 6px; font-weight: 500; font-size: 14px;">Business Address</label>
                          <textarea id="business_address" name="business_address" rows="3" style="padding: 10px; border: 1px solid #ddd; border-radius: 6px;"></textarea>
                        </div>
                        
                        <div class="form-actions" style="display: flex; justify-content: flex-end; margin-top: 10px;">
                          <button type="submit" class="btn btn-primary" id="save-btn" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px 24px; border: none; border-radius: 6px; font-weight: 500; cursor: pointer;">
                            Save Profile
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
        `;

        this.initializeComponents();
        this.attachEventListeners();
        await this.loadProfile();
    }

    private initializeComponents(): void {
        if (this.props.showSidebar) {
            const sidebarContainer = this.container.querySelector('.sidebar-container') as HTMLElement;
            if (sidebarContainer) {
                this.sidebar = new Sidebar(sidebarContainer, {
                    currentPath: '/profile',
                    onNavigate: this.props.onNavigate
                });
                this.sidebar.render();
            }
        }

        const headerContainer = this.container.querySelector('.header-container') as HTMLElement;
        if (headerContainer) {
            this.header = new Header(headerContainer, {
                title: 'My Profile',
                subtitle: 'Manage your business organization details',
                icon: '👤',
                showCreateButton: false,
                showSidebarToggle: true,
                onSidebarToggle: () => this.sidebar?.toggle()
            });
            this.header.render();
        }
    }

    private attachEventListeners(): void {
        const form = this.container.querySelector('#profile-form') as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    }

    private async loadProfile(): Promise<void> {
        try {
            const result = await (window as any).electronAPI.getProfile();
            if (result.success && result.data) {
                this.profileData = result.data;
                const form = this.container.querySelector('#profile-form') as HTMLFormElement;
                if (form) {
                    (form.querySelector('#user_name') as HTMLInputElement).value = this.profileData.user_name || '';
                    (form.querySelector('#name') as HTMLInputElement).value = this.profileData.name || '';
                    (form.querySelector('#gstin') as HTMLInputElement).value = this.profileData.gstin || '';
                    (form.querySelector('#phone') as HTMLInputElement).value = this.profileData.phone || '';
                    (form.querySelector('#email') as HTMLInputElement).value = this.profileData.email || '';
                    (form.querySelector('#business_address') as HTMLTextAreaElement).value = this.profileData.business_address || '';
                }
            } else {
                this.showMessage('Failed to load profile', 'error');
            }
        } catch (error) {
            this.showMessage('Error loading profile: ' + error, 'error');
        }
    }

    private async handleFormSubmit(event: Event): Promise<void> {
        event.preventDefault();
        
        const form = event.target as HTMLFormElement;
        const formData = new FormData(form);
        const btn = this.container.querySelector('#save-btn') as HTMLButtonElement;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        
        const updateData: any = {
            user_name: formData.get('user_name'),
            name: formData.get('name'),
            gstin: formData.get('gstin'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            business_address: formData.get('business_address')
        };

        const pwd = formData.get('password') as string;
        if (pwd) {
            updateData.password = pwd;
        }

        try {
            const result = await (window as any).electronAPI.updateProfile(updateData);
            if (result.success) {
                this.showMessage('Profile updated successfully', 'success');
                if (pwd) {
                    (form.querySelector('#password') as HTMLInputElement).value = '';
                }
            } else {
                this.showMessage(result.error || 'Failed to update profile', 'error');
            }
        } catch (err) {
            this.showMessage('Error: ' + err, 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Save Profile';
        }
    }

    private showMessage(msg: string, type: 'success' | 'error'): void {
        const messageDiv = this.container.querySelector('#message') as HTMLElement;
        if (messageDiv) {
            messageDiv.textContent = msg;
            messageDiv.style.display = 'block';
            messageDiv.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
            messageDiv.style.color = type === 'success' ? '#155724' : '#721c24';
            messageDiv.style.border = `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`;
            
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 3000);
        }
    }

    public destroy(): void {
        this.container.innerHTML = '';
        this.sidebar = null;
        this.header = null;
    }
}
