import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Separator } from './ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink, Lightbulb, TrendingUp, FileText, Target, AlertTriangle, CheckCircle, Eye } from 'lucide-react';
import PublicationModal from './PublicationModal';

interface AnswerRichViewProps {
  content: any;
  onSuggestionClick?: (suggestion: string) => void;
}

interface PublicationClickEvent {
  publication: any;
}

export default function AnswerRichView({ content, onSuggestionClick }: AnswerRichViewProps) {
  const [selectedPublication, setSelectedPublication] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePublicationClick = (publication: any) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPublication(null);
  };

  if (!content) return null;

  return (
    <div className="space-y-4">
      {/* Suggestions */}
      {content.suggestions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Suggested Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {content.suggestions.map((suggestion: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {content.keyPoints && (
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-blue-500" />
              Key Research Findings
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2 text-sm">
              {content.keyPoints.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-1 text-xs font-semibold">{index + 1}</span>
                  <span className="text-foreground leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Implications Section */}
      {content.implications && (
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-500" />
              Implications for Space Medicine
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              {content.implications.map((implication: string, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-purple-500 mt-1">→</span>
                  <span className="text-foreground leading-relaxed">{implication}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      {content.table && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{content.table.title || 'Data Summary'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {content.table.headers.map((header: string, index: number) => (
                    <TableHead key={index} className="text-xs">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {content.table.rows.map((row: any[], rowIndex: number) => (
                  <TableRow key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <TableCell key={cellIndex} className="text-xs">{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Chart Data */}
      {content.chart && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {content.chart.title || 'Data Visualization'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={content.chart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                  />
                  <YAxis 
                    stroke="var(--color-muted-foreground)"
                    fontSize={10}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-popover)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-popover-foreground)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="var(--color-chart-1)" 
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related Publications */}
      {content.relatedPublications && content.relatedPublications.length > 0 && (
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              NASA Publications Used ({content.relatedPublications.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {content.relatedPublications.slice(0, 3).map((publication: any, index: number) => (
                <div 
                  key={index} 
                  className="p-3 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors group"
                  onClick={() => handlePublicationClick(publication)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {publication.title}
                      </h4>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {publication.tags?.researchArea || 'Research'}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {publication.tags?.organism || 'Study'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {publication.abstract?.slice(0, 150)}...
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handlePublicationClick(publication);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {publication.link && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          asChild
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                          <a href={publication.link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {content.relatedPublications.length > 3 && (
                <div className="text-center pt-2">
                  <Button variant="outline" size="sm">
                    View {content.relatedPublications.length - 3} more publications
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Citations */}
      {content.citations && content.citations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Research References
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {content.citations.map((citation: any, index: number) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </Badge>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{citation.source}</span>
                    <div className="flex items-center gap-2 mt-1">
                      {citation.url && (
                        <Button variant="link" className="p-0 h-auto text-xs" asChild>
                          <a href={citation.url} target="_blank" rel="noopener noreferrer">
                            View Publication <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {citation.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(citation.confidence * 100)}% relevance
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment */}
      {content.risks && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {content.risks.map((risk: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded text-sm">
                  <span>{risk.name}</span>
                  <Badge variant={risk.level === 'high' ? 'destructive' : risk.level === 'medium' ? 'default' : 'secondary'}>
                    {risk.level} risk
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {content.actions && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {content.actions.map((action: string, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                    {index + 1}
                  </Badge>
                  <span>{action}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Publication Modal */}
      <PublicationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        publication={selectedPublication}
      />
    </div>
  );
}