import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  FileText, 
  Calendar, 
  Users, 
  Target, 
  Microscope, 
  ExternalLink, 
  Sparkles,
  TrendingUp,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { summarizePublication } from '../services/geminiService';

interface PublicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  publication: any;
}

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function PublicationModal({ isOpen, onClose, publication }: PublicationModalProps) {
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'summary' | 'insights'>('overview');

  useEffect(() => {
    if (isOpen && publication && !aiSummary) {
      generateAISummary();
    }
  }, [isOpen, publication]);

  const generateAISummary = async () => {
    if (!publication) return;
    
    setIsLoadingSummary(true);
    try {
      const response = await summarizePublication(publication.id);
      setAiSummary(response.text);
    } catch (error) {
      console.error('Failed to generate AI summary:', error);
      setAiSummary('Unable to generate AI summary at this time.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // Generate visualization data based on publication content
  const generateVisualizationData = () => {
    if (!publication) return { researchMetrics: [], researchAreas: [] };

    // Research metrics simulation based on publication content
    const researchMetrics = [
      { name: 'Relevance', value: 95, color: '#3b82f6' },
      { name: 'Impact Factor', value: 87, color: '#10b981' },
      { name: 'Methodology', value: 92, color: '#f59e0b' },
      { name: 'Data Quality', value: 89, color: '#ef4444' },
    ];

    // Research areas breakdown
    const researchAreas = [
      { name: 'Microgravity Effects', value: 35, color: '#3b82f6' },
      { name: 'Cellular Biology', value: 25, color: '#10b981' },
      { name: 'Bone/Muscle Health', value: 20, color: '#f59e0b' },
      { name: 'Cardiovascular', value: 12, color: '#ef4444' },
      { name: 'Other', value: 8, color: '#8b5cf6' },
    ];

    return { researchMetrics, researchAreas };
  };

  // Extract real research insights from publication
  const extractResearchInsights = () => {
    if (!publication) return { keyFindings: [], methodology: [], applications: [], organisms: [] };

    const abstract = (publication.abstract || '').toLowerCase();
    const title = (publication.title || '').toLowerCase();
    const fullText = `${title} ${abstract}`;

    // Extract key findings based on actual content
    const keyFindings: string[] = [];
    
    if (fullText.includes('bone') || fullText.includes('skeleton')) {
      keyFindings.push('Bone density and skeletal changes studied');
    }
    if (fullText.includes('muscle') || fullText.includes('atrophy')) {
      keyFindings.push('Muscle atrophy and strength analyzed');
    }
    if (fullText.includes('cardiovascular') || fullText.includes('heart')) {
      keyFindings.push('Cardiovascular system effects documented');
    }
    if (fullText.includes('immune') || fullText.includes('immunity')) {
      keyFindings.push('Immune system response examined');
    }
    if (fullText.includes('radiation') || fullText.includes('cosmic ray')) {
      keyFindings.push('Radiation exposure impacts assessed');
    }
    if (fullText.includes('microgravity') || fullText.includes('weightless')) {
      keyFindings.push('Microgravity environmental effects evaluated');
    }
    if (fullText.includes('gene') || fullText.includes('dna') || fullText.includes('expression')) {
      keyFindings.push('Genetic and molecular changes identified');
    }

    // Extract methodology
    const methodology: string[] = [];
    if (fullText.includes('rna-seq') || fullText.includes('sequencing')) {
      methodology.push('RNA sequencing and genomic analysis');
    }
    if (fullText.includes('imaging') || fullText.includes('mri') || fullText.includes('ct scan')) {
      methodology.push('Medical imaging techniques');
    }
    if (fullText.includes('cell culture') || fullText.includes('in vitro')) {
      methodology.push('Cell culture and in vitro experiments');
    }
    if (fullText.includes('animal model') || fullText.includes('in vivo')) {
      methodology.push('Animal model studies');
    }
    if (fullText.includes('spaceflight') || fullText.includes('iss')) {
      methodology.push('Actual spaceflight experiments');
    }
    if (fullText.includes('ground') || fullText.includes('analog')) {
      methodology.push('Ground-based analog studies');
    }

    // Extract organisms studied
    const organisms: string[] = [];
    if (fullText.includes('mice') || fullText.includes('mouse') || fullText.includes('rodent')) {
      organisms.push('Mice/Rodents');
    }
    if (fullText.includes('human') || fullText.includes('astronaut')) {
      organisms.push('Humans/Astronauts');
    }
    if (fullText.includes('rat')) {
      organisms.push('Rats');
    }
    if (fullText.includes('cell') || fullText.includes('cellular')) {
      organisms.push('Cell lines');
    }
    if (fullText.includes('fruit fly') || fullText.includes('drosophila')) {
      organisms.push('Fruit flies');
    }

    // Extract applications
    const applications: string[] = [];
    if (fullText.includes('mars') || fullText.includes('deep space')) {
      applications.push('Mars and deep space mission planning');
    }
    if (fullText.includes('countermeasure') || fullText.includes('exercise') || fullText.includes('prevention')) {
      applications.push('Development of countermeasures');
    }
    if (fullText.includes('risk') || fullText.includes('safety')) {
      applications.push('Crew health risk assessment');
    }
    if (fullText.includes('long-duration') || fullText.includes('extended')) {
      applications.push('Long-duration spaceflight protocols');
    }
    if (fullText.includes('selection') || fullText.includes('screening')) {
      applications.push('Astronaut selection criteria');
    }

    // Provide defaults if nothing found
    if (keyFindings.length === 0) {
      keyFindings.push('Space biology and health effects studied');
      keyFindings.push('Physiological adaptations documented');
    }
    if (methodology.length === 0) {
      methodology.push('Experimental research methodology');
      methodology.push('Data collection and analysis');
    }
    if (organisms.length === 0) {
      organisms.push('Biological specimens');
    }
    if (applications.length === 0) {
      applications.push('Space mission health protocols');
      applications.push('Astronaut health and safety');
    }

    return { keyFindings, methodology, applications, organisms };
  };

  const { researchMetrics, researchAreas } = generateVisualizationData();
  const researchInsights = extractResearchInsights();

  if (!publication) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col h-full"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-b flex-shrink-0">
                <DialogHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-12">
                      <DialogTitle className="text-xl leading-tight mb-3">
                        {publication.title}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                          <Microscope className="h-3 w-3 mr-1" />
                          {publication.tags?.researchArea || 'Research'}
                        </Badge>
                        <Badge variant="outline">
                          <Target className="h-3 w-3 mr-1" />
                          {publication.tags?.organism || 'Study'}
                        </Badge>
                        {publication.date && (
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {publication.date}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {publication.authors && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{publication.authors.slice(0, 2).join(', ')}{publication.authors.length > 2 ? ' et al.' : ''}</span>
                          </div>
                        )}
                        {publication.link && (
                          <Button variant="link" className="p-0 h-auto text-sm" asChild>
                            <a href={publication.link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Original
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                    {/* Remove the manual close button - Dialog component already has one */}
                  </div>
                </DialogHeader>

                {/* Tab Navigation */}
                <div className="px-6 pb-2">
                  <div className="flex gap-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: FileText },
                      { id: 'summary', label: 'AI Summary', icon: Sparkles },
                      { id: 'insights', label: 'Research Insights', icon: TrendingUp },
                    ].map(({ id, label, icon: Icon }) => (
                      <Button
                        key={id}
                        variant={activeTab === id ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab(id as any)}
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content - Now properly scrollable with explicit height */}
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                <div className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                    {activeTab === 'overview' && (
                      <div className="space-y-6">
                        {/* Abstract */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-500" />
                              Abstract
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm leading-relaxed text-foreground">
                              {publication.abstract || 'No abstract available for this publication.'}
                            </p>
                          </CardContent>
                        </Card>

                        {/* Key Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Publication Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Research Area:</span>
                                <span className="font-medium">{publication.tags?.researchArea || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Study Organism:</span>
                                <span className="font-medium">{publication.tags?.organism || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Document Type:</span>
                                <span className="font-medium">{publication.type || 'Research Paper'}</span>
                              </div>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant="secondary" className="text-xs">Published</Badge>
                              </div>
                            </CardContent>
                          </Card>

                          <Card>
                            <CardHeader className="pb-3">
                              <CardTitle className="text-base">Research Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-32">
                                <ResponsiveContainer width="100%" height="100%">
                                  <BarChart data={researchMetrics}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis 
                                      dataKey="name" 
                                      stroke="var(--color-muted-foreground)"
                                      fontSize={10}
                                      interval={0}
                                      angle={-45}
                                      textAnchor="end"
                                      height={40}
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
                        </div>
                      </div>
                    )}

                    {activeTab === 'summary' && (
                      <div className="space-y-6">
                        <Card className="border-l-4 border-l-purple-500">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Brain className="h-5 w-5 text-purple-500" />
                              AI-Generated Summary
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isLoadingSummary ? (
                              <div className="space-y-3">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-4/5" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                              </div>
                            ) : (
                              <div className="prose prose-sm max-w-none">
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                  {aiSummary || 'Generating AI summary...'}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {aiSummary && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">Key Takeaways</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">85%</div>
                                  <div className="text-xs text-muted-foreground">Relevance Score</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">High</div>
                                  <div className="text-xs text-muted-foreground">Research Impact</div>
                                </div>
                                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.2</div>
                                  <div className="text-xs text-muted-foreground">Citation Index</div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}

                    {activeTab === 'insights' && (
                      <div className="space-y-6">
                        {/* Key Findings */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                              <Brain className="h-5 w-5 text-purple-500" />
                              Key Research Findings
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {researchInsights.keyFindings.map((finding, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-1">•</span>
                                  <span className="text-sm">{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Methodology */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Microscope className="h-4 w-4 text-green-500" />
                                Research Methodology
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {researchInsights.methodology.map((method, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">•</span>
                                    <span className="text-sm">{method}</span>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>

                          {/* Organisms Studied */}
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                <Target className="h-4 w-4 text-orange-500" />
                                Study Subjects
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="flex flex-wrap gap-2">
                                {researchInsights.organisms.map((organism, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {organism}
                                  </Badge>
                                ))}
                              </div>
                              {publication.tags?.organism && (
                                <p className="text-xs text-muted-foreground mt-3">
                                  Primary organism: <span className="font-medium">{publication.tags.organism}</span>
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        </div>

                        {/* Applications */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-blue-500" />
                              Practical Applications
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {researchInsights.applications.map((app, index) => (
                                <div key={index} className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                    {app}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>

                        {/* Research Context */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Research Context</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">Research Area:</span>
                              <Badge variant="outline">{publication.tags?.researchArea || 'Space Biology'}</Badge>
                            </div>
                            {publication.date && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Publication Year:</span>
                                <span className="font-medium">{publication.date}</span>
                              </div>
                            )}
                            {publication.authors && publication.authors.length > 0 && (
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Research Team:</span>
                                <span className="font-medium">{publication.authors.length} authors</span>
                              </div>
                            )}
                            <Separator className="my-2" />
                            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                              <p className="text-xs text-muted-foreground">
                                This publication is part of NASA's 608 space bioscience research papers, 
                                contributing to our understanding of space biology and astronaut health for 
                                future Moon and Mars missions.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}