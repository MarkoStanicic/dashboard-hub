import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PowerBIService } from '@/lib/platforms/powerbi-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { dashboardId, integrationId } = body;

    if (!dashboardId || !integrationId) {
      return NextResponse.json({ 
        error: 'Dashboard ID and Integration ID are required' 
      }, { status: 400 });
    }

    console.log('🔵 [PowerBI Embed] Generating embed token for:', { dashboardId, integrationId });

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integrationId)
      .eq('platform', 'powerbi')
      .single();

    if (integrationError || !integration) {
      console.error('Integration not found:', integrationError);
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    if (integration.status !== 'connected') {
      return NextResponse.json({ 
        error: 'Integration is not connected' 
      }, { status: 400 });
    }

    // Get dashboard details
    const { data: dashboard, error: dashboardError } = await supabase
      .from('dashboards')
      .select('*')
      .eq('id', dashboardId)
      .eq('integration_id', integrationId)
      .single();

    if (dashboardError || !dashboard) {
      console.error('❌ [PowerBI Embed] Dashboard not found:', { dashboardId, integrationId, error: dashboardError });
      return NextResponse.json({ error: 'Dashboard not found' }, { status: 404 });
    }

    console.log('✅ [PowerBI Embed] Found dashboard:', dashboard.title, 'with external_id:', dashboard.external_id);

    // Initialize Power BI service
    const powerbiService = new PowerBIService();
    powerbiService.setConfig(integration.config as any);

    try {
      // Generate embed token
      const embedToken = await powerbiService.generateEmbedToken(
        integration.config as any,
        dashboard.external_id,
        dashboard.workspace_id || 'me' // Use 'me' for My Workspace
      );

      console.log('✅ [PowerBI Embed] Embed token generated successfully');

      return NextResponse.json({
        embedToken: embedToken.token,
        expiration: embedToken.expiration,
        embedUrl: dashboard.embed_url,
        dashboardId: dashboard.external_id,
        workspaceId: dashboard.workspace_id || 'me'
      });

    } catch (embedError: any) {
      console.error('Error generating embed token:', embedError);
      return NextResponse.json({ 
        error: 'Failed to generate embed token: ' + embedError.message 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ [PowerBI Embed API] Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      type: error.name
    }, { status: 500 });
  }
}
