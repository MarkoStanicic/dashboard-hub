// Power BI REST API Service
// This service handles real connections to Power BI Service

import { type Integration, type PlatformDashboard } from '@/lib/api/integration-api'

export interface PowerBIConfig {
  tenant_id: string
  client_id: string
  client_secret?: string
  workspace_id?: string
  authority?: string
  scope?: string
}

export interface PowerBICredentials {
  access_token?: string
  refresh_token?: string
  expires_at?: Date
  token_type?: string
}

export class PowerBIService {
  private config: PowerBIConfig
  private credentials: PowerBICredentials | null = null

  constructor(config?: PowerBIConfig) {
    this.config = {
      authority: 'https://login.microsoftonline.com',
      scope: 'https://analysis.windows.net/powerbi/api/.default',
      tenant_id: '',
      client_id: '',
      ...config
    }
  }

  /**
   * Set configuration (used when initialized without config)
   */
  setConfig(config: PowerBIConfig) {
    this.config = {
      authority: 'https://login.microsoftonline.com',
      scope: 'https://analysis.windows.net/powerbi/api/.default',
      ...config
    }
    // Reset credentials when config changes
    this.credentials = null
  }

  /**
   * Test connection to Power BI service
   */
  async testConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        return authResult
      }

      // Get workspaces to verify connection (skip user info for service principals)
      const workspaces = await this.getWorkspaces()

      return {
        success: true,
        data: {
          tenant_name: this.config.tenant_id,
          workspace_count: workspaces.length,
          user_email: 'Service Principal',
          permissions: ['read', 'embed'],
          message: workspaces.length === 0 ? 'No workspaces found. Create some Power BI content to sync.' : 'Connection successful!'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection test failed'
      }
    }
  }

  /**
   * Discover dashboards from Power BI
   */
  async discoverDashboards(): Promise<PlatformDashboard[]> {
    try {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error(authResult.error || 'Failed to authenticate')
      }

      const dashboards: PlatformDashboard[] = []

      if (this.config.workspace_id) {
        // Get dashboards from specific workspace
        const workspaceDashboards = await this.getWorkspaceDashboards(this.config.workspace_id)
        dashboards.push(...workspaceDashboards)
      } else {
        // Get dashboards from all accessible workspaces
        const workspaces = await this.getWorkspaces()
        
        if (workspaces.length === 0) {
          console.info('No Power BI workspaces found. Create some content in Power BI to sync dashboards.')
          return []
        }
        
        for (const workspace of workspaces) {
          try {
            const workspaceDashboards = await this.getWorkspaceDashboards(workspace.id)
            dashboards.push(...workspaceDashboards)
          } catch (error) {
            console.warn(`Failed to get dashboards from workspace ${workspace.name}:`, error)
          }
        }
      }

      return dashboards
    } catch (error) {
      throw new Error(`Failed to discover dashboards: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Authenticate with Power BI using client credentials flow
   */
  private async authenticate(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.client_secret) {
      return { success: false, error: 'Client secret is required for authentication' }
    }

    try {
      const tokenUrl = `${this.config.authority}/${this.config.tenant_id}/oauth2/v2.0/token`

      const params = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
        scope: this.config.scope!
      })

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { 
          success: false, 
          error: `Authentication failed: ${errorData.error_description || response.statusText}` 
        }
      }

      const tokenData = await response.json()

      this.credentials = {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type || 'Bearer',
        expires_at: new Date(Date.now() + (tokenData.expires_in * 1000))
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }
    }
  }

  /**
   * Get current user information
   */
  private async getCurrentUser(): Promise<any> {
    const response = await this.makeApiRequest('https://api.powerbi.com/v1.0/myorg/users')
    return response
  }

  /**
   * Get accessible workspaces
   */
  private async getWorkspaces(): Promise<any[]> {
    try {
      const response = await this.makeApiRequest('https://api.powerbi.com/v1.0/myorg/groups')
      const workspaces = response.value || []
      
      // Also try to access "My workspace" which might not be in groups list
      // "My workspace" often requires different API endpoint
      try {
        const myWorkspaceContent = await this.getMyWorkspaceContent()
        if (myWorkspaceContent.length > 0) {
          // Add a fake workspace entry for "My workspace"
          workspaces.push({
            id: 'my-workspace',
            name: 'My workspace',
            isOnDedicatedCapacity: false,
            type: 'Personal'
          })
        }
      } catch (error) {
        console.warn('Could not access My workspace:', error)
      }
      
      return workspaces
    } catch (error) {
      console.warn('No workspaces accessible or API endpoint not available:', error)
      return []
    }
  }

  /**
   * Get content from "My workspace" using different API endpoints
   */
  private async getMyWorkspaceContent(): Promise<PlatformDashboard[]> {
    try {
      const platformDashboards: PlatformDashboard[] = []
      
      // Get dashboards from My workspace (different endpoint)
      try {
        const dashboardsResponse = await this.makeApiRequest(
          'https://api.powerbi.com/v1.0/myorg/dashboards'
        )
        const dashboards = dashboardsResponse.value || []
        
        for (const dashboard of dashboards) {
          platformDashboards.push({
            id: dashboard.id,
            name: dashboard.displayName,
            description: dashboard.description,
            url: dashboard.webUrl,
            embed_url: dashboard.embedUrl,
            thumbnail_url: dashboard.thumbnailUrl,
            platform: 'powerbi',
            workspace_name: 'My workspace',
            created_at: dashboard.createdDateTime || new Date().toISOString(),
            updated_at: dashboard.lastModifiedDateTime || new Date().toISOString()
          })
        }
      } catch (error) {
        console.warn('Could not get dashboards from My workspace:', error)
      }

      // Get reports from My workspace
      try {
        const reportsResponse = await this.makeApiRequest(
          'https://api.powerbi.com/v1.0/myorg/reports'
        )
        const reports = reportsResponse.value || []
        
        for (const report of reports) {
          platformDashboards.push({
            id: report.id,
            name: report.name,
            description: report.description,
            url: report.webUrl,
            embed_url: report.embedUrl,
            thumbnail_url: report.thumbnailUrl,
            platform: 'powerbi',
            workspace_name: 'My workspace',
            created_at: report.createdDateTime || new Date().toISOString(),
            updated_at: report.modifiedDateTime || new Date().toISOString()
          })
        }
      } catch (error) {
        console.warn('Could not get reports from My workspace:', error)
      }
      
      return platformDashboards
    } catch (error) {
      console.warn('Failed to get My workspace content:', error)
      return []
    }
  }

  /**
   * Get dashboards from a specific workspace
   */
  private async getWorkspaceDashboards(workspaceId: string): Promise<PlatformDashboard[]> {
    try {
      // Handle special case for "My workspace"
      if (workspaceId === 'my-workspace') {
        return await this.getMyWorkspaceContent()
      }
      
      // Get dashboards from regular workspace
      const dashboardsResponse = await this.makeApiRequest(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/dashboards`
      )
      const dashboards = dashboardsResponse.value || []

      // Get reports (which can also be embedded)
      const reportsResponse = await this.makeApiRequest(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports`
      )
      const reports = reportsResponse.value || []

      // Get workspace info
      const workspace = await this.makeApiRequest(
        `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}`
      )

      const platformDashboards: PlatformDashboard[] = []

      // Add dashboards
      for (const dashboard of dashboards) {
        platformDashboards.push({
          id: dashboard.id,
          name: dashboard.displayName,
          description: dashboard.description,
          url: dashboard.webUrl,
          embed_url: dashboard.embedUrl,
          thumbnail_url: dashboard.thumbnailUrl,
          platform: 'powerbi',
          workspace_name: workspace.name,
          created_at: dashboard.createdDateTime || new Date().toISOString(),
          updated_at: dashboard.lastModifiedDateTime || new Date().toISOString()
        })
      }

      // Add reports
      for (const report of reports) {
        platformDashboards.push({
          id: report.id,
          name: report.name,
          description: report.description,
          url: report.webUrl,
          embed_url: report.embedUrl,
          thumbnail_url: report.thumbnailUrl,
          platform: 'powerbi',
          workspace_name: workspace.name,
          created_at: report.createdDateTime || new Date().toISOString(),
          updated_at: report.modifiedDateTime || new Date().toISOString()
        })
      }

      return platformDashboards
    } catch (error) {
      console.warn(`Failed to get dashboards from workspace ${workspaceId}:`, error)
      return []
    }
  }

  /**
   * Generate embed token for a dashboard
   */
  async generateEmbedToken(dashboardId: string, workspaceId: string): Promise<string> {
    const embedTokenUrl = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/dashboards/${dashboardId}/GenerateToken`

    const response = await this.makeApiRequest(embedTokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        accessLevel: 'View',
        allowSaveAs: false
      })
    })

    return response.token
  }

  /**
   * Make authenticated API request to Power BI
   */
  private async makeApiRequest(url: string, options: RequestInit = {}): Promise<any> {
    if (!this.credentials?.access_token) {
      throw new Error('Not authenticated')
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `${this.credentials.token_type} ${this.credentials.access_token}`,
        'Accept': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      
      // Handle specific error cases
      if (response.status === 404) {
        throw new Error(`Power BI API endpoint not found (404). This might be normal for new accounts with no content.`)
      }
      
      throw new Error(`Power BI API request failed: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(): boolean {
    if (!this.credentials?.expires_at) return true
    return new Date() >= this.credentials.expires_at
  }

  /**
   * Generate embed token for a specific dashboard
   */
  async generateEmbedToken(config: PowerBIConfig, dashboardId: string, workspaceId: string = 'me'): Promise<{ token: string; expiration: string }> {
    console.log('🔵 [PowerBI Service] Starting embed token generation:', { dashboardId, workspaceId });
    
    // Ensure we're authenticated
    console.log('🔵 [PowerBI Service] Authenticating...');
    const authResult = await this.authenticate()
    if (!authResult.success) {
      console.error('❌ [PowerBI Service] Authentication failed:', authResult.error);
      throw new Error('Authentication failed: ' + authResult.error)
    }
    console.log('✅ [PowerBI Service] Authentication successful');

    const embedUrl = workspaceId === 'me' 
      ? `https://api.powerbi.com/v1.0/myorg/dashboards/${dashboardId}/GenerateToken`
      : `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/dashboards/${dashboardId}/GenerateToken`

    console.log('🔵 [PowerBI] Generating embed token for:', { dashboardId, workspaceId, embedUrl })

    try {
      console.log('🔵 [PowerBI] Making API request to:', embedUrl);
      const response = await this.makeApiRequest(embedUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          accessLevel: 'View'
        })
      })

      console.log('✅ [PowerBI] Embed token generated successfully:', { hasToken: !!response.token, expiration: response.expiration })
      
      return {
        token: response.token,
        expiration: response.expiration
      }
    } catch (error: any) {
      console.error('❌ [PowerBI] Embed token generation failed:', error.message)
      
      if (error.message.includes('403')) {
        throw new Error(`Power BI API Permissions Error: Your Azure AD app needs 'Content.Create' delegated permission for embed tokens. Go to Azure Portal → Your App → API permissions → Add Power BI Service permissions.`)
      }
      
      throw new Error(`Failed to generate embed token: ${error.message}`)
    }
  }
}

export default PowerBIService