'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { integrationAPI, type Integration } from '@/lib/api/integration-api'
import { LoaderIcon, TrashIcon, AlertTriangleIcon } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteIntegrationDialogProps {
  integration: Integration
  trigger: React.ReactNode
}

export function DeleteIntegrationDialog({ integration, trigger }: DeleteIntegrationDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      console.log('🗑️ Deleting integration:', integration.name)
      
      await integrationAPI.deleteIntegration(integration.id)
      
      toast.success(`${integration.platform.charAt(0).toUpperCase() + integration.platform.slice(1)} integration deleted successfully!`)
      setOpen(false)
      
      // Refresh the page to remove the deleted integration
      window.location.reload()
      
    } catch (error) {
      console.error('Delete integration error:', error)
      toast.error('Failed to delete integration: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangleIcon className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Integration</DialogTitle>
              <DialogDescription>
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getPlatformIcon(integration.platform)}</span>
              <div>
                <h4 className="font-medium">{integration.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {integration.platform.charAt(0).toUpperCase() + integration.platform.slice(1)} Integration
                </p>
              </div>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• All connected dashboards will be removed</p>
              <p>• Sync history will be deleted</p>
              <p>• This action is permanent and cannot be reversed</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Warning:</strong> Deleting this integration will permanently remove all associated dashboards 
              and data from your Dashboard Hub. Make sure you have backups if needed.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete Integration
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
