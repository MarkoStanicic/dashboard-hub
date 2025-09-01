import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BuildingIcon, UsersIcon, BarChart3Icon, SettingsIcon, ExternalLinkIcon, AlertCircleIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dashboardAPI from "@/lib/api/dashboard-api";

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic';

export default async function CompanyPage() {
  const supabase = await createClient();

  // Get user session and claims
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;

  // Get user profile with company and role info
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select(`
      *,
      user_roles!inner(
        role:roles!inner(name)
      )
    `)
    .eq('id', user.sub)
    .single();

  // Debug information
  console.log('Company Page - User ID:', user.sub);
  console.log('Company Page - User Profile:', userProfile);
  console.log('Company Page - Profile Error:', profileError);

  // Handle missing user profile
  if (!userProfile) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">User Profile Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Your user profile needs to be set up to access company information.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/debug">
                🔍 Debug Database
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Handle missing company assignment
  if (!userProfile.company_id) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircleIcon className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Company Assignment Required</h1>
          <p className="text-muted-foreground mb-6">
            You need to be assigned to a company to view company information.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left mb-6">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>User ID: <code>{userProfile.id}</code></div>
              <div>Company ID: <code>{userProfile.company_id || 'NULL'}</code></div>
              <div>Super Admin: <code>{userProfile.is_super_admin ? 'Yes' : 'No'}</code></div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Quick Fix:</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Run the company assignment script in Supabase SQL Editor:
            </p>
            <code className="text-xs bg-yellow-100 p-2 rounded block text-yellow-900">
              See scripts/fix-user-company.sql
            </code>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/debug">
                🔍 Debug Database
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = (userProfile.user_roles as any)?.[0]?.role?.name || 'viewer';
  const isAdmin = userRole === 'admin' || userProfile.is_super_admin;

  // Use API to fetch data
  const [company, companyUsers, dashboards, stats] = await Promise.all([
    dashboardAPI.getCompany(userProfile.company_id),
    dashboardAPI.getCompanyUsers(userProfile.company_id),
    dashboardAPI.getDashboards(userProfile.company_id),
    dashboardAPI.getDashboardStats(userProfile.company_id)
  ]);

  if (!company) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">Company Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The company associated with your account could not be found.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left mb-6">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>User Company ID: <code>{userProfile.company_id}</code></div>
              <div>Company Found: <code>No</code></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/debug">
                🔍 Debug Database
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tableau': return '📊';
      case 'salesforce': return '☁️';
      case 'powerbi': return '📈';
      default: return '💹';
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BuildingIcon className="h-8 w-8" />
            {company.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Company profile and team management
          </p>
          {userProfile.is_super_admin && (
            <Badge variant="default" className="mt-2">
              Super Admin Access
            </Badge>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/company/integrations">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                Integrations
              </Link>
            </Button>
            <Button asChild>
              <Link href="/company/settings">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Company Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDashboards}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.uniquePlatforms} platforms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companyUsers.length}</div>
            <p className="text-xs text-muted-foreground">
              Active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Role</CardTitle>
            <Badge className={getRoleBadgeColor(userRole)} variant="secondary">
              {userRole}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {userProfile.is_super_admin ? 'Super Admin Access' : 'Company Member'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Since</CardTitle>
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(company.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Team Members
            </CardTitle>
            <CardDescription>
              Users with access to this company's dashboards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {companyUsers.map((teamUser) => (
                <div key={teamUser.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {(teamUser.full_name || teamUser.id.substring(0, 2)).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {teamUser.full_name || teamUser.id.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Member since {new Date(teamUser.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={getRoleBadgeColor(teamUser.user_roles?.[0]?.role?.name || 'viewer')} 
                      variant="secondary"
                    >
                      {teamUser.user_roles?.[0]?.role?.name || 'viewer'}
                    </Badge>
                    {teamUser.is_super_admin && (
                      <Badge variant="default">Super Admin</Badge>
                    )}
                  </div>
                </div>
              ))}
              
              {companyUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No team members found</p>
                </div>
              )}
              
              {isAdmin && (
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/admin">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Manage Team Members
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Dashboards */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3Icon className="h-5 w-5" />
              Recent Dashboards
            </CardTitle>
            <CardDescription>
              Latest dashboards added to your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboards.slice(0, 5).map((dashboard) => (
                <div key={dashboard.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getPlatformIcon(dashboard.type)}</span>
                    <div>
                      <div className="font-medium">{dashboard.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(dashboard.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {dashboard.type}
                    </Badge>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/${dashboard.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              
              {dashboards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No dashboards yet</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard">
                    <BarChart3Icon className="h-4 w-4 mr-2" />
                    View All Dashboards
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      {stats.platformCounts && Object.keys(stats.platformCounts).length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Platform Distribution</CardTitle>
            <CardDescription>
              Breakdown of dashboards by BI platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.platformCounts).map(([platform, count]) => (
                <div key={platform} className="text-center p-4 rounded-lg border">
                  <div className="text-2xl mb-2">{getPlatformIcon(platform)}</div>
                  <div className="font-semibold text-lg">{count as number}</div>
                  <div className="text-sm text-muted-foreground capitalize">{platform}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
