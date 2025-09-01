// Salesforce Analytics API Service
// This service handles real connections to Salesforce Analytics Cloud (Tableau CRM)

import { type Integration, type PlatformDashboard } from '@/lib/api/integration-api'

export interface SalesforceConfig {
  instance_url: string
  client_id: string
  client_secret?: string
  username?: string
  password?: string
  security_token?: string
  api_version?: string
  sandbox?: boolean
}

export interface SalesforceCredentials {
  access_token?: string
  refresh_token?: string
  instance_url?: string
  id?: string
  token_type?: string
  issued_at?: string
  signature?: string
}

export class SalesforceService {
  private config: SalesforceConfig
  private credentials: SalesforceCredentials | null = null

  constructor(config: SalesforceConfig) {
    this.config = {
      api_version: '58.0',
      sandbox: false,
      ...config
    }
  }

  /**
   * Test connection to Salesforce
   */
  async testConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        return authResult
      }

      // Get organization info to verify connection
      const orgInfo = await this.getOrganizationInfo()
      
      return {
        success: true,
        data: {
          org_type: orgInfo.OrganizationType,
          org_name: orgInfo.Name,
          api_version: this.config.api_version,
          features: ['analytics', 'reports', 'dashboards'],
          instance_url: this.credentials?.instance_url
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
   * Discover dashboards from Salesforce Analytics
   */
  async discoverDashboards(): Promise<PlatformDashboard[]> {
    try {
      const authResult = await this.authenticate()
      if (!authResult.success) {
        throw new Error(authResult.error || 'Failed to authenticate')
      }

      const dashboards: PlatformDashboard[] = []

      // Get Analytics dashboards (Tableau CRM)
      try {
        const analyticsDashboards = await this.getAnalyticsDashboards()
        dashboards.push(...analyticsDashboards)
      } catch (error) {
        console.warn('Failed to get Analytics dashboards:', error)
      }

      // Get Reports that can be embedded
      try {
        const reports = await this.getReports()
        dashboards.push(...reports)
      } catch (error) {
        console.warn('Failed to get Reports:', error)
      }

      return dashboards
    } catch (error) {
      throw new Error(`Failed to discover dashboards: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Authenticate with Salesforce using username/password flow
   */
  private async authenticate(): Promise<{ success: boolean; error?: string }> {
    if (!this.config.username || !this.config.password || !this.config.client_id || !this.config.client_secret) {
      return { success: false, error: 'Username, password, client_id, and client_secret are required' }
    }

    // Validate client_id format (should be long alphanumeric string)
    if (this.config.client_id.length < 50) {
      return { success: false, error: 'Client ID appears to be too short. Please check your Connected App Consumer Key.' }
    }

    // Validate client_secret format
    if (this.config.client_secret.length < 30) {
      return { success: false, error: 'Client Secret appears to be too short. Please check your Connected App Consumer Secret.' }
    }

    try {
      // Auto-detect sandbox vs production based on instance URL
      const isDevOrg = this.config.instance_url?.includes('develop') || this.config.instance_url?.includes('scratch')
      const isSandbox = (this.config.sandbox === true || this.config.sandbox === 'true') || this.config.instance_url?.includes('test.salesforce.com') || this.config.instance_url?.includes('sandbox')
      
      // Development orgs (.develop.my.salesforce.com) are NOT sandboxes and should use login.salesforce.com
      // Only use test.salesforce.com for actual sandbox orgs
      let loginUrl
      if (isDevOrg) {
        // Force dev orgs to use login.salesforce.com regardless of sandbox setting
        loginUrl = 'https://login.salesforce.com/services/oauth2/token'
      } else if (isSandbox) {
        loginUrl = 'https://test.salesforce.com/services/oauth2/token'
      } else {
        loginUrl = 'https://login.salesforce.com/services/oauth2/token'
      }

      // Ensure security token is properly trimmed and concatenated
      const securityToken = (this.config.security_token || '').trim()
      const fullPassword = this.config.password + securityToken

      console.log('')
      
      console.log('Salesforce auth attempt:', {
        loginUrl,
        client_id: this.config.client_id,
        username: this.config.username,
        hasClientSecret: !!this.config.client_secret,
        hasPassword: !!this.config.password,
        hasSecurityToken: !!securityToken,
        securityTokenLength: securityToken.length,
        instanceUrl: this.config.instance_url,
        isDevOrg,
        isSandbox
      })

      // Try manual URL encoding to avoid any URLSearchParams issues
      const bodyParams = [
        `grant_type=password`,
        `client_id=${encodeURIComponent(this.config.client_id)}`,
        `client_secret=${encodeURIComponent(this.config.client_secret)}`,
        `username=${encodeURIComponent(this.config.username)}`,
        `password=${encodeURIComponent(fullPassword)}`
      ].join('&')

      console.log('Request body length:', bodyParams.length)

      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: bodyParams
      })

      console.log('AAAAA', response)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = await response.text()
        }
        console.error('Salesforce auth error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          loginUrl,
          username: this.config.username,
          instanceUrl: this.config.instance_url,
          isDevOrg,
          isSandbox,
          clientId: this.config.client_id?.substring(0, 10) + '...',
          hasClientSecret: !!this.config.client_secret,
          passwordLength: this.config.password?.length,
          securityTokenLength: securityToken.length
        })
        
        const errorMessage = typeof errorData === 'object' && errorData 
          ? (errorData.error_description || errorData.error) 
          : errorData || response.statusText
          
        return { 
          success: false, 
          error: `Authentication failed: ${errorMessage}. Status: ${response.status}` 
        }
      }

      const tokenData = await response.json()

      this.credentials = {
        access_token: tokenData.access_token,
        instance_url: tokenData.instance_url,
        id: tokenData.id,
        token_type: tokenData.token_type || 'Bearer',
        issued_at: tokenData.issued_at,
        signature: tokenData.signature
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
   * Get organization information
   */
  private async getOrganizationInfo(): Promise<any> {
    const query = "SELECT Id, Name, OrganizationType, InstanceName FROM Organization LIMIT 1"
    const response = await this.makeApiRequest(`/services/data/v${this.config.api_version}/query`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    }, { q: query })

    if (response.records && response.records.length > 0) {
      return response.records[0]
    }
    throw new Error('Failed to get organization info')
  }

  /**
   * Get Analytics dashboards (Tableau CRM)
   */
  private async getAnalyticsDashboards(): Promise<PlatformDashboard[]> {
    try {
      // Query for Wave/Analytics dashboards
      const query = `
        SELECT Id, Name, Description, CreatedDate, LastModifiedDate, FolderId, Folder.Name 
        FROM Dashboard 
        WHERE Type = 'Wave'
        ORDER BY LastModifiedDate DESC
      `

      const response = await this.makeApiRequest(`/services/data/v${this.config.api_version}/query`, {
        method: 'GET'
      }, { q: query })

      const dashboards: PlatformDashboard[] = []

      for (const record of response.records || []) {
        dashboards.push({
          id: record.Id,
          name: record.Name,
          description: record.Description,
          url: `${this.credentials?.instance_url}/analytics/wave/dashboard/${record.Id}`,
          embed_url: `${this.credentials?.instance_url}/analytics/wave/dashboard/${record.Id}?embedded=true`,
          thumbnail_url: `${this.credentials?.instance_url}/analytics/wave/dashboard/${record.Id}/thumbnail`,
          platform: 'salesforce',
          folder_path: record.Folder?.Name ? `/${record.Folder.Name}` : '/Analytics',
          created_at: record.CreatedDate,
          updated_at: record.LastModifiedDate
        })
      }

      return dashboards
    } catch (error) {
      console.warn('Analytics dashboards not available or accessible:', error)
      return []
    }
  }

  /**
   * Get Reports that can be embedded
   */
  private async getReports(): Promise<PlatformDashboard[]> {
    try {
      const query = `
        SELECT Id, Name, Description, CreatedDate, LastModifiedDate, FolderId, Folder.Name 
        FROM Report 
        WHERE Format = 'Tabular' OR Format = 'Summary' OR Format = 'Matrix'
        ORDER BY LastModifiedDate DESC
        LIMIT 50
      `

      const response = await this.makeApiRequest(`/services/data/v${this.config.api_version}/query`, {
        method: 'GET'
      }, { q: query })

      const dashboards: PlatformDashboard[] = []

      for (const record of response.records || []) {
        dashboards.push({
          id: record.Id,
          name: record.Name,
          description: record.Description,
          url: `${this.credentials?.instance_url}/${record.Id}`,
          embed_url: `${this.credentials?.instance_url}/analytics/reportEmbed?reportId=${record.Id}`,
          platform: 'salesforce',
          folder_path: record.Folder?.Name ? `/${record.Folder.Name}` : '/Reports',
          created_at: record.CreatedDate,
          updated_at: record.LastModifiedDate
        })
      }

      return dashboards
    } catch (error) {
      console.warn('Failed to get reports:', error)
      return []
    }
  }

  /**
   * Make authenticated API request to Salesforce
   */
  private async makeApiRequest(endpoint: string, options: RequestInit = {}, params?: Record<string, string>): Promise<any> {
    if (!this.credentials?.access_token || !this.credentials?.instance_url) {
      throw new Error('Not authenticated')
    }

    let url = `${this.credentials.instance_url}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams(params)
      url += `?${searchParams.toString()}`
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `${this.credentials.token_type || 'Bearer'} ${this.credentials.access_token}`,
        'Accept': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Salesforce API request failed: ${response.status} ${errorText}`)
    }

    return response.json()
  }

  /**
   * Get embed URL for a dashboard with proper authentication
   */
  async getEmbedUrl(dashboardId: string, dashboardType: 'analytics' | 'report' = 'analytics'): Promise<string> {
    if (!this.credentials?.instance_url) {
      throw new Error('Not authenticated')
    }

    if (dashboardType === 'analytics') {
      return `${this.credentials.instance_url}/analytics/wave/dashboard/${dashboardId}?embedded=true&showHeader=false`
    } else {
      return `${this.credentials.instance_url}/analytics/reportEmbed?reportId=${dashboardId}&showDetails=false`
    }
  }
}

export default SalesforceService