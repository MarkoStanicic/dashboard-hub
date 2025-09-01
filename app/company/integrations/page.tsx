import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KeyIcon, ExternalLinkIcon, CheckCircleIcon, AlertCircleIcon, PlusIcon, RefreshCwIcon, SettingsIcon, TrashIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import integrationAPI, { type Integration } from "@/lib/api/integration-api";
import { IntegrationConnectionDialog } from "@/components/integration-connection-dialog";
import { IntegrationSyncDialog } from "@/components/integration-sync-dialog";
import { DeleteIntegrationDialog } from "@/components/delete-integration-dialog";

export default async function IntegrationsPage() {
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
  const canManage = userRole === 'admin' || userProfile.is_super_admin;

  if (!canManage) {
    redirect("/company");
  }

  // Get real integrations data
  console.log('🔵 [Server] Fetching integrations for company:', userProfile.company_id)
  
  // Fetch integrations directly using server Supabase client
  const { data: integrations, error: integrationsError } = await supabase
    .from('integrations')
    .select(`
      *,
      company:companies(id, name)
    `)
    .eq('company_id', userProfile.company_id)
    .order('created_at', { ascending: false })

  if (integrationsError) {
    console.error('Error fetching integrations:', integrationsError)
  }

  console.log('✅ [Server] Fetched integrations:', integrations?.length || 0)

  // Ensure integrations is not null
  const safeIntegrations: Integration[] = integrations || [];

  // Get integration stats directly using server Supabase
  const integrationStats = {
    totalIntegrations: safeIntegrations.length,
    connectedIntegrations: safeIntegrations.filter(i => i.status === 'connected').length,
    platformCounts: safeIntegrations.reduce((acc, int) => {
      acc[int.platform] = (acc[int.platform] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    statusCounts: safeIntegrations.reduce((acc, int) => {
      acc[int.status] = (acc[int.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  };

  // Available platform configurations
  const availablePlatforms = [
    {
      platform: 'tableau' as const,
      name: 'Tableau',
      icon: '📊',
      description: 'Connect to Tableau Server or Tableau Cloud to embed dashboards',
      features: ['Dashboard embedding', 'User authentication', 'Real-time data']
    },
    {
      platform: 'salesforce' as const,
      name: 'Salesforce Analytics',
      icon: '☁️',
      description: 'Integrate with Salesforce Analytics Cloud (Einstein Analytics)',
      features: ['Dashboard embedding', 'CRM data', 'Custom reports']
    },
    {
      platform: 'powerbi' as const,
      name: 'Microsoft Power BI',
      icon: '📈',
      description: 'Connect to Power BI Service to embed reports and dashboards',
      features: ['Report embedding', 'Row-level security', 'Real-time streaming']
    }
  ];

  // Group integrations by platform
  const integrationsByPlatform = safeIntegrations.reduce((acc, integration) => {
    if (!acc[integration.platform]) {
      acc[integration.platform] = [];
    }
    acc[integration.platform].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'error': return <AlertCircleIcon className="h-4 w-4 text-red-600" />;
      default: return <AlertCircleIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <KeyIcon className="h-8 w-8" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect your business intelligence platforms to embed dashboards
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/company">
            Back to Company
          </Link>
        </Button>
      </div>

      {/* Integration Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.connectedIntegrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <PlusIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrationStats.totalIntegrations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platforms</CardTitle>
            <KeyIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(integrationStats.platformCounts).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Sync</CardTitle>
            <RefreshCwIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {integrations.find(i => i.last_sync_at) 
                ? new Date(integrations.find(i => i.last_sync_at)!.last_sync_at!).toLocaleDateString()
                : '-'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Integrations */}
      {safeIntegrations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Connected Integrations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {safeIntegrations.map((integration) => {
              const platformInfo = availablePlatforms.find(p => p.platform === integration.platform);
              return (
                <Card key={integration.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{platformInfo?.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{integration.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            {getStatusIcon(integration.status)}
                            <Badge className={getStatusColor(integration.status)}>
                              {integration.status}
                            </Badge>
                            <Badge variant="outline">{integration.platform}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">
                      {platformInfo?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Last Sync:</span>
                          <div className="font-medium">
                            {integration.last_sync_at 
                              ? new Date(integration.last_sync_at).toLocaleString()
                              : 'Never'
                            }
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <div className="font-medium">
                            {new Date(integration.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {integration.last_error && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-800">{integration.last_error}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <IntegrationSyncDialog 
                          integration={integration} 
                          trigger={
                            <Button variant="outline" className="flex-1">
                              <RotateCcwIcon className="h-4 w-4 mr-2" />
                              Sync Dashboards
                            </Button>
                          }
                        />
                        <Button variant="outline" size="icon">
                          <SettingsIcon className="h-4 w-4" />
                        </Button>
                        <DeleteIntegrationDialog 
                          integration={integration}
                          trigger={
                            <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Platforms */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {integrations.length > 0 ? 'Add New Integration' : 'Available Integrations'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availablePlatforms.map((platform) => {
            const existingIntegrations = integrationsByPlatform[platform.platform] || [];
            const hasConnected = existingIntegrations.some(i => i.status === 'connected');
            
            return (
              <Card key={platform.platform} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <CardTitle className="text-lg">{platform.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          {hasConnected ? (
                            <>
                              <CheckCircleIcon className="h-4 w-4 text-green-600" />
                              <Badge className="bg-green-100 text-green-800">
                                {existingIntegrations.length} connected
                              </Badge>
                            </>
                          ) : (
                            <>
                              <AlertCircleIcon className="h-4 w-4 text-gray-400" />
                              <Badge className="bg-gray-100 text-gray-800">
                                not connected
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {platform.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {platform.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircleIcon className="h-3 w-3 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex gap-2">
                      <IntegrationConnectionDialog 
                        platform={platform.platform}
                        companyId={userProfile.company_id}
                        userId={user.sub}
                        trigger={
                          <Button className="flex-1">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        }
                      />
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/company/integrations/${platform.platform}/docs`}>
                          <ExternalLinkIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Setup</CardTitle>
          <CardDescription>
            Follow these steps to connect your BI platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">📊 Tableau Setup</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Log in to your Tableau Server or Tableau Cloud</li>
                <li>Go to Settings → Connected Apps and create a new connected app</li>
                <li>Copy the Client ID and Client Secret</li>
                <li>Configure the redirect URL to point to your dashboard hub</li>
                <li>Enable embedding and set appropriate permissions</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">☁️ Salesforce Setup</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Access your Salesforce org with Einstein Analytics enabled</li>
                <li>Go to Setup → Apps → Connected Apps</li>
                <li>Create a new connected app with OAuth enabled</li>
                <li>Configure the callback URL and required scopes</li>
                <li>Enable the "Perform requests on your behalf at any time" scope</li>
              </ol>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">📈 Power BI Setup</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Register an application in Azure Active Directory</li>
                <li>Grant Power BI API permissions to your app</li>
                <li>Copy the Application (client) ID and create a client secret</li>
                <li>Configure Power BI workspace permissions</li>
                <li>Enable the Power BI service for embedding</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
