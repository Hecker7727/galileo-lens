import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import HomePage from './components/HomePage';
import KnowledgeGraph from './components/KnowledgeGraph';
import GraphClusterView from './components/GraphClusterView';
import OverviewCharts from './components/OverviewCharts';
import ForecastView from './components/ForecastView';
import DetailPanel from './components/DetailPanel';
import InteractiveStory from './components/InteractiveStory';
import ChatInterface from './components/ChatInterface';
import GapAnalysisView from './components/GapAnalysisView';
import { SpaceBackground } from './components/SpaceBackground';
import { getGraphData, getClusters, getMetrics, getSampleStory } from './data/graphData';
import { Node, Edge, Cluster, MetricSeries, StoryDefinition } from './types/dataTypes';
import { Rocket, Home, Brain, BarChart3, Activity, TrendingDown } from 'lucide-react';
import LoadingSpinner from './components/LoadingSpinner';

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ nodes: Node[], edges: Edge[] }>({ nodes: [], edges: [] });
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [metrics, setMetrics] = useState<MetricSeries[]>([]);
  const [story, setStory] = useState<StoryDefinition | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [relatedNodes, setRelatedNodes] = useState<Node[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showRelated, setShowRelated] = useState(false);

  useEffect(() => {
    // Load initial data asynchronously
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [graphData, clusters] = await Promise.all([
          getGraphData(),
          getClusters()
        ]);
        setGraphData(graphData);
        setClusters(clusters);
        setMetrics(getMetrics());
        setStory(getSampleStory());
      } catch (error) {
        console.error('Failed to load data:', error);
        // Set empty data as fallback
        setGraphData({ nodes: [], edges: [] });
        setClusters([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = graphData.nodes.find(n => n.id === nodeId);
    setSelectedNode(node || null);
  };

  const handleClusterToggle = (clusterId: string, open: boolean) => {
    setClusters(prev => prev.map(cluster => 
      cluster.id === clusterId ? { ...cluster, expanded: open } : cluster
    ));
  };

  const handleAction = (action: string, itemId: string) => {
    const node = graphData.nodes.find(n => n.id === itemId);
    if (!node) return;

    switch (action) {
      case 'view_related':
        handleViewRelated(node);
        break;
      case 'analyze':
        handleAnalyze(node);
        break;
      case 'forecast':
        setActiveView('forecast');
        break;
      default:
        console.log('Unknown action:', action, itemId);
    }
  };

  const handleViewRelated = (node: Node) => {
    // Find all nodes connected to this node
    const connectedNodeIds = new Set<string>();
    
    graphData.edges.forEach(edge => {
      if (edge.source === node.id) connectedNodeIds.add(edge.target);
      if (edge.target === node.id) connectedNodeIds.add(edge.source);
    });

    const related = graphData.nodes.filter(n => connectedNodeIds.has(n.id));
    setRelatedNodes(related);
    setShowRelated(true);
    setShowAnalysis(false);
  };

  const handleAnalyze = (node: Node) => {
    // Generate analysis based on node type and properties
    let analysis = '';

    switch (node.type) {
      case 'publication':
        analysis = `📚 **Publication Analysis: ${node.label}**\n\n`;
        analysis += `**Research Overview:**\n`;
        analysis += `This publication is part of NASA's 608 bioscience research dataset, contributing to our understanding of space biology and health.\n\n`;
        
        if (node.properties?.abstract) {
          const abstract = String(node.properties.abstract);
          const wordCount = abstract.split(' ').length;
          analysis += `**Content Analysis:**\n`;
          analysis += `- Document length: ${wordCount} words\n`;
          analysis += `- Research scope: ${abstract.includes('mice') || abstract.includes('mouse') ? 'Animal model study' : 'General research'}\n`;
          analysis += `- Focus areas: ${abstract.includes('radiation') ? 'Radiation effects, ' : ''}${abstract.includes('microgravity') ? 'Microgravity effects, ' : ''}${abstract.includes('cell') ? 'Cellular biology' : 'Physiological systems'}\n\n`;
        }

        const publicationConnections = graphData.edges.filter(e => 
          e.source === node.id || e.target === node.id
        ).length;
        analysis += `**Network Position:**\n`;
        analysis += `- Connected to ${publicationConnections} other research elements\n`;
        analysis += `- Network centrality: ${publicationConnections > 10 ? 'High (Hub publication)' : publicationConnections > 5 ? 'Medium (Key reference)' : 'Low (Specialized topic)'}\n\n`;

        analysis += `**Research Impact:**\n`;
        analysis += `This work contributes to NASA's mission by providing insights into ${node.properties?.research_area || 'space biology'}, essential for long-duration space missions and astronaut health.`;
        break;

      case 'researcher':
        analysis = `👤 **Researcher Profile: ${node.label}**\n\n`;
        const researcherPubs = graphData.edges.filter(e => 
          (e.source === node.id || e.target === node.id) && 
          graphData.nodes.find(n => n.id === (e.source === node.id ? e.target : e.source))?.type === 'publication'
        ).length;
        
        analysis += `**Productivity Metrics:**\n`;
        analysis += `- Publications in dataset: ${researcherPubs}\n`;
        analysis += `- Total connections: ${graphData.edges.filter(e => e.source === node.id || e.target === node.id).length}\n`;
        analysis += `- Research activity: ${researcherPubs > 5 ? 'Highly Active' : researcherPubs > 2 ? 'Active' : 'Contributing'}\n\n`;

        analysis += `**Collaboration Network:**\n`;
        const collaborators = graphData.edges.filter(e => 
          (e.source === node.id || e.target === node.id) &&
          graphData.nodes.find(n => n.id === (e.source === node.id ? e.target : e.source))?.type === 'researcher'
        ).length;
        analysis += `- Direct collaborators: ${collaborators}\n`;
        analysis += `- Network reach: ${collaborators > 5 ? 'Extensive collaborative network' : 'Focused research team'}\n\n`;

        analysis += `**Expertise Areas:**\n`;
        analysis += `Based on publication connections, this researcher contributes to NASA's bioscience research in areas critical for space exploration and human health in space environments.`;
        break;

      case 'concept':
        analysis = `💡 **Concept Analysis: ${node.label}**\n\n`;
        const relatedPubs = graphData.edges.filter(e => 
          (e.source === node.id || e.target === node.id) &&
          graphData.nodes.find(n => n.id === (e.source === node.id ? e.target : e.source))?.type === 'publication'
        ).length;

        analysis += `**Concept Prevalence:**\n`;
        analysis += `- Appears in ${relatedPubs} publications\n`;
        analysis += `- Research prominence: ${relatedPubs > 10 ? 'Core concept (Central theme)' : relatedPubs > 5 ? 'Significant concept' : 'Emerging or specialized concept'}\n\n`;

        analysis += `**Interdisciplinary Connections:**\n`;
        const conceptConnections = graphData.edges.filter(e => e.source === node.id || e.target === node.id).length;
        analysis += `- Total research connections: ${conceptConnections}\n`;
        analysis += `- Knowledge integration: This concept bridges multiple research areas within the NASA bioscience dataset\n\n`;

        analysis += `**Research Applications:**\n`;
        analysis += `This concept is fundamental to understanding ${node.label.toLowerCase()} in the context of space exploration, contributing to mission planning and astronaut health protocols.`;
        break;

      case 'experiment':
        analysis = `🧪 **Experimental Method: ${node.label}**\n\n`;
        const experimentUses = graphData.edges.filter(e => 
          (e.source === node.id || e.target === node.id) &&
          graphData.nodes.find(n => n.id === (e.source === node.id ? e.target : e.source))?.type === 'publication'
        ).length;

        analysis += `**Method Adoption:**\n`;
        analysis += `- Used in ${experimentUses} research studies\n`;
        analysis += `- Methodological importance: ${experimentUses > 5 ? 'Standard technique' : 'Specialized approach'}\n\n`;

        analysis += `**Technical Applications:**\n`;
        analysis += `This experimental approach enables researchers to investigate space biology phenomena that are critical for understanding and mitigating health risks during space missions.\n\n`;

        analysis += `**Research Validation:**\n`;
        analysis += `Multiple studies utilizing this method demonstrate its reliability and relevance to NASA's research objectives in bioscience and space medicine.`;
        break;

      default:
        analysis = `**Analysis:** ${node.label}\n\nThis element is part of the NASA 608 bioscience research network.`;
    }

    setAnalysisResult(analysis);
    setShowAnalysis(true);
    setShowRelated(false);
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'home':
        return <HomePage onEnterPlatform={() => setActiveView('overview')} />;
      
      case 'overview':
        if (isLoading) {
          return <LoadingSpinner message="Loading NASA research database..." />;
        }
        
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <span>Mission Knowledge Graph</span>
                    <Badge variant="outline" className="ml-auto">
                      {graphData.nodes.length} Publications
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-96">
                  {graphData.nodes.length > 0 ? (
                    <KnowledgeGraph
                      nodes={graphData.nodes}
                      edges={graphData.edges}
                      onNodeSelect={handleNodeSelect}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No research data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <DetailPanel 
                item={selectedNode} 
                onAction={handleAction}
              />
              
              {/* Analysis Panel */}
              {showAnalysis && analysisResult && (
                <Card className="border-2 border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                        Analysis Results
                      </CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowAnalysis(false)}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-xs font-sans bg-white dark:bg-gray-800 p-4 rounded-lg border">
                        {analysisResult}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Related Nodes Panel */}
              {showRelated && relatedNodes.length > 0 && (
                <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-900/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Brain className="h-4 w-4 text-green-500" />
                        Related Research ({relatedNodes.length})
                      </CardTitle>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => setShowRelated(false)}
                      >
                        ✕
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {relatedNodes.map(relatedNode => (
                        <button
                          key={relatedNode.id}
                          onClick={() => handleNodeSelect(relatedNode.id)}
                          className="w-full text-left p-3 rounded-lg border hover:border-green-300 hover:bg-green-100 dark:hover:bg-green-900/20 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <Badge variant="secondary" className="text-xs">
                              {relatedNode.type}
                            </Badge>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {relatedNode.label}
                              </p>
                              {relatedNode.properties?.abstract ? (
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {String(relatedNode.properties.abstract).substring(0, 120)}...
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <GraphClusterView
                clusters={clusters}
                onClusterToggle={handleClusterToggle}
              />
            </div>
          </div>
        );
      
      case 'forecast':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  <span>NASA Health Risk Forecast</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ForecastView 
                  forecast={null}
                  onExport={() => console.log('Export forecast')}
                />
              </CardContent>
            </Card>
          </div>
        );
      
      case 'gaps':
        return (
          <div className="max-w-6xl mx-auto">
            <GapAnalysisView />
          </div>
        );
      
      case 'story':
        return (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5 text-purple-500" />
                  <span>NASA Mission Simulator</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {story && (
                  <InteractiveStory
                    story={story}
                    onChoice={(choiceId) => console.log('Choice selected:', choiceId)}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        );
      
      case 'chat':
        return (
          <div className="h-[calc(100vh-8rem)]">
            <ChatInterface />
          </div>
        );
      
      default:
        return null;
    }
  };

  // Clear any render error when view changes
  useEffect(() => {
    setRenderError(null);
  }, [activeView]);

  // Show home page without header for full-screen experience
  if (activeView === 'home') {
    return renderActiveView();
  }

  return (
    <div className="min-h-screen bg-background relative">
      <SpaceBackground variant="minimal" />
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b bg-gradient-to-r from-slate-900/90 via-blue-950/80 to-purple-950/90 text-white backdrop-blur-md"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-md bg-white/5">
                  <Rocket className="h-6 w-6 text-white/90" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold leading-tight" style={{ color: '#ffffff', fontWeight: 'bold' }}>Galileo's Lenses</h1>
                  <p className="text-xs" style={{ color: '#ffffff', opacity: 0.9 }}>Mission Health Analytics</p>
                </div>
              </div>

              <Badge variant="secondary" className="ml-1 bg-white/6 text-slate-200 border-white/10">
                v1.0
              </Badge>
            </div>

            <nav className="flex-1 flex items-center justify-center">
              <Tabs
                value={activeView}
                onValueChange={(val: string) => {
                  console.debug('Nav tab changed ->', val);
                  setActiveView(val);
                }}
                className="w-full max-w-3xl"
              >
                <TabsList className="flex items-center justify-between gap-2 p-1 bg-white/5 rounded-full shadow-sm">
                  <TabsTrigger value="overview" className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:shadow-md data-[state=active]:text-white">
                    <Brain className="h-4 w-4" />
                    <span className="hidden sm:inline">Overview</span>
                  </TabsTrigger>

                  <TabsTrigger value="gaps" className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:shadow-md data-[state=active]:text-white">
                    <TrendingDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Gaps</span>
                  </TabsTrigger>

                  <TabsTrigger value="forecast" className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:shadow-md data-[state=active]:text-white">
                    <Activity className="h-4 w-4" />
                    <span className="hidden sm:inline">Forecast</span>
                  </TabsTrigger>

                  <TabsTrigger value="story" className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-purple-700 data-[state=active]:shadow-md data-[state=active]:text-white">
                    <Rocket className="h-4 w-4" />
                    <span className="hidden sm:inline">Mission Sim</span>
                  </TabsTrigger>

                  <TabsTrigger value="chat" className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-green-500 data-[state=active]:shadow-md data-[state=active]:text-white">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">AI Assistant</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </nav>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('home')}
                className="text-white hover:bg-white/10"
              >
                <Home className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderError ? (
              <div className="max-w-4xl mx-auto">
                <Card className="border-2 border-red-200 bg-red-50/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">Rendering Error</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="whitespace-pre-wrap text-sm text-red-800">{String(renderError?.message)}</pre>
                    <div className="mt-3 text-sm text-muted-foreground">Check console for stack trace.</div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              (() => {
                try {
                  return renderActiveView();
                } catch (err: any) {
                  console.error('Error rendering active view:', err);
                  setRenderError(err instanceof Error ? err : new Error(String(err)));
                  return null;
                }
              })()
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
