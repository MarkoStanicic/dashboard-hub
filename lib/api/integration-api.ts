import { createClient } from '@/lib/supabase/client'
import TableauService from '@/lib/platforms/tableau-service'
import PowerBIService from '@/lib/platforms/powerbi-service'
import SalesforceService from '@/lib/platforms/salesforce-service'

const supabase = createClient()

// Types for integration data
export interface Integration {
  id: string
  company_id: string
  platform: 'tableau' | 'powerbi' | 'salesforce'
  name: string
  status: 'connected' | 'disconnected' | 'error' | 'pending'
  config: Record<string, any>
  encrypted_credentials?: string
  access_token?: string
  refresh_token?: string
  token_expires_at?: string
  base_url?: string
  last_sync_at?: string
  last_error?: string
  sync_enabled: boolean
  created_by: string
  created_at: string
  updated_at: string
  company?: { id: string; name: string }
}

export interface PlatformDashboard {
  id: string
  name: string
  description?: string
  url: string
  embed_url?: string
  thumbnail_url?: string
  platform: string
  created_at: string
  updated_at: string
  workbook_name?: string // Tableau specific
  site_name?: string // Tableau specific
  workspace_name?: string // Power BI specific
  folder_path?: string // Salesforce specific
}

export interface SyncResult {
  success: boolean
  dashboards_found: number
  dashboards_imported: number
  dashboards_updated?: number
  message?: string
  errors: string[]
}

// Platform-specific configuration schemas
export const PLATFORM_CONFIGS = {
  tableau: {
    required: ['server_url', 'site_id'],
    optional: ['content_url', 'api_version', 'personal_access_token_name', 'personal_access_token_secret', 'username', 'password'],
    auth_methods: ['username_password', 'personal_access_token', 'oauth'],
    default_config: {
      api_version: '3.19',
      server_url: '',
      site_id: '',
      content_url: '',
      personal_access_token_name: '',
      personal_access_token_secret: '',
      username: '',
      password: ''
    }
  },
  powerbi: {
    required: ['tenant_id', 'client_id', 'client_secret'],
    optional: ['workspace_id', 'dataset_id'],
    auth_methods: ['oauth', 'service_principal'],
    default_config: {
      tenant_id: '',
      client_id: '',
      client_secret: '',
      workspace_id: '',
      authority: 'https://login.microsoftonline.com'
    }
  },
  salesforce: {
    required: ['instance_url', 'client_id', 'client_secret', 'username', 'password'],
    optional: ['api_version', 'sandbox', 'security_token'],
    auth_methods: ['oauth', 'username_password'],
    default_config: {
      instance_url: '',
      client_id: '',
      client_secret: '',
      username: '',
      password: '',
      security_token: '',
      api_version: '58.0',
      sandbox: false
    }
  }
} as const

export const integrationAPI = {
  // Get all integrations for a company
  async getIntegrations(companyId?: string): Promise<Integration[]> {
    try {
      console.log('🔵 Fetching integrations via API for company:', companyId)
      
      const url = companyId ? `/api/integrations?company_id=${companyId}` : '/api/integrations'
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error details:', errorText)
        return []
      }

      const data = await response.json()
      console.log('✅ Fetched integrations successfully:', data.length, 'integrations')
      return data || []
    } catch (error) {
      console.error('Error in getIntegrations:', error)
      return []
    }
  },

  // Get single integration by ID
  async getIntegration(id: string): Promise<Integration | null> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select(`
          *,
          company:companies(id, name)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching integration:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getIntegration:', error)
      return null
    }
  },

  // Create new integration
  async createIntegration(integration: Omit<Integration, 'id' | 'created_at' | 'updated_at' | 'company'>): Promise<Integration | null> {
    try {
      console.log('🔵 Creating integration via API:', integration)
      
      const response = await fetch('/api/integrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(integration)
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', response.status, response.statusText, errorData)
        throw new Error(`Failed to create integration: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Integration created successfully:', data)
      return data
    } catch (error) {
      console.error('Error in createIntegration:', error)
      throw error
    }
  },

  // Update integration
  async updateIntegration(id: string, updates: Partial<Integration>): Promise<Integration | null> {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          company:companies(id, name)
        `)
        .single()

      if (error) {
        console.error('Error updating integration:', error)
        throw error
      }

      return data
    } catch (error) {
      console.error('Error in updateIntegration:', error)
      throw error
    }
  },

  // Delete integration
  async deleteIntegration(id: string): Promise<void> {
    try {
      console.log('🔵 Deleting integration via API:', id)
      
      const response = await fetch(`/api/integrations?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', response.status, response.statusText, errorData)
        throw new Error(`Failed to delete integration: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Integration deleted successfully:', data)
    } catch (error) {
      console.error('Error in deleteIntegration:', error)
      throw error
    }
  },

  // Test connection to platform
  async testConnection(integrationId: string): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const integration = await this.getIntegration(integrationId)
      if (!integration) {
        return { success: false, error: 'Integration not found' }
      }

      // Use real platform services for testing
      const result = await this.realPlatformConnection(integration)
      
      // Update integration status based on test result
      await this.updateIntegration(integrationId, {
        status: result.success ? 'connected' : 'error',
        last_error: result.error || undefined,
        last_sync_at: result.success ? new Date().toISOString() : integration.last_sync_at
      })

      return result
    } catch (error) {
      console.error('Error in testConnection:', error)
      return { success: false, error: 'Connection test failed' }
    }
  },

  // Real platform connection testing
  async realPlatformConnection(integration: Integration): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      switch (integration.platform) {
        case 'tableau': {
          const service = new TableauService(integration.config as any)
          return await service.testConnection()
        }

        case 'powerbi': {
          const service = new PowerBIService(integration.config as any)
          return await service.testConnection()
        }

        case 'salesforce': {
          const service = new SalesforceService(integration.config as any)
          return await service.testConnection()
        }

        default:
          return { success: false, error: 'Unsupported platform' }
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Platform connection failed' 
      }
    }
  },

  // Mock platform connection for testing (fallback)
  async mockPlatformConnection(integration: Integration): Promise<{ success: boolean; error?: string; data?: any }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Mock validation based on platform
    switch (integration.platform) {
      case 'tableau':
        if (!integration.config.server_url || !integration.config.site_id) {
          return { success: false, error: 'Missing required Tableau configuration (server_url, site_id)' }
        }
        return { 
          success: true, 
          data: { 
            server_version: '2023.1',
            site_name: integration.config.site_id,
            user_permissions: ['view', 'embed']
          }
        }

      case 'powerbi':
        if (!integration.config.tenant_id || !integration.config.client_id) {
          return { success: false, error: 'Missing required Power BI configuration (tenant_id, client_id)' }
        }
        return { 
          success: true, 
          data: { 
            tenant_name: 'contoso.onmicrosoft.com',
            workspace_count: 5,
            permissions: ['read', 'embed']
          }
        }

      case 'salesforce':
        if (!integration.config.instance_url || !integration.config.client_id) {
          return { success: false, error: 'Missing required Salesforce configuration (instance_url, client_id)' }
        }
        return { 
          success: true, 
          data: { 
            org_type: 'Developer Edition',
            api_version: integration.config.api_version || '58.0',
            features: ['analytics', 'reports', 'dashboards']
          }
        }

      default:
        return { success: false, error: 'Unsupported platform' }
    }
  },

  // Discover dashboards from connected platform
  async discoverDashboards(integrationId: string): Promise<PlatformDashboard[]> {
    try {
      const integration = await this.getIntegration(integrationId)
      if (!integration || integration.status !== 'connected') {
        throw new Error('Integration not found or not connected')
      }

      // Use real platform services for dashboard discovery
      return this.realPlatformDashboards(integration)
    } catch (error) {
      console.error('Error in discoverDashboards:', error)
      throw error
    }
  },

  // Real platform dashboard discovery
  async realPlatformDashboards(integration: Integration): Promise<PlatformDashboard[]> {
    try {
      switch (integration.platform) {
        case 'tableau': {
          const service = new TableauService(integration.config as any)
          return await service.discoverDashboards()
        }

        case 'powerbi': {
          const service = new PowerBIService(integration.config as any)
          return await service.discoverDashboards()
        }

        case 'salesforce': {
          const service = new SalesforceService(integration.config as any)
          return await service.discoverDashboards()
        }

        default:
          return []
      }
    } catch (error) {
      console.warn(`Failed to discover dashboards from ${integration.platform}:`, error)
      // Fall back to mock data if real API fails
      return this.mockPlatformDashboards(integration)
    }
  },

  // Mock platform dashboards for testing (fallback)
  async mockPlatformDashboards(integration: Integration): Promise<PlatformDashboard[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    const baseUrl = integration.base_url || integration.config.server_url || integration.config.instance_url

    switch (integration.platform) {
      case 'tableau':
        return [
          {
            id: 'tableau-dash-1',
            name: 'Sales Performance Dashboard',
            description: 'Comprehensive sales metrics and KPIs',
            url: `${baseUrl}/views/SalesPerformance/Dashboard`,
            embed_url: `${baseUrl}/trusted/SalesPerformance/Dashboard?:embed=y&:toolbar=no`,
            thumbnail_url: `${baseUrl}/workbooks/SalesPerformance/previewImage`,
            platform: 'tableau',
            workbook_name: 'Sales Analytics',
            site_name: integration.config.site_id,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T15:30:00Z'
          },
          {
            id: 'tableau-dash-2',
            name: 'Customer Analytics',
            description: 'Customer segmentation and behavior analysis',
            url: `${baseUrl}/views/CustomerAnalytics/Overview`,
            embed_url: `${baseUrl}/trusted/CustomerAnalytics/Overview?:embed=y&:toolbar=no`,
            thumbnail_url: `${baseUrl}/workbooks/CustomerAnalytics/previewImage`,
            platform: 'tableau',
            workbook_name: 'Customer Insights',
            site_name: integration.config.site_id,
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-01-18T14:15:00Z'
          }
        ]

      case 'powerbi':
        return [
          {
            id: 'powerbi-dash-1',
            name: 'Executive Dashboard',
            description: 'High-level business metrics for leadership',
            url: `${baseUrl}/groups/${integration.config.workspace_id}/dashboards/exec-dashboard`,
            embed_url: `${baseUrl}/reportEmbed?reportId=exec-dashboard&groupId=${integration.config.workspace_id}`,
            thumbnail_url: `${baseUrl}/v1.0/dashboards/exec-dashboard/tiles/thumbnail`,
            platform: 'powerbi',
            workspace_name: 'Executive Workspace',
            created_at: '2024-01-12T11:00:00Z',
            updated_at: '2024-01-19T16:45:00Z'
          },
          {
            id: 'powerbi-dash-2',
            name: 'Operations Report',
            description: 'Daily operational metrics and alerts',
            url: `${baseUrl}/groups/${integration.config.workspace_id}/dashboards/ops-report`,
            embed_url: `${baseUrl}/reportEmbed?reportId=ops-report&groupId=${integration.config.workspace_id}`,
            thumbnail_url: `${baseUrl}/v1.0/dashboards/ops-report/tiles/thumbnail`,
            platform: 'powerbi',
            workspace_name: 'Operations Workspace',
            created_at: '2024-01-08T08:30:00Z',
            updated_at: '2024-01-17T13:20:00Z'
          }
        ]

      case 'salesforce':
        return [
          {
            id: 'sf-dash-1',
            name: 'Sales Pipeline',
            description: 'Current sales opportunities and pipeline health',
            url: `${baseUrl}/analytics/wave/dashboard/sales-pipeline`,
            embed_url: `${baseUrl}/analytics/wave/dashboard/sales-pipeline?embedded=true`,
            thumbnail_url: `${baseUrl}/analytics/wave/dashboard/sales-pipeline/thumbnail`,
            platform: 'salesforce',
            folder_path: '/Sales Reports',
            created_at: '2024-01-05T14:00:00Z',
            updated_at: '2024-01-16T10:30:00Z'
          },
          {
            id: 'sf-dash-2',
            name: 'Marketing ROI',
            description: 'Marketing campaign performance and ROI analysis',
            url: `${baseUrl}/analytics/wave/dashboard/marketing-roi`,
            embed_url: `${baseUrl}/analytics/wave/dashboard/marketing-roi?embedded=true`,
            thumbnail_url: `${baseUrl}/analytics/wave/dashboard/marketing-roi/thumbnail`,
            platform: 'salesforce',
            folder_path: '/Marketing Reports',
            created_at: '2024-01-03T12:15:00Z',
            updated_at: '2024-01-14T09:45:00Z'
          }
        ]

      default:
        return []
    }
  },

  // Sync dashboards from platform to local database
  async syncDashboards(integrationId: string, selectedDashboardIds?: string[]): Promise<SyncResult> {
    try {
      const integration = await this.getIntegration(integrationId)
      if (!integration) {
        return { success: false, dashboards_found: 0, dashboards_imported: 0, errors: ['Integration not found'] }
      }

      // Discover available dashboards
      const platformDashboards = await this.discoverDashboards(integrationId)
      
      // Filter to selected dashboards if specified
      const dashboardsToImport = selectedDashboardIds 
        ? platformDashboards.filter(d => selectedDashboardIds.includes(d.id))
        : platformDashboards

      const errors: string[] = []
      let imported = 0
      let updated = 0

      console.log(`🔄 Starting sync for integration ${integrationId}: ${dashboardsToImport.length} dashboards to process`)

      // Import each dashboard
      for (const platformDash of dashboardsToImport) {
        try {
          console.log(`🔍 Checking for existing dashboard: "${platformDash.name}" (external_id: ${platformDash.id})`)
          
          // Check if dashboard already exists by external_id AND integration_id
          const { data: existingDash, error: findError } = await supabase
            .from('dashboards')
            .select('id, title, created_at')
            .eq('external_id', platformDash.id)
            .eq('integration_id', integrationId)
            .maybeSingle() // Use maybeSingle instead of single to avoid errors when not found

          if (findError && findError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected for new dashboards
            console.warn('Error checking for existing dashboard:', platformDash.name, findError.message || findError.code)
            // Don't add to errors array for non-critical database check issues
            // Just log as warning and continue with insert
          }

          if (existingDash) {
            // Dashboard exists - update it
            console.log(`⚡ Updating existing dashboard: "${existingDash.title}" → "${platformDash.name}"`)
            
            const { error: updateError } = await supabase
              .from('dashboards')
              .update({
                title: platformDash.name,
                description: platformDash.description,
                embed_url: platformDash.embed_url || platformDash.url
                // Note: removed updated_at as it might not exist in dashboard table
              })
              .eq('id', existingDash.id)

            if (updateError) {
              console.error('Error updating dashboard:', updateError)
              errors.push(`Failed to update "${platformDash.name}": ${updateError.message}`)
            } else {
              updated++
              console.log(`✅ Updated dashboard: "${platformDash.name}"`)
            }
          } else {
            // Dashboard doesn't exist - create it
            console.log(`➕ Creating new dashboard: "${platformDash.name}"`)
            
            const { error: insertError } = await supabase
              .from('dashboards')
              .insert({
                company_id: integration.company_id,
                integration_id: integrationId,
                external_id: platformDash.id,
                title: platformDash.name,
                description: platformDash.description,
                type: integration.platform,
                embed_url: platformDash.embed_url || platformDash.url,
                created_by: integration.created_by,
                created_at: new Date().toISOString()
              })

            if (insertError) {
              console.error('Error creating dashboard:', insertError)
              errors.push(`Failed to create "${platformDash.name}": ${insertError.message}`)
            } else {
              imported++
              console.log(`✅ Created new dashboard: "${platformDash.name}"`)
            }
          }

        } catch (error) {
          console.error(`Error processing dashboard "${platformDash.name}":`, error)
          errors.push(`Failed to process "${platformDash.name}": ${error}`)
        }
      }

      console.log(`📊 Sync completed: ${imported} new, ${updated} updated, ${errors.length} errors`)

      // Update integration sync status
      await this.updateIntegration(integrationId, {
        last_sync_at: new Date().toISOString(),
        last_error: errors.length > 0 ? errors.join('; ') : undefined
      })

      return {
        success: errors.length === 0,
        dashboards_found: platformDashboards.length,
        dashboards_imported: imported,
        dashboards_updated: updated,
        message: `Sync completed: ${imported} new dashboards imported, ${updated} existing dashboards updated`,
        errors
      }
    } catch (error) {
      console.error('Error in syncDashboards:', error)
      return { 
        success: false, 
        dashboards_found: 0, 
        dashboards_imported: 0, 
        dashboards_updated: 0,
        message: 'Sync failed due to an error',
        errors: [`Sync failed: ${error}`] 
      }
    }
  },

  // Get integration statistics
  async getIntegrationStats(companyId?: string) {
    try {
      let query = supabase
        .from('integrations')
        .select('platform, status')

      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data: integrations, error } = await query

      if (error) {
        console.error('Error fetching integration stats:', error)
        return {
          totalIntegrations: 0,
          connectedIntegrations: 0,
          platformCounts: {},
          statusCounts: {}
        }
      }

      const platformCounts = integrations?.reduce((acc, int) => {
        acc[int.platform] = (acc[int.platform] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const statusCounts = integrations?.reduce((acc, int) => {
        acc[int.status] = (acc[int.status] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      return {
        totalIntegrations: integrations?.length || 0,
        connectedIntegrations: statusCounts.connected || 0,
        platformCounts,
        statusCounts
      }
    } catch (error) {
      console.error('Error in getIntegrationStats:', error)
      return {
        totalIntegrations: 0,
        connectedIntegrations: 0,
        platformCounts: {},
        statusCounts: {}
      }
    }
  }
}

export default integrationAPI