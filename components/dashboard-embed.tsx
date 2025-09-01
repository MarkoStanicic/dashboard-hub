'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircleIcon, ExternalLinkIcon, RefreshCwIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Insight {
  id: string;
  content: string;
  type: 'note' | 'explanation' | 'callout' | 'tag';
  position_x: number | null;
  position_y: number | null;
  created_at: string;
  created_by: string;
  author: {
    email: string;
  };
}

interface Integration {
  id: string;
  status: string;
  platform: string;
  name: string;
}

interface DashboardEmbedProps {
  url: string;
  platform: 'tableau' | 'salesforce' | 'powerbi' | 'other';
  insights: Insight[];
  canEdit: boolean;
  integration?: Integration | null;
  dashboardId?: string; // For Power BI external_id
}

export default function DashboardEmbed({ 
  url, 
  platform, 
  insights, 
  canEdit: _canEdit, // Not used currently but kept for interface consistency
  integration,
  dashboardId 
}: DashboardEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [_embedToken, setEmbedToken] = useState<string | null>(null);
  const powerbiContainerRef = useRef<HTMLDivElement>(null);
  const embedRef = useRef<any>(null);

  // Function to get embed token from API
  const getEmbedToken = useCallback(async (dashboardId: string, integrationId: string) => {
    try {
      const response = await fetch('/api/embed/powerbi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dashboardId,
          integrationId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get embed token: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      console.error('Error getting embed token:', error);
      throw error;
    }
  }, []);

  // Function to embed Power BI dashboard
  const embedPowerBIDashboard = useCallback(async (dashboardId: string, integrationId: string) => {
    if (!powerbiContainerRef.current) return;

    try {
      console.log('🔵 [PowerBI Embed] Getting embed token...');
      const embedData = await getEmbedToken(dashboardId, integrationId);
      
      console.log('🔵 [PowerBI Embed] Loading Power BI client library...');
      
      // Dynamically import Power BI client (client-side only)
      const { service, factories, models } = await import('powerbi-client');
      
      console.log('🔵 [PowerBI Embed] Embedding dashboard...');
      
      // Create embed configuration
      const embedConfig = {
        type: 'dashboard',
        id: embedData.dashboardId,
        embedUrl: embedData.embedUrl,
        accessToken: embedData.embedToken,
        tokenType: models.TokenType.Embed,
        settings: {
          panes: {
            filters: { expanded: false, visible: true },
            pageNavigation: { visible: true }
          },
          background: models.BackgroundType.Transparent,
        }
      };

      // Clean up previous embed
      if (embedRef.current) {
        embedRef.current.destroy();
      }

      // Embed the dashboard
      const powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory);
      embedRef.current = powerbi.embed(powerbiContainerRef.current, embedConfig);
      
      // Handle events
      embedRef.current.on('loaded', () => {
        console.log('✅ [PowerBI Embed] Dashboard loaded');
        setIsLoading(false);
      });

      embedRef.current.on('error', (event: any) => {
        console.error('❌ [PowerBI Embed] Error:', event.detail || event);
        setHasError(true);
        setIsLoading(false);
      });

      setEmbedToken(embedData.embedToken);
      
    } catch (error: unknown) {
      console.error('❌ [PowerBI Embed] Failed to embed:', error);
      setHasError(true);
      setIsLoading(false);
    }
  }, [getEmbedToken]);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    if (platform === 'powerbi') {
      const hasValidIntegration = integration && integration.status === 'connected';
      console.log('🔵 [DashboardEmbed] Power BI check:', { 
        integration: integration ? { id: integration.id, status: integration.status, name: integration.name } : null,
        hasValidIntegration 
      });
      
      if (!hasValidIntegration) {
        setIsLoading(false);
        setHasError(true);
        return;
      }

      console.log('🔵 [DashboardEmbed] Starting Power BI embedding:', { dashboardId, integrationId: integration?.id });

      if (dashboardId && integration?.id) {
        embedPowerBIDashboard(dashboardId, integration.id);
      } else {
        console.error('❌ [DashboardEmbed] Missing dashboard ID or integration ID', { dashboardId, integrationId: integration?.id });
        setHasError(true);
        setIsLoading(false);
      }
    }
    
    // Cleanup function
    return () => {
      if (embedRef.current) {
        embedRef.current.destroy();
      }
    };
  }, [url, platform, integration, dashboardId, embedPowerBIDashboard]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const getEmbedUrl = (url: string, platform: string) => {
    // For different platforms, we might need to modify the URL for embedding
    switch (platform) {
      case 'tableau':
        // Enhanced Tableau embedding with better parameters
        const tableauUrl = new URL(url);
        tableauUrl.searchParams.set(':embed', 'y');
        tableauUrl.searchParams.set(':toolbar', 'no');
        tableauUrl.searchParams.set(':tabs', 'no');
        tableauUrl.searchParams.set(':showVizHome', 'no');
        tableauUrl.searchParams.set(':showShareOptions', 'false');
        tableauUrl.searchParams.set(':display_count', 'no');
        tableauUrl.searchParams.set(':showAppBanner', 'false');
        tableauUrl.searchParams.set(':loadOrderID', '0');
        tableauUrl.searchParams.set(':origin', 'viz_share_link');
        return tableauUrl.toString();
      case 'powerbi':
        // Power BI requires special embed authentication and URLs
        // For now, we'll provide guidance to the user about Power BI embedding
        return url;
      case 'salesforce':
        // Salesforce dashboard URLs for embedding
        return url;
      default:
        return url;
    }
  };

  const embedUrl = getEmbedUrl(url, platform);

  if (hasError) {
    return (
      <div className="relative h-[600px] flex items-center justify-center bg-muted/50 rounded-lg border-2 border-dashed">
        <div className="text-center p-8">
          <AlertCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {platform === 'tableau' 
              ? 'Tableau Authentication Required' 
              : platform === 'powerbi' 
                ? integration && integration.status === 'connected'
                  ? 'Power BI Embed Tokens Required'
                  : 'Power BI Authentication Required'
                : 'Unable to Load Dashboard'
            }
          </h3>
          <p className="text-muted-foreground mb-4">
            {platform === 'tableau' 
              ? 'This Tableau dashboard requires authentication. Click "Open Original" to sign in to Tableau Cloud, or contact your admin to make the workbook publicly accessible for embedding.'
              : platform === 'powerbi'
                ? integration && integration.status === 'connected'
                  ? `✅ Power BI integration "${integration.name}" is connected and syncing data successfully! However, Power BI requires special embed tokens for iframe viewing. Click "Open in Power BI" to view your dashboard directly in Power BI Service.`
                  : integration && integration.status !== 'connected' 
                    ? `Power BI integration "${integration.name}" is ${integration.status}. Please reconnect the integration to enable embedded viewing, or click "Open in Power BI" to view externally.`
                    : 'Power BI dashboards require special embedding authentication. Click "Open in Power BI" to view the dashboard in Power BI Service, or contact your admin to configure embedded viewing with proper authentication tokens.'
                : 'This dashboard cannot be embedded. This might be due to security policies or the URL format.'
            }
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline" 
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
              }}
            >
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Retry
            </Button>
            <Button variant="outline" asChild>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4 mr-2" />
                {platform === 'tableau' 
                  ? 'Open in Tableau Cloud' 
                  : platform === 'powerbi' 
                    ? 'Open in Power BI' 
                    : 'Open Original'
                }
              </a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex items-center gap-2">
            <RefreshCwIcon className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading dashboard...</span>
          </div>
        </div>
      )}
      
      <div className="relative h-[600px] overflow-hidden rounded-lg border">
        {platform === 'powerbi' ? (
          // Power BI container for SDK embedding
          <div 
            ref={powerbiContainerRef}
            className="w-full h-full"
            style={{ minHeight: '600px' }}
          />
        ) : (
          // Standard iframe for other platforms
          <iframe
            src={embedUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title={`${platform} Dashboard`}
          />
        )}
        
        {/* Insight Overlays */}
        {showInsights && insights.map((insight) => (
          insight.position_x !== null && insight.position_y !== null && (
            <div
              key={insight.id}
              className="absolute z-20 group"
              style={{
                left: `${insight.position_x}%`,
                top: `${insight.position_y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="w-6 h-6 bg-primary rounded-full border-2 border-background shadow-lg cursor-pointer flex items-center justify-center text-xs text-primary-foreground font-semibold">
                {insight.type === 'note' ? '📝' : 
                 insight.type === 'explanation' ? '💡' : 
                 insight.type === 'callout' ? '⚠️' : '🏷️'}
              </div>
              
              {/* Tooltip */}
              <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-64 bg-popover border rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-sm font-medium mb-1">{insight.type.toUpperCase()}</div>
                <div className="text-sm text-muted-foreground mb-2">{insight.content}</div>
                <div className="text-xs text-muted-foreground">
                  {insight.author.email} • {new Date(insight.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
      
      {/* Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-2">
        {insights.length > 0 && (
          <Button
            size="sm"
            variant={showInsights ? "default" : "outline"}
            onClick={() => setShowInsights(!showInsights)}
          >
            {showInsights ? 'Hide' : 'Show'} Insights ({insights.length})
          </Button>
        )}
        <Button size="sm" variant="outline" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </Button>
      </div>
    </div>
  );
} 