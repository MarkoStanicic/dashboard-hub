import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Types for our data
export interface Company {
  id: string
  name: string
  created_at: string
}

export interface Dashboard {
  id: string
  title: string
  description?: string
  type: 'tableau' | 'powerbi' | 'salesforce' | 'other'
  embed_url: string
  company_id: string
  section_id?: string
  created_by: string
  created_at: string
  company?: Company
  section?: Section
  author?: { email: string }
}

export interface Section {
  id: string
  name: string
  company_id: string
  created_at: string
}

export interface Insight {
  id: string
  dashboard_id: string
  content: string
  type: 'note' | 'explanation' | 'callout' | 'tag'
  position_x: number | null
  position_y: number | null
  created_by: string
  created_at: string
  author?: { email: string }
}

export interface UserRole {
  id: string
  user_id: string
  company_id: string
  role_id: number
  role?: { name: string }
  company?: Company
}

export interface User {
  id: string
  company_id: string
  full_name?: string
  is_super_admin: boolean
  created_at: string
  company?: Company
  user_roles?: UserRole[]
}

// API Functions

export const dashboardAPI = {
  // Get all companies
  async getCompanies(): Promise<Company[]> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching companies:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getCompanies:', error)
      return []
    }
  },

  // Get company by ID
  async getCompany(id: string): Promise<Company | null> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching company:', error)
        return null
      }
      return data
    } catch (error) {
      console.error('Error in getCompany:', error)
      return null
    }
  },

  // Get dashboards for a company (or all if super admin)
  async getDashboards(companyId?: string): Promise<Dashboard[]> {
    try {
      let query = supabase
        .from('dashboards')
        .select('*')
        .order('created_at', { ascending: false })

      // If companyId is provided, filter by company
      if (companyId) {
        query = query.eq('company_id', companyId)
      }

      const { data: dashboards, error } = await query

      if (error) {
        console.error('Error fetching dashboards:', error)
        return []
      }

      if (!dashboards) return []

      // Fetch related data separately to avoid foreign key issues
      const dashboardsWithRelations = await Promise.all(
        dashboards.map(async (dashboard) => {
          // Get company info
          let company = null
          if (dashboard.company_id) {
            const { data: companyData } = await supabase
              .from('companies')
              .select('id, name')
              .eq('id', dashboard.company_id)
              .single()
            company = companyData
          }

          // Get section info
          let section = null
          if (dashboard.section_id) {
            const { data: sectionData } = await supabase
              .from('sections')
              .select('id, name')
              .eq('id', dashboard.section_id)
              .single()
            section = sectionData
          }

          // Get author info
          let author = null
          if (dashboard.created_by) {
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .eq('id', dashboard.created_by)
              .single()
            // For now, we'll use the user ID as email since we don't have email in users table
            author = userData ? { email: dashboard.created_by.substring(0, 8) + '...' } : null
          }

          return {
            ...dashboard,
            company,
            section,
            author
          }
        })
      )

      return dashboardsWithRelations
    } catch (error) {
      console.error('Error in getDashboards:', error)
      return []
    }
  },

  // Get single dashboard by ID
  async getDashboard(id: string): Promise<Dashboard | null> {
    try {
      const { data: dashboard, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching dashboard:', error)
        return null
      }

      if (!dashboard) return null

      // Get related data separately
      let company = null
      if (dashboard.company_id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('id, name')
          .eq('id', dashboard.company_id)
          .single()
        company = companyData
      }

      let section = null
      if (dashboard.section_id) {
        const { data: sectionData } = await supabase
          .from('sections')
          .select('id, name')
          .eq('id', dashboard.section_id)
          .single()
        section = sectionData
      }

      let author = null
      if (dashboard.created_by) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('id', dashboard.created_by)
          .single()
        author = userData ? { email: dashboard.created_by.substring(0, 8) + '...' } : null
      }

      return {
        ...dashboard,
        company,
        section,
        author
      }
    } catch (error) {
      console.error('Error in getDashboard:', error)
      return null
    }
  },

  // Get insights for a dashboard
  async getInsights(dashboardId: string): Promise<Insight[]> {
    try {
      const { data: insights, error } = await supabase
        .from('insights')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching insights:', error)
        return []
      }

      if (!insights) return []

      // Get author info for each insight
      const insightsWithAuthors = await Promise.all(
        insights.map(async (insight) => {
          let author = null
          if (insight.created_by) {
            const { data: userData } = await supabase
              .from('users')
              .select('id')
              .eq('id', insight.created_by)
              .single()
            author = userData ? { email: insight.created_by.substring(0, 8) + '...' } : null
          }

          return {
            ...insight,
            author
          }
        })
      )

      return insightsWithAuthors
    } catch (error) {
      console.error('Error in getInsights:', error)
      return []
    }
  },

  // Create new insight
  async createInsight(insight: Omit<Insight, 'id' | 'created_at' | 'author'>): Promise<Insight> {
    try {
      const { data, error } = await supabase
        .from('insights')
        .insert(insight)
        .select('*')
        .single()

      if (error) {
        console.error('Error creating insight:', error)
        throw error
      }

      // Get author info
      let author = null
      if (data.created_by) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.created_by)
          .single()
        author = userData ? { email: data.created_by.substring(0, 8) + '...' } : null
      }

      return {
        ...data,
        author
      }
    } catch (error) {
      console.error('Error in createInsight:', error)
      throw error
    }
  },

  // Delete insight
  async deleteInsight(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting insight:', error)
        throw error
      }
    } catch (error) {
      console.error('Error in deleteInsight:', error)
      throw error
    }
  },

  // Get sections for a company
  async getSections(companyId: string): Promise<Section[]> {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .eq('company_id', companyId)
        .order('name')

      if (error) {
        console.error('Error fetching sections:', error)
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error in getSections:', error)
      return []
    }
  },

  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        return []
      }

      if (!users) return []

      // Get related data separately
      const usersWithRelations = await Promise.all(
        users.map(async (user) => {
          // Get company info
          let company = null
          if (user.company_id) {
            const { data: companyData } = await supabase
              .from('companies')
              .select('id, name')
              .eq('id', user.company_id)
              .single()
            company = companyData
          }

          // Get user roles
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('id, role_id, company_id')
            .eq('user_id', user.id)

          // Get role names for user roles
          const userRolesWithNames = await Promise.all(
            (userRoles || []).map(async (userRole) => {
              const { data: roleData } = await supabase
                .from('roles')
                .select('name')
                .eq('id', userRole.role_id)
                .single()

              return {
                ...userRole,
                role: roleData || { name: 'viewer' }
              }
            })
          )

          return {
            ...user,
            company,
            user_roles: userRolesWithNames
          }
        })
      )

      return usersWithRelations
    } catch (error) {
      console.error('Error in getUsers:', error)
      return []
    }
  },

  // Get users for a specific company
  async getCompanyUsers(companyId: string): Promise<User[]> {
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching company users:', error)
        return []
      }

      if (!users) return []

      // Get related data separately
      const usersWithRelations = await Promise.all(
        users.map(async (user) => {
          // Get company info
          let company = null
          if (user.company_id) {
            const { data: companyData } = await supabase
              .from('companies')
              .select('id, name')
              .eq('id', user.company_id)
              .single()
            company = companyData
          }

          // Get user roles
          const { data: userRoles } = await supabase
            .from('user_roles')
            .select('id, role_id, company_id')
            .eq('user_id', user.id)

          // Get role names for user roles
          const userRolesWithNames = await Promise.all(
            (userRoles || []).map(async (userRole) => {
              const { data: roleData } = await supabase
                .from('roles')
                .select('name')
                .eq('id', userRole.role_id)
                .single()

              return {
                ...userRole,
                role: roleData || { name: 'viewer' }
              }
            })
          )

          return {
            ...user,
            company,
            user_roles: userRolesWithNames
          }
        })
      )

      return usersWithRelations
    } catch (error) {
      console.error('Error in getCompanyUsers:', error)
      return []
    }
  },

  // Get dashboard stats
  async getDashboardStats(companyId?: string) {
    try {
      // Get dashboard count
      let dashboardQuery = supabase
        .from('dashboards')
        .select('id, type, company_id')

      if (companyId) {
        dashboardQuery = dashboardQuery.eq('company_id', companyId)
      }

      const { data: dashboards, error: dashboardError } = await dashboardQuery

      if (dashboardError) {
        console.error('Error fetching dashboard stats:', dashboardError)
        return {
          totalDashboards: 0,
          totalCompanies: 0,
          uniquePlatforms: 0,
          platformCounts: {}
        }
      }

      // Get company count (for super admin)
      const { data: companies, error: companyError } = await supabase
        .from('companies')
        .select('id')

      if (companyError) {
        console.error('Error fetching company count:', companyError)
      }

      // Calculate stats
      const totalDashboards = dashboards?.length || 0
      const totalCompanies = companies?.length || 0
      const platformCounts = dashboards?.reduce((acc, dash) => {
        acc[dash.type] = (acc[dash.type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}

      const uniquePlatforms = Object.keys(platformCounts).length

      return {
        totalDashboards,
        totalCompanies,
        uniquePlatforms,
        platformCounts
      }
    } catch (error) {
      console.error('Error in getDashboardStats:', error)
      return {
        totalDashboards: 0,
        totalCompanies: 0,
        uniquePlatforms: 0,
        platformCounts: {}
      }
    }
  }
}

export default dashboardAPI 