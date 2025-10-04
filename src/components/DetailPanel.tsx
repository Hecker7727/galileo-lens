import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ExternalLink, User, FileText, Beaker, Lightbulb, BarChart3 } from 'lucide-react';
import { Node, Publication } from '../types/dataTypes';
import OSDRPanel from './OSDRPanel';

interface DetailPanelProps {
  item: Node | Publication | null;
  onAction?: (action: string, itemId: string) => void;
}

export default function DetailPanel({ item, onAction }: DetailPanelProps) {
  if (!item) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detail Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Select a node or item to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'publication': return <FileText className="h-4 w-4" />;
      case 'researcher': return <User className="h-4 w-4" />;
      case 'concept': return <Lightbulb className="h-4 w-4" />;
      case 'experiment': return <Beaker className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'publication': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'researcher': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'concept': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'experiment': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const renderNodeDetails = (node: Node) => (
    <>
      <div className="flex items-center gap-2 mb-4">
        {getIcon(node.type)}
        <h3 className="font-semibold">{node.label}</h3>
        <Badge className={getTypeColor(node.type)}>
          {node.type}
        </Badge>
      </div>

      <div className="space-y-4">
        {node.type === 'publication' && node.properties && (
          <>
            {node.properties.authors && (
              <div>
                <Label>Authors</Label>
                <p className="text-sm">{Array.isArray(node.properties.authors) 
                  ? node.properties.authors.join(', ') 
                  : String(node.properties.authors)}</p>
              </div>
            )}
            {node.properties.journal && (
              <div>
                <Label>Journal</Label>
                <p className="text-sm">{String(node.properties.journal)}</p>
              </div>
            )}
            {node.properties.year && (
              <div>
                <Label>Year</Label>
                <p className="text-sm">{String(node.properties.year)}</p>
              </div>
            )}
            {node.properties.abstract && (
              <div>
                <Label>Abstract</Label>
                <p className="text-sm text-muted-foreground">{String(node.properties.abstract)}</p>
              </div>
            )}
            {node.properties.doi && (
              <div>
                <Label>DOI</Label>
                <Button variant="link" className="p-0 h-auto">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {node.properties.doi}
                </Button>
              </div>
            )}
          </>
        )}

        {node.type === 'researcher' && node.properties && (
          <>
            {node.properties.institution && (
              <div>
                <Label>Institution</Label>
                <p className="text-sm">{String(node.properties.institution)}</p>
              </div>
            )}
            {node.properties.specialization && (
              <div>
                <Label>Specialization</Label>
                <p className="text-sm">{String(node.properties.specialization)}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {node.properties.publications ? (
                <div>
                  <Label>Publications</Label>
                  <p className="text-sm font-semibold">{String(node.properties.publications)}</p>
                </div>
              ) : null}
              {node.properties.hIndex ? (
                <div>
                  <Label>H-Index</Label>
                  <p className="text-sm font-semibold">{String(node.properties.hIndex)}</p>
                </div>
              ) : null}
            </div>
          </>
        )}

        {node.type === 'experiment' && node.properties && (
          <>
            {node.properties.duration && (
              <div>
                <Label>Duration</Label>
                <p className="text-sm">{String(node.properties.duration)}</p>
              </div>
            )}
            {node.properties.subjects && (
              <div>
                <Label>Subjects</Label>
                <p className="text-sm">{String(node.properties.subjects)}</p>
              </div>
            )}
            {node.properties.status && (
              <div>
                <Label>Status</Label>
                <Badge variant={node.properties.status === 'completed' ? 'default' : 'secondary'}>
                  {String(node.properties.status)}
                </Badge>
              </div>
            )}
            {node.properties.findings && (
              <div>
                <Label>Key Findings</Label>
                <p className="text-sm text-muted-foreground">{String(node.properties.findings)}</p>
              </div>
            )}
          </>
        )}

        {node.type === 'concept' && node.properties && (
          <>
            {node.properties.definition && (
              <div>
                <Label>Definition</Label>
                <p className="text-sm text-muted-foreground">{String(node.properties.definition)}</p>
              </div>
            )}
            {node.properties.relatedTerms && Array.isArray(node.properties.relatedTerms) && (
              <div>
                <Label>Related Terms</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {node.properties.relatedTerms.map((term: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {term}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Separator className="my-4" />

      <div className="space-y-2">
        <h4 className="font-medium">Actions</h4>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction?.('view_related', node.id)}
          >
            View Related
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => onAction?.('analyze', node.id)}
          >
            <BarChart3 className="h-3 w-3 mr-1" />
            Analyze
          </Button>
          {node.type === 'publication' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onAction?.('forecast', node.id)}
            >
              Run Forecast
            </Button>
          )}
        </div>
      </div>

      {/* OSDR Integration */}
      {node.type === 'publication' && (
        <>
          <Separator className="my-4" />
          <OSDRPanel 
            publicationTitle={node.label}
            organism={node.properties?.organism as string}
          />
        </>
      )}
    </>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Panel</CardTitle>
      </CardHeader>
      <CardContent>
        {'type' in item && 'label' in item ? renderNodeDetails(item as Node) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Unsupported item type</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium text-muted-foreground mb-1">{children}</div>;
}