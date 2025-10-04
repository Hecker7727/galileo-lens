import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, TrendingDown, Lightbulb, Database, RefreshCw } from 'lucide-react';
import { ResearchGap, GapAnalysisResult } from '../types/dataTypes';
import { analyzeResearchGaps } from '../services/gapAnalysisService';
import { getPublications } from '../data/processedPublications';
import LoadingSpinner from './LoadingSpinner';

export default function GapAnalysisView() {
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadGapAnalysis();
  }, []);

  const loadGapAnalysis = async () => {
    setIsLoading(true);
    try {
      console.log('🔍 Loading gap analysis...');
      const publications = await getPublications();
      const result = await analyzeResearchGaps(publications);
      setAnalysis(result);
      console.log('✅ Gap analysis complete:', result);
    } catch (error) {
      console.error('Failed to load gap analysis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'organism': return '🦠';
      case 'research_area': return '🔬';
      case 'methodology': return '📊';
      case 'duration': return '⏱️';
      case 'environment': return '🌌';
      default: return '📋';
    }
  };

  const filteredGaps = analysis?.gaps.filter(gap => 
    selectedCategory === 'all' || gap.category === selectedCategory
  ) || [];

  const categories = [
    { id: 'all', label: 'All Gaps' },
    { id: 'organism', label: 'Organisms' },
    { id: 'research_area', label: 'Research Areas' },
    { id: 'methodology', label: 'Methodologies' },
    { id: 'duration', label: 'Duration' },
    { id: 'environment', label: 'Environments' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Failed to load gap analysis</p>
          <Button onClick={loadGapAnalysis}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6" />
            Research Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{analysis.totalPublications}</div>
              <div className="text-sm text-muted-foreground">Publications Analyzed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{analysis.gaps.length}</div>
              <div className="text-sm text-muted-foreground">Gaps Identified</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-3xl font-bold">{analysis.coverageScore}%</div>
              <div className="text-sm text-muted-foreground">Coverage Score</div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              AI Analysis Summary
            </h4>
            <p className="text-sm whitespace-pre-line">{analysis.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
            size="sm"
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Gap Cards */}
      <div className="grid gap-4">
        {filteredGaps.map((gap) => (
          <Card key={gap.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getCategoryIcon(gap.category)}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{gap.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {gap.description}
                    </p>
                  </div>
                </div>
                <Badge variant={getSeverityColor(gap.severity)}>
                  {gap.severity.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Evidence */}
              <div>
                <h5 className="font-semibold text-sm mb-2">Evidence:</h5>
                <ul className="space-y-1">
                  {gap.evidence.map((evidence, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-orange-500">•</span>
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommendations */}
              <div>
                <h5 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations:
                </h5>
                <ul className="space-y-1">
                  {gap.recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Related Publications Count */}
              {gap.relatedPublications !== undefined && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <Database className="h-4 w-4" />
                  <span>{gap.relatedPublications} related publications found</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGaps.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No gaps found in this category. Great coverage! 🎉
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
