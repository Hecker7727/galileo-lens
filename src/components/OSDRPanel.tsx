import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Database, Search, ExternalLink, Calendar, FlaskConical } from 'lucide-react';
import { OSDRStudy } from '../types/dataTypes';
import { searchOSDRStudies, findRelatedOSDRStudies } from '../services/osdrService';
import LoadingSpinner from './LoadingSpinner';

interface OSDRPanelProps {
  publicationTitle?: string;
  organism?: string;
}

export default function OSDRPanel({ publicationTitle, organism }: OSDRPanelProps) {
  const [studies, setStudies] = useState<OSDRStudy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Auto-search for related studies if publication title is provided
  React.useEffect(() => {
    if (publicationTitle && !hasSearched) {
      handleFindRelated();
    }
  }, [publicationTitle]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const result = await searchOSDRStudies(searchQuery, 10);
      setStudies(result.studies);
    } catch (error) {
      console.error('OSDR search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindRelated = async () => {
    if (!publicationTitle) return;
    
    setIsLoading(true);
    setHasSearched(true);
    try {
      const relatedStudies = await findRelatedOSDRStudies(publicationTitle, organism);
      setStudies(relatedStudies);
    } catch (error) {
      console.error('Failed to find related OSDR studies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          NASA OSDR Data
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Open Science Data Repository - Raw experimental data and metadata
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <Input
            placeholder="Search OSDR studies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {publicationTitle && !hasSearched && (
          <Button onClick={handleFindRelated} variant="outline" className="w-full">
            <Database className="h-4 w-4 mr-2" />
            Find Related OSDR Studies
          </Button>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        )}

        {/* Results */}
        {!isLoading && hasSearched && (
          <div className="space-y-3">
            {studies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No OSDR studies found</p>
                <p className="text-xs mt-1">Try different search terms</p>
              </div>
            ) : (
              <>
                <div className="text-sm text-muted-foreground mb-2">
                  Found {studies.length} {studies.length === 1 ? 'study' : 'studies'}
                </div>
                {studies.map((study) => (
                  <Card key={study.accession} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4 space-y-2">
                      {/* Accession & Title */}
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {study.accession}
                        </Badge>
                        <h4 className="font-semibold text-sm">{study.title}</h4>
                      </div>

                      {/* Description */}
                      {study.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {study.description}
                        </p>
                      )}

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {study.organism && (
                          <Badge variant="secondary" className="gap-1">
                            🦠 {study.organism}
                          </Badge>
                        )}
                        {study.experimentType && (
                          <Badge variant="secondary" className="gap-1">
                            <FlaskConical className="h-3 w-3" />
                            {study.experimentType}
                          </Badge>
                        )}
                        {study.releaseDate && (
                          <Badge variant="secondary" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(study.releaseDate).getFullYear()}
                          </Badge>
                        )}
                      </div>

                      {/* Assay Types */}
                      {study.assayTypes && study.assayTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {study.assayTypes.slice(0, 3).map((assay, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {assay}
                            </Badge>
                          ))}
                          {study.assayTypes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{study.assayTypes.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Link to OSDR */}
                      {study.dataUrl && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => window.open(study.dataUrl, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View in OSDR
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Info Footer */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>OSDR</strong> contains primary omics data, metadata, and analysis tools from spaceflight experiments. 
            Data includes transcriptomics, proteomics, metabolomics, and more.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
