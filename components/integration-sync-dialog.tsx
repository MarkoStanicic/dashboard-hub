'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { integrationAPI, type Integration, type PlatformDashboard } from '@/lib/api/integration-api'
import { LoaderIcon, CheckCircleIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-react'
import { toast } from 'sonner'

interface IntegrationSyncDialogProps {
  integration: Integration
  trigger: React.ReactNode
}

export function IntegrationSyncDialog({ integration, trigger }: IntegrationSyncDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [discovering, setDiscovering] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [dashboards, setDashboards] = useState<PlatformDashboard[]>([])
  const [selectedDashboards, setSelectedDashboards] = useState<string[]>([])
  const [syncResult, setSyncResult] = useState<{ success: boolean; dashboards_found: number; dashboards_imported: number; dashboards_updated?: number; message?: string; errors: string[] } | null>(null)

  useEffect(() => {
    if (open && integration.status === 'connected') {
      handleDiscoverDashboards()
    }
  }, [open, integration.status])

  const handleDiscoverDashboards = async () => {
    setDiscovering(true)
    setSyncResult(null)
    
    try {
      const platformDashboards = await integrationAPI.discoverDashboards(integration.id)
      setDashboards(platformDashboards)
      // Select all dashboards by default
      setSelectedDashboards(platformDashboards.map(d => d.id))
    } catch (error) {
      toast.error('Failed to discover dashboards: ' + (error instanceof Error ? error.message : 'Unknown error'))
      setDashboards([])
    } finally {
      setDiscovering(false)
    }
  }

  const handleToggleDashboard = (dashboardId: string) => {
    setSelectedDashboards(prev => 
      prev.includes(dashboardId)
        ? prev.filter(id => id !== dashboardId)
        : [...prev, dashboardId]
    )
  }

  const handleToggleAll = () => {
    if (selectedDashboards.length === dashboards.length) {
      setSelectedDashboards([])
    } else {
      setSelectedDashboards(dashboards.map(d => d.id))
    }
  }

  const handleSync = async () => {
    if (selectedDashboards.length === 0) {
      toast.error('Please select at least one dashboard to sync')
      return
    }

    setSyncing(true)
    setSyncResult(null)
    
    try {
      const result = await integrationAPI.syncDashboards(integration.id, selectedDashboards)
      setSyncResult(result)
      
      if (result.success) {
        const total = (result.dashboards_imported || 0) + (result.dashboards_updated || 0)
        const message = result.message || `Successfully synced ${total} dashboards!`
        toast.success(message)
      } else {
        const imported = result.dashboards_imported || 0
        const updated = result.dashboards_updated || 0
        toast.error(`Sync completed with errors. Processed ${imported + updated} of ${selectedDashboards.length} dashboards.`)
      }
    } catch (error) {
      toast.error('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSyncing(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    if (syncResult?.success && syncResult.dashboards_imported > 0) {
      // Refresh the page to show new dashboards
      window.location.reload()
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'tableau': return '📊'
      case 'powerbi': return '📈'
      case 'salesforce': return '☁️'
      default: return '💹'
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{getPlatformIcon(integration.platform)}</span>
            Sync Dashboards from {integration.name}
          </DialogTitle>
          <DialogDescription>
            Discover and import dashboards from your {integration.platform} platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {integration.status !== 'connected' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircleIcon className="h-4 w-4" />
                <span className="font-medium">Integration not connected</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Please connect this integration before syncing dashboards.
              </p>
            </div>
          )}

          {integration.status === 'connected' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Available Dashboards</h3>
                  <p className="text-sm text-muted-foreground">
                    {discovering ? 'Discovering dashboards...' : `Found ${dashboards.length} dashboards`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDiscoverDashboards}
                    disabled={discovering}
                  >
                    {discovering ? (
                      <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="h-4 w-4 mr-2" />
                    )}
                    Refresh
                  </Button>
                  {dashboards.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleToggleAll}
                    >
                      {selectedDashboards.length === dashboards.length ? 'Deselect All' : 'Select All'}
                    </Button>
                  )}
                </div>
              </div>

              {discovering && (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!discovering && dashboards.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircleIcon className="h-8 w-8 mx-auto mb-2" />
                  <p>No dashboards found in this integration.</p>
                </div>
              )}

              {!discovering && dashboards.length > 0 && (
                <div className="space-y-2 max-h-60 overflow-y-auto border rounded-lg p-2">
                  {dashboards.map((dashboard) => (
                    <div key={dashboard.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={dashboard.id}
                        checked={selectedDashboards.includes(dashboard.id)}
                        onCheckedChange={() => handleToggleDashboard(dashboard.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <label 
                            htmlFor={dashboard.id}
                            className="font-medium cursor-pointer"
                          >
                            {dashboard.name}
                          </label>
                          <Badge variant="outline" className="text-xs">
                            {dashboard.platform}
                          </Badge>
                        </div>
                        {dashboard.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {dashboard.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {dashboard.workbook_name && (
                            <span>Workbook: {dashboard.workbook_name}</span>
                          )}
                          {dashboard.workspace_name && (
                            <span>Workspace: {dashboard.workspace_name}</span>
                          )}
                          {dashboard.folder_path && (
                            <span>Folder: {dashboard.folder_path}</span>
                          )}
                          <span>Updated: {new Date(dashboard.updated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {syncResult && (
                <div className={`p-4 rounded-lg border ${
                  syncResult.success 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <div className="flex items-center gap-2 font-medium">
                    {syncResult.success ? (
                      <CheckCircleIcon className="h-4 w-4" />
                    ) : (
                      <AlertCircleIcon className="h-4 w-4" />
                    )}
                    Sync {syncResult.success ? 'Completed' : 'Completed with Issues'}
                  </div>
                  <div className="mt-2 text-sm">
                    <p>Dashboards found: {syncResult.dashboards_found}</p>
                    <p>New dashboards imported: {syncResult.dashboards_imported}</p>
                    {syncResult.dashboards_updated && syncResult.dashboards_updated > 0 && (
                      <p>Existing dashboards updated: {syncResult.dashboards_updated}</p>
                    )}
                    {syncResult.message && (
                      <p className="mt-1 font-medium">{syncResult.message}</p>
                    )}
                    {syncResult.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium">Errors:</p>
                        <ul className="list-disc list-inside">
                          {syncResult.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {syncResult?.dashboards_imported ? 'Close & Refresh' : 'Cancel'}
          </Button>
          {integration.status === 'connected' && dashboards.length > 0 && (
            <Button 
              onClick={handleSync}
              disabled={syncing || selectedDashboards.length === 0}
            >
              {syncing ? (
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Import {selectedDashboards.length} Dashboard{selectedDashboards.length !== 1 ? 's' : ''}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}