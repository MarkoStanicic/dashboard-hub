import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST /api/embed/tableau - Generate trusted embed URL
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dashboardId, viewUrl } = await request.json()
    
    if (!dashboardId || !viewUrl) {
      return NextResponse.json({ 
        error: 'Missing required fields: dashboardId, viewUrl' 
      }, { status: 400 })
    }

    // Get dashboard and integration info
    const { data: dashboard } = await supabase
      .from('dashboards')
      .select(`
        *,
        integration:integrations(*)
      `)
      .eq('id', dashboardId)
      .single()

    if (!dashboard?.integration) {
      return NextResponse.json({ error: 'Dashboard or integration not found' }, { status: 404 })
    }

    // For now, return enhanced embed URL with authentication parameters
    // In production, this would generate a trusted ticket from Tableau Server
    const enhancedUrl = enhanceEmbedUrl(viewUrl, dashboard.integration.config)
    
    return NextResponse.json({ 
      embedUrl: enhancedUrl,
      requiresAuth: true,
      message: 'Enhanced embed URL generated'
    })

  } catch (error) {
    console.error('Error generating embed URL:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function enhanceEmbedUrl(baseUrl: string, config: any): string {
  const url = new URL(baseUrl)
  
  // Add parameters that might help with authentication
  url.searchParams.set(':embed', 'y')
  url.searchParams.set(':toolbar', 'no')
  url.searchParams.set(':tabs', 'no')
  url.searchParams.set(':showVizHome', 'no')
  url.searchParams.set(':showShareOptions', 'false')
  url.searchParams.set(':display_count', 'no')
  url.searchParams.set(':showAppBanner', 'false')
  url.searchParams.set(':loadOrderID', '0')
  url.searchParams.set(':origin', 'viz_share_link')
  
  // If we have PAT credentials, try to add them (though this may not work for embedding)
  if (config.personal_access_token_name) {
    // This is where you'd implement trusted ticket generation
    // For now, we'll return the enhanced URL
  }
  
  return url.toString()
}
