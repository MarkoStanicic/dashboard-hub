'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PLATFORM_CONFIGS, integrationAPI } from '@/lib/api/integration-api'
import { LoaderIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'
import { toast } from 'sonner'

interface IntegrationConnectionDialogProps {
  platform: 'tableau' | 'powerbi' | 'salesforce'
  companyId: string
  userId: string
  trigger: React.ReactNode
}

export function IntegrationConnectionDialog({ 
  platform, 
  companyId, 
  userId, 
  trigger 
}: IntegrationConnectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string; data?: any } | null>(null)
  
  const platformConfig = PLATFORM_CONFIGS[platform]
  const [formData, setFormData] = useState(() => {
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ')
    const data: Record<string, string> = { name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} Integration ${timestamp}` }
    
    // Initialize with default config
    Object.entries(platformConfig.default_config).forEach(([key, value]) => {
      data[key] = value as string
    })
    
    return data
  })

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    setTestResult(null) // Reset test result when config changes
  }

  const handleTestConnection = async () => {
    console.log('🔵 Test connection button clicked!')
    setLoading(true)
    setTestResult(null)
    
    try {
      // Extract config from form data (excluding name)
      const config = Object.fromEntries(
        Object.entries(formData).filter(([key]) => key !== 'name')
      )

      console.log('🔵 Form data processed:', { platform, config })

      // Test the connection using the server-side API
      console.log('🔵 Making request to /api/integrations/test')
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform,
          config
        })
      })

      console.log('🔵 Response received:', response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('🔵 Test result:', result)
      setTestResult(result)
      
    } catch (error) {
      console.log('🔴 Test connection error:', error)
      setTestResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed' 
      })
    } finally {
      console.log('🔵 Test connection finished, loading:', false)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!testResult?.success) {
      toast.error('Please test the connection successfully before saving')
      return
    }

    setLoading(true)
    try {
      // Create the integration
      const integrationData = {
        company_id: companyId,
        platform,
        name: formData.name,
        status: 'connected' as const,
        config: Object.fromEntries(
          Object.entries(formData).filter(([key]) => key !== 'name')
        ),
        sync_enabled: true,
        created_by: userId,
      }

      const integration = await integrationAPI.createIntegration(integrationData)
      if (!integration) {
        throw new Error('Failed to create integration')
      }

      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} integration connected successfully!`)
      setOpen(false)
      window.location.reload() // Refresh to show the new integration
    } catch (error) {
      toast.error('Failed to save integration')
      console.error('Save integration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderConfigFields = () => {
    const allFields = [...platformConfig.required, ...platformConfig.optional]
    
    return allFields.map((field) => {
      const isRequired = platformConfig.required.includes(field)
      const label = field.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      
      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>
            {label} {isRequired && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id={field}
            type={isPasswordField(field) ? 'password' : 'text'}
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={getFieldPlaceholder(platform, field)}
            required={isRequired}
          />
        </div>
      )
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            Connect {platform.charAt(0).toUpperCase() + platform.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Configure your {platform} connection settings. Test the connection before saving.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Integration Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="My Tableau Server"
              required
            />
          </div>
          
          {renderConfigFields()}
          
          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2 font-medium">
                {testResult.success ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <AlertCircleIcon className="h-4 w-4" />
                )}
                {testResult.success ? 'Connection Successful' : 'Connection Failed'}
              </div>
              {testResult.error && (
                <p className="mt-1 text-sm">{testResult.error}</p>
              )}
              {testResult.success && testResult.data && (
                <div className="mt-2 text-sm">
                  <p>Platform details verified successfully</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={loading}
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Test Connection
          </Button>
          <Button 
            onClick={handleSave}
            disabled={loading || !testResult?.success}
          >
            {loading ? (
              <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
            ) : null}
            Save Integration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function getFieldPlaceholder(platform: string, field: string): string {
  const placeholders: Record<string, Record<string, string>> = {
    tableau: {
      server_url: 'https://your-tableau-server.com',
      site_id: 'your-site-name',
      content_url: 'your-site-name',
      api_version: '3.19',
      personal_access_token_name: 'Dashboard Hub Integration',
      personal_access_token_secret: 'your-pat-secret-here',
      username: 'your.tableau@email.com',
      password: 'your-tableau-password'
    },
    powerbi: {
      tenant_id: '12345678-1234-1234-1234-123456789012',
      client_id: '87654321-4321-4321-4321-210987654321',
      workspace_id: 'workspace-guid',
      authority: 'https://login.microsoftonline.com'
    },
    salesforce: {
      instance_url: 'https://your-org.salesforce.com',
      client_id: 'your_connected_app_consumer_key',
      client_secret: 'your_connected_app_consumer_secret',
      username: 'your.salesforce@email.com',
      password: 'your_salesforce_password',
      security_token: 'your_security_token_from_email',
      api_version: '58.0'
    }
  }
  
  return placeholders[platform]?.[field] || ''
}

function isPasswordField(field: string): boolean {
  const passwordFields = ['password', 'client_secret', 'personal_access_token_secret', 'security_token']
  return passwordFields.some(passwordField => field.includes(passwordField))
}