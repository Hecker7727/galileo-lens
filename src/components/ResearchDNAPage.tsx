import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Search,
  Dna,
  Sparkles,
  ArrowRight,
  Loader2,
  Info,
  TrendingUp,
  Microscope
} from 'lucide-react';
import { DNAVisualization, CompatibilityScore } from './DNAVisualization';
import {
  generateResearchDNA,
  calculateDNACompatibility,
  findCompatibleResearch,
  getCompatibilityColor,
  getCompatibilityLabel,
  getCachedDNA,
  cacheDNA,
  ResearchDNA,
  DNACompatibility
} from '../services/researchDNAService';
import { getPublications } from '../data/processedPublications';
import { Publication } from '../types/dataTypes';
import LoadingSpinner from './LoadingSpinner';

export default function ResearchDNAPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPublication, setSelectedPublication] = useState<Publication | null>(null);
  const [selectedDNA, setSelectedDNA] = useState<ResearchDNA | null>(null);
  const [compatibleResearch, setCompatibleResearch] = useState<DNACompatibility[]>([]);
  const [allDNAs, setAllDNAs] = useState<ResearchDNA[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDNA, setIsGeneratingDNA] = useState(false);
  const [searchResults, setSearchResults] = useState<Publication[]>([]);

  useEffect(() => {
    loadPublications();
  }, []);

  const loadPublications = async () => {
    setIsLoading(true);
    try {
      const pubs = await getPublications();
      setPublications(pubs);
      setSearchResults(pubs.slice(0, 10)); // Show first 10
    } catch (error) {
      console.error('Failed to load publications:', error);
    }
    setIsLoading(false);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(publications.slice(0, 10));
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = publications.filter(pub =>
      pub.title.toLowerCase().includes(query) ||
      (pub.abstract || '').toLowerCase().includes(query) ||
      pub.tags?.researchArea?.toLowerCase().includes(query) ||
      pub.tags?.organism?.toLowerCase().includes(query)
    ).slice(0, 20);

    setSearchResults(results);
  };

  const handleSelectPublication = async (publication: Publication) => {
    setSelectedPublication(publication);
    setIsGeneratingDNA(true);
    setCompatibleResearch([]);

    try {
      // Check cache first
      let dna = getCachedDNA(publication.id);
      
      if (!dna) {
        // Generate DNA
        dna = await generateResearchDNA(publication);
        cacheDNA(dna);
      }

      setSelectedDNA(dna);

      // Generate DNAs for comparison (sample of 30 random publications for speed)
      const samplePubs = publications
        .filter(p => p.id !== publication.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 30);

      const dnasForComparison: ResearchDNA[] = [];
      
      for (const pub of samplePubs) {
        let pubDNA = getCachedDNA(pub.id);
        if (!pubDNA) {
          pubDNA = await generateResearchDNA(pub);
          cacheDNA(pubDNA);
        }
        dnasForComparison.push(pubDNA);
      }

      setAllDNAs(dnasForComparison);

      // Find compatible research
      const compatible = findCompatibleResearch(dna, dnasForComparison, 10);
      setCompatibleResearch(compatible);

    } catch (error) {
      console.error('Error generating DNA:', error);
    }

    setIsGeneratingDNA(false);
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading NASA research database..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <Dna className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Research DNA Matching
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover research compatibility through genetic-style matching. Each publication has a unique "DNA fingerprint" - find papers that share similar research genes!
          </p>
        </div>

        {/* Info Banner */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                  How Research DNA Works
                </h4>
                <p className="text-xs text-purple-800 dark:text-purple-200">
                  We analyze each publication's methodology, organisms, stressors, and outcomes to create a unique "DNA fingerprint." 
                  Just like genetic matching, we calculate compatibility scores (0-100%) based on shared research genes.
                  Higher scores mean more compatible research approaches!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Search & Select */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search Publications
                </CardTitle>
                <CardDescription>
                  Select a publication to analyze its research DNA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by title, topic, or organism..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-2">
                    {searchResults.map((pub) => (
                      <motion.button
                        key={pub.id}
                        onClick={() => handleSelectPublication(pub)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          selectedPublication?.id === pub.id
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 hover:border-purple-300 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="font-medium text-sm mb-1 line-clamp-2">
                          {pub.title}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {pub.tags?.researchArea || 'General'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {pub.tags?.organism || 'Various'}
                          </Badge>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - DNA Visualization */}
          <div className="space-y-4">
            {!selectedDNA ? (
              <Card className="h-full flex items-center justify-center min-h-[600px]">
                <CardContent className="text-center py-12">
                  <Dna className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    No Publication Selected
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Select a publication from the left to generate its Research DNA fingerprint and find compatible studies
                  </p>
                </CardContent>
              </Card>
            ) : isGeneratingDNA ? (
              <Card className="h-full flex items-center justify-center min-h-[600px]">
                <CardContent className="text-center py-12">
                  <Loader2 className="h-16 w-16 text-purple-600 animate-spin mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Analyzing Research DNA...
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Extracting genetic markers from {selectedPublication?.title.slice(0, 60)}...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <DNAVisualization dna={selectedDNA} showDetails={true} />
            )}
          </div>
        </div>

        {/* Compatible Research Results */}
        {compatibleResearch.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-green-600" />
                  Compatible Research Found
                </CardTitle>
                <CardDescription>
                  Top {compatibleResearch.length} publications with similar research DNA
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibleResearch.map((compatibility, index) => (
                    <CompatibilityCard
                      key={compatibility.publication2.publicationId}
                      compatibility={compatibility}
                      rank={index + 1}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Compatibility Card Component
function CompatibilityCard({ compatibility, rank }: { compatibility: DNACompatibility; rank: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.1 }}
      className={`border-2 rounded-lg p-4 ${getCompatibilityColor(compatibility.compatibilityScore)}`}
    >
      <div className="flex items-start gap-4">
        {/* Rank Badge */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            #{rank}
          </div>
        </div>

        {/* Compatibility Score */}
        <div className="flex-shrink-0">
          <CompatibilityScore 
            score={compatibility.compatibilityScore}
            label={getCompatibilityLabel(compatibility.compatibilityScore)}
          />
        </div>

        {/* Publication Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-2 line-clamp-2">
            {compatibility.publication2.publicationTitle}
          </h4>

          <div className="space-y-2 mb-3">
            {compatibility.sharedMethodology.length > 0 && (
              <div className="flex items-start gap-2">
                <Microscope className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">Shared Methods:</span>{' '}
                  {compatibility.sharedMethodology.slice(0, 2).join(', ')}
                  {compatibility.sharedMethodology.length > 2 && ` +${compatibility.sharedMethodology.length - 2} more`}
                </div>
              </div>
            )}

            {compatibility.sharedOrganisms.length > 0 && (
              <div className="flex items-start gap-2">
                <Dna className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">Same Organisms:</span>{' '}
                  {compatibility.sharedOrganisms.join(', ')}
                </div>
              </div>
            )}

            {compatibility.sharedStressors.length > 0 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold">Common Stressors:</span>{' '}
                  {compatibility.sharedStressors.join(', ')}
                </div>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            {expanded ? 'Show Less' : 'Show Insights'}
            <ArrowRight className={`h-3 w-3 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t space-y-1"
              >
                {compatibility.insights.map((insight, i) => (
                  <div key={i} className="text-xs flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}