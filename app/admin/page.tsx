import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UsersIcon, BuildingIcon, ShieldIcon, CrownIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import dashboardAPI from "@/lib/api/dashboard-api";

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();

  // Get user session and claims
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const user = data.claims;

  // Get user profile with company and role info
  const { data: userProfile } = await supabase
    .from('users')
    .select(`
      company_id, 
      is_super_admin,
      user_roles!inner(
        role:roles!inner(name)
      )
    `)
    .eq('id', user.sub)
    .single();

  if (!userProfile?.company_id) {
    redirect("/dashboard");
  }

  const userRole = (userProfile.user_roles as any)?.[0]?.role?.name || 'viewer';
  const isAdmin = userRole === 'admin' || userProfile.is_super_admin;

  // Only admins and super admins can access this page
  if (!isAdmin) {
    redirect("/dashboard");
  }

  // Use API to fetch data
  const [companies, users, stats] = await Promise.all([
    userProfile.is_super_admin ? dashboardAPI.getCompanies() : Promise.resolve([]),
    userProfile.is_super_admin ? dashboardAPI.getUsers() : dashboardAPI.getCompanyUsers(userProfile.company_id),
    dashboardAPI.getDashboardStats(userProfile.is_super_admin ? undefined : userProfile.company_id)
  ]);

  const getRoleBadgeColor = (role: string, isSuperAdmin: boolean) => {
    if (isSuperAdmin) return 'bg-purple-100 text-purple-800';
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <ShieldIcon className="h-8 w-8" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground mt-1">
          {userProfile.is_super_admin ? 'System administration and user management' : 'Company user management'}
        </p>
        <div className="flex items-center gap-2 mt-4">
          <Badge variant={userProfile.is_super_admin ? "default" : "secondary"}>
            {userProfile.is_super_admin ? "Super Admin" : "Company Admin"}
          </Badge>
          <Badge variant="outline">
            {userProfile.is_super_admin ? "Global Access" : "Company Access"}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {userProfile.is_super_admin ? 'Across all companies' : 'In your company'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Super Admins</CardTitle>
            <CrownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_super_admin).length}
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        {userProfile.is_super_admin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <BuildingIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{companies.length}</div>
              <p className="text-xs text-muted-foreground">
                Total organizations
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDashboards}</div>
            <p className="text-xs text-muted-foreground">
              Active dashboards
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Companies List (Super Admin Only) */}
        {userProfile.is_super_admin && companies.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="h-5 w-5" />
                Companies
              </CardTitle>
              <CardDescription>
                All organizations in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map((company) => {
                  const companyUsers = users.filter(u => u.company_id === company.id);
                  return (
                    <div key={company.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <BuildingIcon className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {companyUsers.length} users • Created {new Date(company.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {companyUsers.length} users
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users List */}
        <Card className={userProfile.is_super_admin && companies.length > 0 ? "" : "lg:col-span-2"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>
              {userProfile.is_super_admin ? 'All system users' : 'Company team members'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((systemUser) => (
                <div key={systemUser.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {(systemUser.full_name || systemUser.id.substring(0, 2)).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {systemUser.full_name || systemUser.id.substring(0, 8)}...
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {userProfile.is_super_admin && systemUser.company?.name ? (
                          <>
                            {systemUser.company.name} • Joined {new Date(systemUser.created_at).toLocaleDateString()}
                          </>
                        ) : (
                          <>Joined {new Date(systemUser.created_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      className={getRoleBadgeColor(
                        systemUser.user_roles?.[0]?.role?.name || 'viewer', 
                        systemUser.is_super_admin
                      )} 
                      variant="secondary"
                    >
                      {systemUser.is_super_admin ? 'Super Admin' : systemUser.user_roles?.[0]?.role?.name || 'viewer'}
                    </Badge>
                    {systemUser.id === user.sub && (
                      <Badge variant="outline">You</Badge>
                    )}
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Definitions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Role Definitions</CardTitle>
          <CardDescription>
            Understanding user permissions and access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Full system access across all companies. Can manage users, companies, and all dashboards.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-red-100 text-red-800">Admin</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Company-level administration. Can manage company users, dashboards, and settings.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-blue-100 text-blue-800">Editor</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Can create, edit, and manage dashboards and insights within their company.
              </p>
            </div>
            <div className="p-4 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-green-100 text-green-800">Viewer</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Read-only access to company dashboards and insights. Cannot make changes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
