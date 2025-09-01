'use client'

import { useEffect, useState } from 'react'
import dashboardAPI from '@/lib/api/dashboard-api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUser } from '@/components/auth/UserProvider'

export default function TestDataPage() {
  const { user, isSuperAdmin, companyId } = useUser()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>({})

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Fetch all available data
        const [
          companies,
          dashboards,
          stats,
          sections,
          users
        ] = await Promise.all([
          dashboardAPI.getCompanies(),
          dashboardAPI.getDashboards(isSuperAdmin ? undefined : companyId || undefined),
          dashboardAPI.getDashboardStats(isSuperAdmin ? undefined : companyId || undefined),
          companyId ? dashboardAPI.getSections(companyId) : Promise.resolve([]),
          isSuperAdmin ? dashboardAPI.getUsers() : (companyId ? dashboardAPI.getCompanyUsers(companyId) : Promise.resolve([]))
        ])

        setData({
          companies,
          dashboards,
          stats,
          sections,
          users
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [user, isSuperAdmin, companyId])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">Loading Test Data...</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">API Data Test</h1>
        <p className="text-muted-foreground mt-1">
          Testing data access from all Supabase tables
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant={isSuperAdmin ? "default" : "secondary"}>
            {isSuperAdmin ? "Super Admin" : "Regular User"}
          </Badge>
          <Badge variant="outline">
            User ID: {user?.id?.slice(0, 8)}...
          </Badge>
          {companyId && (
            <Badge variant="outline">
              Company ID: {companyId.slice(0, 8)}...
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Dashboard Stats
              <Badge variant="outline">{data.stats?.totalDashboards || 0}</Badge>
            </CardTitle>
            <CardDescription>Overall platform statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Dashboards:</span>
                <span className="font-medium">{data.stats?.totalDashboards || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Companies:</span>
                <span className="font-medium">{data.stats?.totalCompanies || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Unique Platforms:</span>
                <span className="font-medium">{data.stats?.uniquePlatforms || 0}</span>
              </div>
              {data.stats?.platformCounts && (
                <div className="mt-3">
                  <div className="text-xs text-muted-foreground mb-1">Platform Breakdown:</div>
                  {Object.entries(data.stats.platformCounts).map(([platform, count]) => (
                    <div key={platform} className="flex justify-between text-xs">
                      <span className="capitalize">{platform}:</span>
                      <span>{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Companies Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🏢 Companies
              <Badge variant="outline">{data.companies?.length || 0}</Badge>
            </CardTitle>
            <CardDescription>Available companies in system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.companies?.slice(0, 5).map((company: any) => (
                <div key={company.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">{company.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {company.id.slice(0, 6)}...
                  </Badge>
                </div>
              ))}
              {data.companies?.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ...and {data.companies.length - 5} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dashboards Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 Dashboards
              <Badge variant="outline">{data.dashboards?.length || 0}</Badge>
            </CardTitle>
            <CardDescription>Available dashboards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.dashboards?.slice(0, 5).map((dashboard: any) => (
                <div key={dashboard.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{dashboard.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {dashboard.type}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {dashboard.company?.name}
                  </div>
                </div>
              ))}
              {data.dashboards?.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ...and {data.dashboards.length - 5} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              👥 Users
              <Badge variant="outline">{data.users?.length || 0}</Badge>
            </CardTitle>
            <CardDescription>System users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.users?.slice(0, 5).map((user: any) => (
                <div key={user.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">
                      {user.full_name || user.id.slice(0, 8)}...
                    </span>
                    <Badge variant={user.is_super_admin ? "default" : "secondary"} className="text-xs">
                      {user.is_super_admin ? "Super" : user.user_roles?.[0]?.role?.name || "User"}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.company?.name}
                  </div>
                </div>
              ))}
              {data.users?.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  ...and {data.users.length - 5} more
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sections Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📁 Sections
              <Badge variant="outline">{data.sections?.length || 0}</Badge>
            </CardTitle>
            <CardDescription>Dashboard sections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.sections?.slice(0, 5).map((section: any) => (
                <div key={section.id} className="text-sm">
                  {section.name}
                </div>
              ))}
              {data.sections?.length === 0 && (
                <div className="text-xs text-muted-foreground">
                  No sections found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Raw Data Card */}
        <Card>
          <CardHeader>
            <CardTitle>🔍 Raw Data Preview</CardTitle>
            <CardDescription>First dashboard data structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
              <pre>{JSON.stringify(data.dashboards?.[0] || {}, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Refresh Data
        </button>
        <button
          onClick={() => console.log('Full data:', data)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
        >
          Log to Console
        </button>
      </div>
    </div>
  )
} 