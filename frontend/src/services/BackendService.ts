import { getAppConfig } from '../config/app';

export interface BackendHealthResponse {
  status: string;
  uptime: number;
  timestamp: string;
}

export interface BackendStatusResponse {
  message: string;
  timestamp: string;
}

export class BackendService {
  private config = getAppConfig();

  /**
   * Check backend connection health
   */
  public async checkHealth(): Promise<{ connected: boolean; data?: BackendHealthResponse; error?: string }> {
    try {
      const response = await fetch(`${this.config.backendUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as BackendHealthResponse;
      return { connected: true, data };
    } catch (error) {
      return { 
        connected: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * Get backend status
   */
  public async getStatus(): Promise<{ connected: boolean; data?: BackendStatusResponse; error?: string }> {
    try {
      const response = await fetch(`${this.config.backendUrl}/`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json() as BackendStatusResponse;
      return { connected: true, data };
    } catch (error) {
      return { 
        connected: false, 
        error: (error as Error).message 
      };
    }
  }

  /**
   * Get backend URL
   */
  public getBackendUrl(): string {
    return this.config.backendUrl;
  }

  /**
   * Test backend connectivity
   */
  public async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.backendUrl}/health`, {
        method: 'GET',
        timeout: 5000 // 5 second timeout
      } as any);
      
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}
