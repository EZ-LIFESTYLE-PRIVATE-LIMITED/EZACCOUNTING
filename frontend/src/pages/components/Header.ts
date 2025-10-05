// Types
export interface HeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  showCreateButton?: boolean;
  createButtonText?: string;
  createButtonIcon?: string;
  onCreateClick?: () => void;
  showSidebarToggle?: boolean;
  onSidebarToggle?: () => void;
}

/**
 * Header Component
 * Displays page title, subtitle, and action buttons
 */
export class Header {
  private container: HTMLElement;
  private props: HeaderProps;

  constructor(container: HTMLElement, props: HeaderProps = { title: 'Dashboard' }) {
    this.container = container;
    this.props = {
      showCreateButton: false,
      createButtonText: 'Create',
      createButtonIcon: '➕',
      showSidebarToggle: false,
      ...props
    };
  }

  /**
   * Render the header component
   */
  public render(): void {
    this.container.innerHTML = this.getHeaderHTML();
    this.attachEventListeners();
  }

  /**
   * Get header HTML structure
   */
  private getHeaderHTML(): string {
    return `
      <div class="header">
        <div class="header-left">
          ${this.getSidebarToggleHTML()}
          <div class="header-info">
            <div class="header-title">
              ${this.props.icon ? `<span class="header-icon">${this.props.icon}</span>` : ''}
              <h1>${this.props.title}</h1>
            </div>
            ${this.props.subtitle ? `<p class="header-subtitle">${this.props.subtitle}</p>` : ''}
          </div>
        </div>

        <div class="header-right">
          ${this.getCreateButtonHTML()}
        </div>
      </div>
    `;
  }

  /**
   * Get sidebar toggle button HTML
   */
  private getSidebarToggleHTML(): string {
    if (!this.props.showSidebarToggle) {
      return '';
    }

    return `
      <button class="sidebar-toggle" type="button" aria-label="Toggle sidebar">
        <span class="toggle-icon">☰</span>
      </button>
    `;
  }

  /**
   * Get create button HTML
   */
  private getCreateButtonHTML(): string {
    if (!this.props.showCreateButton) {
      return '';
    }

    return `
      <button class="create-button" type="button">
        <span class="button-icon">${this.props.createButtonIcon}</span>
        <span class="button-text">${this.props.createButtonText}</span>
      </button>
    `;
  }

  /**
   * Attach event listeners
   */
  private attachEventListeners(): void {
    // Sidebar toggle
    const sidebarToggle = this.container.querySelector('.sidebar-toggle');
    if (sidebarToggle && this.props.onSidebarToggle) {
      sidebarToggle.addEventListener('click', this.props.onSidebarToggle);
    }

    // Create button
    const createButton = this.container.querySelector('.create-button');
    if (createButton && this.props.onCreateClick) {
      createButton.addEventListener('click', this.props.onCreateClick);
    }
  }

  /**
   * Update header props and re-render
   */
  public updateProps(newProps: Partial<HeaderProps>): void {
    this.props = { ...this.props, ...newProps };
    this.render();
  }

  /**
   * Update title
   */
  public updateTitle(title: string, subtitle?: string): void {
    this.props.title = title;
    if (subtitle !== undefined) {
      this.props.subtitle = subtitle;
    }
    this.render();
  }

  /**
   * Update create button
   */
  public updateCreateButton(
    text: string, 
    icon: string, 
    onClick?: () => void
  ): void {
    this.props.createButtonText = text;
    this.props.createButtonIcon = icon;
    this.props.onCreateClick = onClick;
    this.props.showCreateButton = true;
    this.render();
  }

  /**
   * Hide create button
   */
  public hideCreateButton(): void {
    this.props.showCreateButton = false;
    this.render();
  }

  /**
   * Show create button
   */
  public showCreateButton(): void {
    this.props.showCreateButton = true;
    this.render();
  }

  /**
   * Update sidebar toggle
   */
  public updateSidebarToggle(show: boolean, onToggle?: () => void): void {
    this.props.showSidebarToggle = show;
    this.props.onSidebarToggle = onToggle;
    this.render();
  }

  /**
   * Set loading state for create button
   */
  public setCreateButtonLoading(loading: boolean): void {
    const createButton = this.container.querySelector('.create-button') as HTMLButtonElement;
    if (createButton) {
      if (loading) {
        createButton.disabled = true;
        createButton.innerHTML = `
          <span class="button-icon loading">⏳</span>
          <span class="button-text">Creating...</span>
        `;
      } else {
        createButton.disabled = false;
        createButton.innerHTML = `
          <span class="button-icon">${this.props.createButtonIcon}</span>
          <span class="button-text">${this.props.createButtonText}</span>
        `;
      }
    }
  }

  /**
   * Get current props
   */
  public getProps(): HeaderProps {
    return { ...this.props };
  }

  /**
   * Destroy component and cleanup
   */
  public destroy(): void {
    const sidebarToggle = this.container.querySelector('.sidebar-toggle');
    if (sidebarToggle && this.props.onSidebarToggle) {
      sidebarToggle.removeEventListener('click', this.props.onSidebarToggle);
    }

    const createButton = this.container.querySelector('.create-button');
    if (createButton && this.props.onCreateClick) {
      createButton.removeEventListener('click', this.props.onCreateClick);
    }

    this.container.innerHTML = '';
  }
}
