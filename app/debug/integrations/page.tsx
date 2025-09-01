import { createClient } from "@/lib/supabase/server";
import { integrationAPI } from "@/lib/api/integration-api";

export default async function IntegrationsDebugPage() {
  const debugInfo: any = {};
  
  try {
    const supabase = await createClient();
    
    // Get user session and claims
    const { data: authData, error: authError } = await supabase.auth.getClaims();
    debugInfo.auth = { data: authData, error: authError?.message };
    
    if (authData?.claims) {
      const user = authData.claims;
      
      // Get user profile with company and role info
      const { data: userProfile, error: userError } = await supabase
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
        
      debugInfo.userProfile = { data: userProfile, error: userError?.message };
      
      if (userProfile?.company_id) {
        // Test integration API calls
        try {
          const integrations = await integrationAPI.getIntegrations(userProfile.company_id);
          debugInfo.integrations = integrations;
        } catch (error) {
          debugInfo.integrationsError = error instanceof Error ? error.message : 'Unknown error';
        }
        
        try {
          const stats = await integrationAPI.getIntegrationStats(userProfile.company_id);
          debugInfo.integrationStats = stats;
        } catch (error) {
          debugInfo.integrationStatsError = error instanceof Error ? error.message : 'Unknown error';
        }
      }
    }
  } catch (error) {
    debugInfo.globalError = error instanceof Error ? error.message : 'Unknown error';
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Integrations Debug Info</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
}