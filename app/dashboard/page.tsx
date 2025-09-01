import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlusIcon, FolderIcon, BarChart3Icon, ExternalLinkIcon, AlertCircleIcon, SearchIcon, FilterIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dashboardAPI, { type Dashboard } from "@/lib/api/dashboard-api";
import { DashboardSearch } from "@/components/dashboard-search";
import integrationAPI from "@/lib/api/integration-api";

// Force dynamic rendering - don't pre-render during build
export const dynamic = 'force-dynamic';

interface Section {
  id: string;
  name: string;
  dashboards: Dashboard[];
}

export default async function DashboardsPage() {
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
  console.log('User ID:', user.sub);
  console.log('User Profile:', userProfile);
  console.log('Profile Error:', profileError);

  // Handle missing user profile
  if (!userProfile) {
    return (
      <div className="container mx-auto py-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">User Profile Setup Required</h1>
          <p className="text-muted-foreground mb-6">
            Your user profile needs to be set up. Please run the user setup script.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left mb-6">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>User ID: <code>{user.sub}</code></div>
              <div>Email: <code>{user.email}</code></div>
              <div>Profile Error: <code>{profileError?.message || 'No error'}</code></div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/debug">
                🔍 Debug Database
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <a href="https://supabase.com/dashboard" target="_blank">
                Open Supabase Dashboard
              </a>
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
            Your user account exists but is not assigned to a company. Please run the company assignment script.
          </p>
          <div className="bg-muted p-4 rounded-lg text-left mb-6">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>User ID: <code>{userProfile.id}</code></div>
              <div>Company ID: <code>{userProfile.company_id || 'NULL'}</code></div>
              <div>Super Admin: <code>{userProfile.is_super_admin ? 'Yes' : 'No'}</code></div>
              <div>User Roles: <code>{userProfile.user_roles?.length || 0} roles</code></div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-yellow-800 mb-2">Quick Fix:</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Run this SQL script in your Supabase SQL Editor:
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
              <a href="https://supabase.com/dashboard" target="_blank">
                Open Supabase Dashboard
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userRole = (userProfile.user_roles as any)?.[0]?.role?.name || 'viewer';
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const isSuperAdmin = userProfile.is_super_admin;

  // Fetch dashboards directly using server Supabase client
  console.log('🔵 [Dashboard Page] Fetching dashboards for company:', userProfile.company_id)
  
  // Build dashboard query
  let dashboardQuery = supabase
    .from('dashboards')
    .select(`
      *,
      company:companies(id, name),
      section:sections(id, name)
    `)
    .order('created_at', { ascending: false })

  // Filter by company for non-super admins
  if (!isSuperAdmin) {
    dashboardQuery = dashboardQuery.eq('company_id', userProfile.company_id)
  }

  const { data: dashboards, error: dashboardsError } = await dashboardQuery

  if (dashboardsError) {
    console.error('Error fetching dashboards:', dashboardsError)
  }

  // Get dashboard stats directly
  const stats = {
    totalDashboards: dashboards?.length || 0,
    totalCompanies: isSuperAdmin ? 1 : 1, // Simplified for now
    uniquePlatforms: [...new Set(dashboards?.map(d => d.type) || [])].length,
    platformCounts: dashboards?.reduce((acc, dash) => {
      acc[dash.type] = (acc[dash.type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
  }

  // Fetch integrations directly using server Supabase client
  let integrationsQuery = supabase
    .from('integrations')
    .select(`
      *,
      company:companies(id, name)
    `)
    .order('created_at', { ascending: false })

  // Filter by company for non-super admins
  if (!isSuperAdmin) {
    integrationsQuery = integrationsQuery.eq('company_id', userProfile.company_id)
  }

  const { data: integrationsData, error: integrationsError } = await integrationsQuery

  if (integrationsError) {
    console.error('Error fetching integrations for dashboard page:', integrationsError)
  }

  const integrations = integrationsData || []

  // Ensure arrays are not null
  const safeDashboards = dashboards || []
  
  console.log('✅ [Dashboard Page] Fetched:', {
    dashboards: safeDashboards.length,
    integrations: integrations.length
  });

  // Group dashboards by sections
  const sections: Section[] = [];
  const ungroupedDashboards: Dashboard[] = [];

  safeDashboards.forEach((dashboard) => {
    if (dashboard.section?.name) {
      const existingSection = sections.find(s => s.name === dashboard.section!.name);
      if (existingSection) {
        existingSection.dashboards.push(dashboard);
      } else {
        sections.push({
          id: dashboard.section.id,
          name: dashboard.section.name,
          dashboards: [dashboard]
        });
      }
    } else {
      ungroupedDashboards.push(dashboard);
    }
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tableau': return '📊';
      case 'salesforce': return '☁️';
      case 'powerbi': return '📈';
      default: return '💹';
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'tableau': return 'bg-blue-100 text-blue-800';
      case 'salesforce': return 'bg-green-100 text-green-800';
      case 'powerbi': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboards</h1>
          <p className="text-muted-foreground mt-1">
            Centralized insights across your business intelligence tools
          </p>
          {isSuperAdmin && (
            <Badge variant="default" className="mt-2">
              Super Admin Access
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {integrations.length > 0 && (
            <Button variant="outline" asChild>
              <Link href="/company/integrations">
                <RotateCcwIcon className="h-4 w-4 mr-2" />
                Sync Dashboards
              </Link>
            </Button>
          )}
          {canEdit && (
            <Button asChild>
              <Link href="/dashboard/new">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Dashboard
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters - This component now handles all dashboard display */}
      <DashboardSearch 
        dashboards={dashboards}
        integrations={integrations}
        sections={sections}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
            <BarChart3Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDashboards}</div>
          </CardContent>
        </Card>
        
        {isSuperAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <FolderIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
            </CardContent>
          </Card>
        )}
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <ExternalLinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniquePlatforms}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.filter(i => i.status === 'connected').length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
