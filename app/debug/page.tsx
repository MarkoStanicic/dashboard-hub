'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [results, setResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testDatabase = async () => {
      const supabase = createClient()
      const testResults: any = {}

      try {
        // Test each table individually
        console.log('Testing companies table...')
        const { data: companies, error: companiesError } = await supabase
          .from('companies')
          .select('*')
          .limit(5)
        
        testResults.companies = {
          success: !companiesError,
          error: companiesError?.message,
          count: companies?.length || 0,
          data: companies || []
        }

        console.log('Testing users table...')
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(5)
        
        testResults.users = {
          success: !usersError,
          error: usersError?.message,
          count: users?.length || 0,
          data: users || []
        }

        console.log('Testing dashboards table...')
        const { data: dashboards, error: dashboardsError } = await supabase
          .from('dashboards')
          .select('*')
          .limit(5)
        
        testResults.dashboards = {
          success: !dashboardsError,
          error: dashboardsError?.message,
          count: dashboards?.length || 0,
          data: dashboards || []
        }

        console.log('Testing roles table...')
        const { data: roles, error: rolesError } = await supabase
          .from('roles')
          .select('*')
          .limit(5)
        
        testResults.roles = {
          success: !rolesError,
          error: rolesError?.message,
          count: roles?.length || 0,
          data: roles || []
        }

        console.log('Testing user_roles table...')
        const { data: userRoles, error: userRolesError } = await supabase
          .from('user_roles')
          .select('*')
          .limit(5)
        
        testResults.user_roles = {
          success: !userRolesError,
          error: userRolesError?.message,
          count: userRoles?.length || 0,
          data: userRoles || []
        }

        console.log('Testing sections table...')
        const { data: sections, error: sectionsError } = await supabase
          .from('sections')
          .select('*')
          .limit(5)
        
        testResults.sections = {
          success: !sectionsError,
          error: sectionsError?.message,
          count: sections?.length || 0,
          data: sections || []
        }

        console.log('Testing insights table...')
        const { data: insights, error: insightsError } = await supabase
          .from('insights')
          .select('*')
          .limit(5)
        
        testResults.insights = {
          success: !insightsError,
          error: insightsError?.message,
          count: insights?.length || 0,
          data: insights || []
        }

        console.log('Testing integrations table...')
        const { data: integrations, error: integrationsError } = await supabase
          .from('integrations')
          .select('*')
          .limit(5)
        
        testResults.integrations = {
          success: !integrationsError,
          error: integrationsError?.message,
          count: integrations?.length || 0,
          data: integrations || []
        }

      } catch (error) {
        console.error('Database test error:', error)
        testResults.generalError = error
      }

      setResults(testResults)
      setLoading(false)
    }

    testDatabase()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">Database Debug</h1>
        <p>Testing database connectivity...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Database Debug Results</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(results).map(([tableName, result]: [string, any]) => (
          <Card key={tableName}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? '✅' : '❌'} {tableName}
              </CardTitle>
              <CardDescription>
                {result.success ? `${result.count} records found` : 'Error accessing table'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.error && (
                <div className="text-red-600 text-sm mb-4">
                  Error: {result.error}
                </div>
              )}
              
              {result.success && result.data && result.data.length > 0 && (
                <div className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                  <pre>{JSON.stringify(result.data[0], null, 2)}</pre>
                </div>
              )}

              {result.success && result.count === 0 && (
                <div className="text-muted-foreground text-sm">
                  Table exists but is empty
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Full Debug Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs bg-muted p-3 rounded overflow-auto max-h-96">
            <pre>{JSON.stringify(results, null, 2)}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 