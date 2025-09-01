import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import DashboardEmbed from "@/components/dashboard-embed";
import InsightPanel from "@/components/insight-panel";
import dashboardAPI from "@/lib/api/dashboard-api";

interface PageProps {
  params: { id: string };
}

export default async function DashboardPage({ params }: PageProps) {
  const { id } = await params
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
  const canEdit = userRole === 'admin' || userRole === 'editor';
  const isSuperAdmin = userProfile.is_super_admin;

  // Fetch dashboard directly using server Supabase client
  console.log('🔵 [Dashboard Detail] Fetching dashboard:', id)

  const { data: dashboard, error: dashboardError } = await supabase
    .from('dashboards')
    .select(`
      *,
      company:companies(id, name),
      section:sections(id, name),
      integration:integrations(id, status, platform, name)
    `)
    .eq('id', id)
    .single()

  if (dashboardError) {
    console.error('Error fetching dashboard:', dashboardError)
  }

  // Fetch insights directly using server Supabase client
  const { data: insights, error: insightsError } = await supabase
    .from('insights')
    .select(`
      *,
      author:users(id, email)
    `)
    .eq('dashboard_id', id)
    .order('created_at', { ascending: false })

  if (insightsError) {
    console.warn('Error fetching insights:', insightsError.message || insightsError.code || 'Unknown error')
  }

  console.log('✅ [Dashboard Detail] Fetched:', {
    dashboard: dashboard ? dashboard.title : 'Not found',
    insights: insights?.length || 0
  })

  if (!dashboard) {
    notFound();
  }

  // Check access permissions for non-super admins
  if (!isSuperAdmin && dashboard.company_id !== userProfile.company_id) {
    notFound();
  }

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Dashboards
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Badge className={getPlatformColor(dashboard.type)}>
                  {getPlatformIcon(dashboard.type)} {dashboard.type.toUpperCase()}
                </Badge>
                {isSuperAdmin && dashboard.company && (
                  <Badge variant="outline">
                    {dashboard.company.name}
                  </Badge>
                )}
                {dashboard.section && (
                  <Badge variant="secondary">
                    {dashboard.section.name}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <a href={dashboard.embed_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Open Original
                </a>
              </Button>
              {canEdit && (
                <Button size="sm" asChild>
                  <Link href={`/dashboard/${dashboard.id}/edit`}>
                    Edit Dashboard
                  </Link>
                </Button>
              )}
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{dashboard.title}</h1>
            {dashboard.description && (
              <p className="text-muted-foreground mt-1">{dashboard.description}</p>
            )}
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <span>Created {new Date(dashboard.created_at).toLocaleDateString()}</span>
              {dashboard.author && (
                <span>by {dashboard.author.email}</span>
              )}
              <span>•</span>
              <span>{insights?.length || 0} insight{(insights?.length || 0) !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-140px)]">
        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          <DashboardEmbed
            url={dashboard.embed_url}
            platform={dashboard.type}
            insights={insights || []}
            canEdit={canEdit}
            integration={dashboard.integration}
            dashboardId={dashboard.id}
          />
        </div>

        {/* Insights Panel */}
        <div className="w-80 border-l bg-background/50">
          <InsightPanel
            dashboardId={dashboard.id}
            insights={insights || []}
            canEdit={canEdit}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
}