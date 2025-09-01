// Tableau REST API Service
// This service handles real connections to Tableau Server/Cloud

import { type Integration, type PlatformDashboard } from '@/lib/api/integration-api'

export interface TableauConfig {
  server_url: string
  site_id: string
  content_url?: string
  api_version?: string
  username?: string
  password?: string
  personal_access_token_name?: string
  personal_access_token_secret?: string
}

export interface TableauCredentials {
  token?: string
  site_id?: string
  user_id?: string
  expires_at?: Date
}

export class TableauService {
  private config: TableauConfig
  private credentials: TableauCredentials | null = null

  constructor(config: TableauConfig) {
    this.config = {
      api_version: '3.19',
      ...config
    }
  }

  /**
   * Test connection to Tableau server
   */
  async testConnection(): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const signInResult = await this.signIn()
      if (!signInResult.success) {
        return signInResult
      }

      // Get server info to verify connection
      const serverInfo = await this.getServerInfo()
      await this.signOut()

      return {
        success: true,
        data: {
          server_version: serverInfo.product_version,
          site_name: this.config.site_id,
          user_permissions: ['view', 'embed'],
          api_version: this.config.api_version
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
   * Discover dashboards from Tableau
   */
  async discoverDashboards(): Promise<PlatformDashboard[]> {
    try {
      const signInResult = await this.signIn()
      if (!signInResult.success) {
        throw new Error(signInResult.error || 'Failed to sign in')
      }

      const dashboards = await this.getWorkbooksWithViews()
      await this.signOut()

      return dashboards
    } catch (error) {
      throw new Error(`Failed to discover dashboards: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Sign in to Tableau server
   */
  private async signIn(): Promise<{ success: boolean; error?: string }> {
    try {
      const baseUrl = `${this.config.server_url}/api/${this.config.api_version}`
      const signInUrl = `${baseUrl}/auth/signin`

      const requestBody: any = {
        credentials: {
          site: {
            contentUrl: this.config.content_url || this.config.site_id
          }
        }
      }

      // Use Personal Access Token if available
      if (this.config.personal_access_token_name && this.config.personal_access_token_secret) {
        requestBody.credentials.personalAccessTokenName = this.config.personal_access_token_name
        requestBody.credentials.personalAccessTokenSecret = this.config.personal_access_token_secret
      } else if (this.config.username && this.config.password) {
        requestBody.credentials.name = this.config.username
        requestBody.credentials.password = this.config.password
      } else {
        return { success: false, error: 'No authentication credentials provided' }
      }

      const response = await fetch(signInUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        return { success: false, error: `Authentication failed: ${errorText}` }
      }

      const data = await response.json()
      
      // Try different response formats (Tableau API format can vary)
      const credentials = data.tsResponse?.credentials || data.credentials || data
      
      if (!credentials?.token) {
        return { success: false, error: `No authentication token received. Response: ${JSON.stringify(data)}` }
      }

      this.credentials = {
        token: credentials.token,
        site_id: credentials.site?.id,
        user_id: credentials.user?.id,
        expires_at: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      }
    }
  }

  /**
   * Sign out from Tableau server
   */
  private async signOut(): Promise<void> {
    if (!this.credentials?.token) return

    try {
      const baseUrl = `${this.config.server_url}/api/${this.config.api_version}`
      const signOutUrl = `${baseUrl}/auth/signout`

      await fetch(signOutUrl, {
        method: 'POST',
        headers: {
          'X-Tableau-Auth': this.credentials.token
        }
      })
    } catch (error) {
      console.warn('Failed to sign out:', error)
    } finally {
      this.credentials = null
    }
  }

  /**
   * Get server information
   */
  private async getServerInfo(): Promise<any> {
    if (!this.credentials?.token) {
      throw new Error('Not authenticated')
    }

    const baseUrl = `${this.config.server_url}/api/${this.config.api_version}`
    const serverInfoUrl = `${baseUrl}/serverinfo`

    const response = await fetch(serverInfoUrl, {
      headers: {
        'X-Tableau-Auth': this.credentials.token,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get server info: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tsResponse?.serverInfo || {}
  }

  /**
   * Get workbooks with their views (dashboards)
   */
  private async getWorkbooksWithViews(): Promise<PlatformDashboard[]> {
    if (!this.credentials?.token || !this.credentials.site_id) {
      throw new Error('Not authenticated')
    }

    const baseUrl = `${this.config.server_url}/api/${this.config.api_version}`
    const workbooksUrl = `${baseUrl}/sites/${this.credentials.site_id}/workbooks`

    const response = await fetch(workbooksUrl, {
      headers: {
        'X-Tableau-Auth': this.credentials.token,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get workbooks: ${response.statusText}`)
    }

    const data = await response.json()
    const workbooks = data.tsResponse?.workbooks?.workbook || []

    const dashboards: PlatformDashboard[] = []

    // Get views for each workbook
    for (const workbook of workbooks) {
      try {
        const views = await this.getWorkbookViews(workbook.id)
        
        for (const view of views) {
          // Only include dashboards (not worksheets)
          if (view.contentUrl && !view.contentUrl.includes('sheets/')) {
            dashboards.push({
              id: view.id,
              name: view.name,
              description: workbook.description,
              url: `${this.config.server_url}/#/views/${view.contentUrl}`,
              embed_url: this.generateEmbedUrl(view.contentUrl),
              thumbnail_url: `${this.config.server_url}/api/${this.config.api_version}/sites/${this.credentials.site_id}/workbooks/${workbook.id}/views/${view.id}/previewImage`,
              platform: 'tableau',
              workbook_name: workbook.name,
              site_name: this.config.site_id,
              created_at: workbook.createdAt || new Date().toISOString(),
              updated_at: workbook.updatedAt || new Date().toISOString()
            })
          }
        }
      } catch (error) {
        console.warn(`Failed to get views for workbook ${workbook.name}:`, error)
      }
    }

    return dashboards
  }

  /**
   * Get views for a specific workbook
   */
  private async getWorkbookViews(workbookId: string): Promise<any[]> {
    if (!this.credentials?.token || !this.credentials.site_id) {
      throw new Error('Not authenticated')
    }

    const baseUrl = `${this.config.server_url}/api/${this.config.api_version}`
    const viewsUrl = `${baseUrl}/sites/${this.credentials.site_id}/workbooks/${workbookId}/views`

    const response = await fetch(viewsUrl, {
      headers: {
        'X-Tableau-Auth': this.credentials.token,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get views: ${response.statusText}`)
    }

    const data = await response.json()
    return data.tsResponse?.views?.view || []
  }

  /**
   * Generate embed URL for a view
   */
  private generateEmbedUrl(contentUrl: string): string {
    const sitePrefix = this.config.content_url ? `/t/${this.config.content_url}` : ''
    // Add additional parameters for better embedding experience
    return `${this.config.server_url}${sitePrefix}/views/${contentUrl}?:embed=y&:toolbar=no&:tabs=no&:showVizHome=no&:showShareOptions=false&:display_count=no&:showAppBanner=false&:origin=viz_share_link`
  }

  /**
   * Generate trusted URL for embedding (requires server-side implementation)
   */
  async generateTrustedUrl(viewUrl: string, username: string): Promise<string> {
    // This would typically be implemented on your backend to keep the trusted ticket generation secure
    // For now, return the regular embed URL
    return viewUrl
  }
}

export default TableauService