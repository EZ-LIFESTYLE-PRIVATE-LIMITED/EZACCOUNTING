// Types
export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  active?: boolean;
}

export interface SidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

/**
 * Sidebar Navigation Component
 * Handles navigation between different sections of the application
 */
export class Sidebar {
  private container: HTMLElement;
  private navigationItems: NavigationItem[];
  private onNavigate?: (path: string) => void;

  constructor(container: HTMLElement, props: SidebarProps = {}) {
    this.container = container;
    this.onNavigate = props.onNavigate;
    this.navigationItems = this.getNavigationItems(props.currentPath);
  }

  /**
   * Get navigation items configuration
   */
  private getNavigationItems(currentPath?: string): NavigationItem[] {
    const items: NavigationItem[] = [
      {
        id: 'invoices',
        label: 'Invoices',
        icon: '📄',
        path: '/invoices',
        active: currentPath === '/invoices'
      },
      {
        id: 'purchases',
        label: 'Purchases',
        icon: '🛒',
        path: '/purchases',
        active: currentPath === '/purchases'
      },
      {
        id: 'items',
        label: 'Items',
        icon: '📦',
        path: '/items',
        active: currentPath === '/items'
      },
      {
        id: 'vendors',
        label: 'Vendors',
        icon: '🏢',
        path: '/vendors',
        active: currentPath === '/vendors'
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        path: '/profile',
        active: currentPath === '/profile'
      },
      {
        id: 'gst-report',
        label: 'GST Report',
        icon: '📊',
        path: '/gst-report',
        active: currentPath === '/gst-report'
      }
    ];

    return items;
  }

  /**
   * Render the sidebar component
   */
  public render(): void {
    this.container.innerHTML = this.getSidebarHTML();
    this.attachEventListeners();
  }

  /**
   * Get sidebar HTML structure
   */
  private getSidebarHTML(): string {
    return `
      <div class="sidebar">
        <div class="sidebar-header">
          <div class="logo-section">
            <div class="logo">🏦</div>
            <div class="app-info">
              <h2 class="app-name">EZAccounting</h2>
              <p class="app-subtitle">GST Management</p>
            </div>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3 class="nav-section-title">Main Menu</h3>
            <ul class="nav-list">
              ${this.navigationItems.map(item => this.getNavigationItemHTML(item)).join('')}
            </ul>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <div class="user-details">
              <p class="user-name">Business User</p>
              <p class="user-role">Account Owner</p>
            </div>
          </div>
          <button class="logout-btn" id="logout-btn" title="Logout">
            <span class="logout-icon">🚪</span>
            <span class="logout-text">Logout</span>
          </button>
        </div>
      </div>
      
      <style>
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 12px 16px;
          margin-top: 12px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.2);
          border-radius: 8px;
          color: #dc3545;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .logout-btn:hover {
          background: rgba(220, 53, 69, 0.2);
          border-color: rgba(220, 53, 69, 0.3);
        }
        
        .logout-icon {
          font-size: 16px;
        }
      </style>
    `;
  }


  /**
   * Get individual navigation item HTML
   */
  private getNavigationItemHTML(item: NavigationItem): string {
    const activeClass = item.active ? 'active' : '';

    return `
      <li class="nav-item ${activeClass}" data-path="${item.path}">
        <button class="nav-link" type="button">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-label">${item.label}</span>
        </button>
      </li>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    const navLinks = this.container.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const button = event.currentTarget as HTMLButtonElement;
        const navItem = button.closest('.nav-item') as HTMLElement;
        const path = navItem?.getAttribute('data-path');

        if (path && this.onNavigate) {
          this.handleNavigation(path);
        }
      });
    });

    // Logout button
    const logoutBtn = this.container.querySelector('#logout-btn');
    logoutBtn?.addEventListener('click', async () => {
      // By-passing native 'confirm()' because Chromium has a known bug on Windows 
      // where native modals trap pointer-event cursors causing all inputs to freeze indefinitely.
      try {
        await (window as any).electronAPI.logout();
        
        // Let the index.html router handle the drop back to the Login display natively.
        if (this.onNavigate) {
          this.onNavigate('/logout');
        } else {
          window.location.reload();
        }
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }


  /**
   * Handle navigation click
   */
  private handleNavigation(path: string): void {
    // Update active state
    this.updateActiveItem(path);

    // Call navigation callback
    if (this.onNavigate) {
      this.onNavigate(path);
    }
  }

  /**
   * Update active navigation item
   */
  private updateActiveItem(activePath: string): void {
    const navItems = this.container.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const path = item.getAttribute('data-path');
      if (path === activePath) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * Update current path and refresh sidebar
   */
  public updateCurrentPath(path: string): void {
    this.navigationItems = this.getNavigationItems(path);
    this.render();
  }

  /**
   * Show/hide sidebar
   */
  public toggle(): void {
    this.container.classList.toggle('collapsed');
  }

  /**
   * Show sidebar
   */
  public show(): void {
    this.container.classList.remove('collapsed', 'hidden');
  }

  /**
   * Hide sidebar
   */
  public hide(): void {
    this.container.classList.add('hidden');
  }

  /**
   * Collapse sidebar
   */
  public collapse(): void {
    this.container.classList.add('collapsed');
  }

  /**
   * Expand sidebar
   */
  public expand(): void {
    this.container.classList.remove('collapsed');
  }

  /**
   * Get current active path
   */
  public getCurrentPath(): string | undefined {
    const activeItem = this.container.querySelector('.nav-item.active');
    return activeItem?.getAttribute('data-path') || undefined;
  }

  /**
   * Check if sidebar is collapsed
   */
  public isCollapsed(): boolean {
    return this.container.classList.contains('collapsed');
  }

  /**
   * Check if sidebar is visible
   */
  public isVisible(): boolean {
    return !this.container.classList.contains('hidden');
  }

  /**
   * Destroy component and cleanup
   */
  public destroy(): void {
    const navLinks = this.container.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.removeEventListener('click', (event) => {
        event.preventDefault();
        const button = event.currentTarget as HTMLButtonElement;
        const navItem = button.closest('.nav-item') as HTMLElement;
        const path = navItem?.getAttribute('data-path');

        if (path && this.onNavigate) {
          this.handleNavigation(path);
        }
      });
    });
    this.container.innerHTML = '';
  }
}
