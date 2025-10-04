import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Cluster } from '../types/dataTypes';

interface GraphClusterViewProps {
  clusters: Cluster[];
  onClusterToggle?: (clusterId: string, open: boolean) => void;
}

export default function GraphClusterView({ clusters, onClusterToggle }: GraphClusterViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Clusters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {clusters.map(cluster => (
          <div 
            key={cluster.id}
            className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="font-medium">{cluster.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {cluster.nodes.length} nodes
                </Badge>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onClusterToggle?.(cluster.id, !cluster.expanded)}
              >
                {cluster.expanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {cluster.expanded && (
              <div className="mt-2 pt-2 border-t">
                {cluster.summary && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {cluster.summary}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {cluster.nodes.slice(0, 5).map(nodeId => (
                    <Badge key={nodeId} variant="outline" className="text-xs">
                      {nodeId}
                    </Badge>
                  ))}
                  {cluster.nodes.length > 5 && (
                    <Badge variant="outline" className="text-xs">
                      +{cluster.nodes.length - 5} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {clusters.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No clusters available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}