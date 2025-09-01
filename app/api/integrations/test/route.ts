import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import SalesforceService from '@/lib/platforms/salesforce-service'
import TableauService from '@/lib/platforms/tableau-service'
import PowerBIService from '@/lib/platforms/powerbi-service'

export async function POST(request: NextRequest) {
  console.log('🟢 API /api/integrations/test called')
  try {
    const supabase = await createClient()
    
    // Check authentication (bypass in development for testing)
    const isDevelopment = process.env.NODE_ENV === 'development'
    const bypassAuth = process.env.BYPASS_AUTH_FOR_TESTING === 'true'
    
    console.log('🔍 Auth bypass check:', { isDevelopment, bypassAuth })
    
    if (isDevelopment && bypassAuth) {
      console.log('🟡 Auth bypassed for development testing')
    } else {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('🟢 Auth check:', { user: !!user, error: authError?.message })
      
      if (authError || !user) {
        console.log('🔴 Unauthorized access attempt')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const body = await request.json()
    const { platform, config } = body
    console.log('🟢 Request body:', { platform, hasConfig: !!config })

    if (!platform || !config) {
      console.log('🔴 Missing platform or config')
      return NextResponse.json({ error: 'Platform and config are required' }, { status: 400 })
    }

    // Test connection based on platform
    console.log('🟢 Testing connection for platform:', platform)
    let result
    try {
      switch (platform) {
        case 'salesforce': {
          console.log('🟢 Creating Salesforce service')
          const service = new SalesforceService(config)
          console.log('🟢 Calling Salesforce testConnection()')
          result = await service.testConnection()
          console.log('🟢 Salesforce test result:', result)
          break
        }
        case 'tableau': {
          console.log('🟢 Creating Tableau service')
          const service = new TableauService(config)
          result = await service.testConnection()
          break
        }
        case 'powerbi': {
          console.log('🟢 Creating PowerBI service')
          const service = new PowerBIService(config)
          result = await service.testConnection()
          break
        }
        default:
          console.log('🔴 Unsupported platform:', platform)
          return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
      }
    } catch (error) {
      console.error(`${platform} connection test error:`, error)
      return NextResponse.json({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}