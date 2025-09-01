import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/integrations - List integrations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('company_id')
    
    const supabase = await createClient()
    
    // Get the current user to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('integrations')
      .select(`
        *,
        company:companies(id, name)
      `)
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: integrations, error } = await query

    if (error) {
      console.error('Error fetching integrations:', error)
      return NextResponse.json({ error: 'Failed to fetch integrations' }, { status: 500 })
    }

    return NextResponse.json(integrations || [])
  } catch (error) {
    console.error('Error in GET /api/integrations:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/integrations - Create new integration
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ error: 'Unauthorized', details: authError?.message }, { status: 401 })
    }

    const integrationData = await request.json()
    
    // Validate required fields
    if (!integrationData.company_id || !integrationData.platform || !integrationData.name) {
      return NextResponse.json({ 
        error: 'Missing required fields: company_id, platform, name' 
      }, { status: 400 })
    }

    // Set the created_by field to the current user
    integrationData.created_by = user.id
    
    // Add timestamps
    const now = new Date().toISOString()
    integrationData.created_at = now
    integrationData.updated_at = now

    console.log('Creating integration:', {
      platform: integrationData.platform,
      name: integrationData.name,
      company_id: integrationData.company_id,
      user_id: user.id
    })

    const { data: integration, error } = await supabase
      .from('integrations')
      .insert(integrationData)
      .select(`
        *,
        company:companies(id, name)
      `)
      .single()

    if (error) {
      console.error('Error creating integration:', error)
      return NextResponse.json({ 
        error: 'Failed to create integration',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ Integration created successfully:', integration.id)
    return NextResponse.json(integration, { status: 201 })

  } catch (error) {
    console.error('Error in POST /api/integrations:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/integrations/[id] - Update integration
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Integration ID required' }, { status: 400 })
    }

    const updates = await request.json()
    updates.updated_at = new Date().toISOString()

    const { data: integration, error } = await supabase
      .from('integrations')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        company:companies(id, name)
      `)
      .single()

    if (error) {
      console.error('Error updating integration:', error)
      return NextResponse.json({ 
        error: 'Failed to update integration',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json(integration)

  } catch (error) {
    console.error('Error in PUT /api/integrations:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE /api/integrations/[id] - Delete integration
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user to verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Integration ID required' }, { status: 400 })
    }

    console.log('🗑️ Deleting integration and related data:', id)

    // First, get integration details for logging
    const { data: integration } = await supabase
      .from('integrations')
      .select('name, platform, company_id')
      .eq('id', id)
      .single()

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 })
    }

    // Delete related dashboards first
    const { error: dashboardError, count: dashboardCount } = await supabase
      .from('dashboards')
      .delete({ count: 'exact' })
      .eq('integration_id', id)

    if (dashboardError) {
      console.error('Error deleting related dashboards:', dashboardError)
      return NextResponse.json({ 
        error: 'Failed to delete related dashboards',
        details: dashboardError.message 
      }, { status: 500 })
    }

    console.log(`🗑️ Deleted ${dashboardCount || 0} related dashboards`)

    // Then delete the integration
    const { error: integrationError } = await supabase
      .from('integrations')
      .delete()
      .eq('id', id)

    if (integrationError) {
      console.error('Error deleting integration:', integrationError)
      return NextResponse.json({ 
        error: 'Failed to delete integration',
        details: integrationError.message 
      }, { status: 500 })
    }

    console.log(`✅ Successfully deleted integration: ${integration.name} (${integration.platform})`)

    return NextResponse.json({ 
      success: true, 
      message: `Integration "${integration.name}" and ${dashboardCount || 0} related dashboards deleted successfully`
    })

  } catch (error) {
    console.error('Error in DELETE /api/integrations:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
