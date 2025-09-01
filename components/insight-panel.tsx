'use client'

import { useState } from 'react';
import { PlusIcon, MessageSquareIcon, EditIcon, TrashIcon, SendIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';

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

interface InsightPanelProps {
  dashboardId: string;
  insights: Insight[];
  canEdit: boolean;
  userRole: string;
}

export default function InsightPanel({ 
  dashboardId, 
  insights: initialInsights, 
  canEdit, 
  userRole 
}: InsightPanelProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInsight, setNewInsight] = useState({
    content: '',
    type: 'note' as const
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'note': return '📝';
      case 'explanation': return '💡';
      case 'callout': return '⚠️';
      case 'tag': return '🏷️';
      default: return '💬';
    }
  };

  const getInsightTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-100 text-blue-800';
      case 'explanation': return 'bg-yellow-100 text-yellow-800';
      case 'callout': return 'bg-red-100 text-red-800';
      case 'tag': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddInsight = async () => {
    if (!newInsight.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('insights')
        .insert({
          dashboard_id: dashboardId,
          content: newInsight.content.trim(),
          type: newInsight.type,
          created_by: user.user?.id
        })
        .select(`
          id,
          content,
          type,
          position_x,
          position_y,
          created_at,
          created_by,
          author:users!created_by(email)
        `)
        .single();

      if (error) throw error;

             const newInsightData: Insight = {
         id: data.id,
         content: data.content,
         type: data.type,
         position_x: data.position_x,
         position_y: data.position_y,
         created_at: data.created_at,
         created_by: data.created_by,
         author: Array.isArray(data.author) ? data.author[0] : data.author
       };

      setInsights([newInsightData, ...insights]);
      setNewInsight({ content: '', type: 'note' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding insight:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInsight = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('insights')
        .delete()
        .eq('id', insightId);

      if (error) throw error;

      setInsights(insights.filter(insight => insight.id !== insightId));
    } catch (error) {
      console.error('Error deleting insight:', error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Add New Insight */}
      {canEdit && (
        <div className="p-4 border-b">
          {!showAddForm ? (
            <Button 
              onClick={() => setShowAddForm(true)} 
              size="sm" 
              className="w-full"
              variant="outline"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Insight
            </Button>
          ) : (
            <div className="space-y-3">
              <div>
                <Label htmlFor="insight-type" className="text-xs">Type</Label>
                <select
                  id="insight-type"
                  value={newInsight.type}
                  onChange={(e) => setNewInsight({ ...newInsight, type: e.target.value as any })}
                  className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="note">📝 Note</option>
                  <option value="explanation">💡 Explanation</option>
                  <option value="callout">⚠️ Callout</option>
                  <option value="tag">🏷️ Tag</option>
                </select>
              </div>
              <div>
                <Label htmlFor="insight-content" className="text-xs">Content</Label>
                <textarea
                  id="insight-content"
                  value={newInsight.content}
                  onChange={(e) => setNewInsight({ ...newInsight, content: e.target.value })}
                  placeholder="Add your insight or note..."
                  className="w-full mt-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddInsight}
                  disabled={!newInsight.content.trim() || isSubmitting}
                  size="sm"
                  className="flex-1"
                >
                  <SendIcon className="h-3 w-3 mr-1" />
                  {isSubmitting ? 'Adding...' : 'Add'}
                </Button>
                <Button 
                  onClick={() => {
                    setShowAddForm(false);
                    setNewInsight({ content: '', type: 'note' });
                  }}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Insights List */}
      <div className="flex-1 overflow-y-auto">
        {insights.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquareIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No insights yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              {canEdit ? 'Add the first insight to start building context around this dashboard.' : 'Insights will appear here when team members add them.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {insights.map((insight) => (
              <Card key={insight.id} className="text-sm">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge className={`text-xs ${getInsightTypeColor(insight.type)}`}>
                      <span className="mr-1">{getInsightTypeIcon(insight.type)}</span>
                      {insight.type}
                    </Badge>
                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <EditIcon className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteInsight(insight.id)}
                        >
                          <TrashIcon className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm mb-2">{insight.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{insight.author.email}</span>
                    <span>{new Date(insight.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {insights.length > 0 && (
        <div className="p-4 border-t bg-muted/50">
          <div className="text-xs text-muted-foreground text-center">
            {insights.length} insight{insights.length !== 1 ? 's' : ''} • 
            Role: <span className="font-medium capitalize">{userRole}</span>
          </div>
        </div>
      )}
    </div>
  );
} 