import React, { useState, useMemo } from 'react';
import { Node, Edge } from '../types/dataTypes';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  ZoomIn, ZoomOut, Maximize2, Search, Filter, 
  BookOpen, Users, Lightbulb, FlaskConical, 
  Network, TrendingUp, Info, X, ChevronRight
} from 'lucide-react';

interface KnowledgeGraphProps {
  nodes: Node[];
  edges: Edge[];
  onNodeSelect?: (nodeId: string) => void;
}

export default function KnowledgeGraph({ nodes, edges, onNodeSelect }: KnowledgeGraphProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);
  const [showStats, setShowStats] = useState(true);

  // Calculate viewBox based on zoom
  const viewBoxWidth = 1200 / zoom;
  const viewBoxHeight = 800 / zoom;
  const viewBoxX = (1200 - viewBoxWidth) / 2 + panOffset.x;
  const viewBoxY = (800 - viewBoxHeight) / 2 + panOffset.y;

  // Helper functions
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'publication': return '#3b82f6';
      case 'researcher': return '#10b981';
      case 'concept': return '#f59e0b';
      case 'experiment': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'publication': return '📄';
      case 'researcher': return '👤';
      case 'concept': return '💡';
      case 'experiment': return '🧪';
      default: return '📌';
    }
  };

  const getNodeTypeLabel = (type: string) => {
    switch (type) {
      case 'publication': return 'Publication';
      case 'researcher': return 'Researcher';
      case 'concept': return 'Concept';
      case 'experiment': return 'Experiment';
      default: return 'Unknown';
    }
  };

  // Filter and search logic
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const matchesType = filterType === 'all' || node.type === filterType;
      const matchesSearch = searchTerm === '' || 
        node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.properties?.description && 
         String(node.properties.description).toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesType && matchesSearch;
    });
  }, [nodes, filterType, searchTerm]);

  const filteredEdges = useMemo(() => {
    return edges.filter(edge => 
      filteredNodes.some(n => n.id === edge.source) && 
      filteredNodes.some(n => n.id === edge.target)
    );
  }, [edges, filteredNodes]);

  // Get connected nodes for a given node
  const getConnectedNodes = (nodeId: string) => {
    const connected = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === nodeId) connected.add(edge.target);
      if (edge.target === nodeId) connected.add(edge.source);
    });
    return connected;
  };

  const connectedNodes = selectedNodeId ? getConnectedNodes(selectedNodeId) : new Set();
  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Calculate statistics
  const stats = useMemo(() => {
    const typeCount = {
      publication: nodes.filter(n => n.type === 'publication').length,
      researcher: nodes.filter(n => n.type === 'researcher').length,
      concept: nodes.filter(n => n.type === 'concept').length,
      experiment: nodes.filter(n => n.type === 'experiment').length,
    };

    const connectionCounts = nodes.map(node => getConnectedNodes(node.id).size);
    const avgConnections = connectionCounts.length > 0 
      ? (connectionCounts.reduce((a, b) => a + b, 0) / connectionCounts.length).toFixed(1)
      : 0;
    const maxConnections = Math.max(...connectionCounts, 0);
    const mostConnectedNode = nodes.find(n => getConnectedNodes(n.id).size === maxConnections);

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      typeCount,
      avgConnections,
      maxConnections,
      mostConnectedNode,
      filteredCount: filteredNodes.length,
      filteredEdges: filteredEdges.length,
    };
  }, [nodes, edges, filteredNodes, filteredEdges]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    onNodeSelect?.(nodeId);
  };

  const handleReset = () => {
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    setFilterType('all');
    setSearchTerm('');
    setSelectedNodeId(null);
  };

  if (nodes.length === 0) {
    return (
      <Card className="border-2 border-blue-200">
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-6xl mb-4">🔬</div>
            <h3 className="text-2xl font-bold text-foreground">NASA Bioscience Knowledge Graph</h3>
            <p className="text-muted-foreground max-w-md">
              Explore the interconnected world of NASA's 608 bioscience research publications. 
              Visualize relationships between publications, researchers, concepts, and experiments.
            </p>
            <Badge variant="secondary" className="mt-2">Loading Data...</Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Control Panel */}
      <Card className="border-2 border-blue-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Network className="h-5 w-5 text-blue-500" />
            Knowledge Graph Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[250px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search publications, researchers, concepts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className="gap-1"
              >
                All <Badge variant="secondary" className="ml-1">{nodes.length}</Badge>
              </Button>
              <Button
                size="sm"
                variant={filterType === 'publication' ? 'default' : 'outline'}
                onClick={() => setFilterType('publication')}
                className="gap-1"
              >
                <BookOpen className="h-3 w-3" />
                <Badge variant="secondary">{stats.typeCount.publication}</Badge>
              </Button>
              <Button
                size="sm"
                variant={filterType === 'researcher' ? 'default' : 'outline'}
                onClick={() => setFilterType('researcher')}
                className="gap-1"
              >
                <Users className="h-3 w-3" />
                <Badge variant="secondary">{stats.typeCount.researcher}</Badge>
              </Button>
              <Button
                size="sm"
                variant={filterType === 'concept' ? 'default' : 'outline'}
                onClick={() => setFilterType('concept')}
                className="gap-1"
              >
                <Lightbulb className="h-3 w-3" />
                <Badge variant="secondary">{stats.typeCount.concept}</Badge>
              </Button>
              <Button
                size="sm"
                variant={filterType === 'experiment' ? 'default' : 'outline'}
                onClick={() => setFilterType('experiment')}
                className="gap-1"
              >
                <FlaskConical className="h-3 w-3" />
                <Badge variant="secondary">{stats.typeCount.experiment}</Badge>
              </Button>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button size="sm" variant="outline" onClick={() => setZoom(Math.min(zoom + 0.2, 3))}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleReset}>
                <Maximize2 className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Filter className="h-3 w-3" />
                {stats.filteredCount} of {stats.totalNodes} nodes
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Network className="h-3 w-3" />
                {stats.filteredEdges} connections
              </Badge>
            </div>
          </div>

          {/* Info Bar */}
          {selectedNode && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
              <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Selected: {selectedNode.label}
              </span>
              <Badge variant="secondary" className="ml-auto">
                {getConnectedNodes(selectedNode.id).size} connections
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedNodeId(null)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Graph View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graph Canvas */}
        <Card className="lg:col-span-2 border-2 border-purple-200 shadow-lg">
          <CardContent className="p-0">
            <div 
              className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-lg overflow-hidden"
              style={{ height: '700px' }}
            >
              <svg 
                width="100%" 
                height="100%" 
                viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                preserveAspectRatio="xMidYMid meet"
                style={{ 
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Render edges */}
                {filteredEdges.map(edge => {
                  const sourceNode = filteredNodes.find(n => n.id === edge.source);
                  const targetNode = filteredNodes.find(n => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  
                  const sourceIndex = filteredNodes.indexOf(sourceNode);
                  const targetIndex = filteredNodes.indexOf(targetNode);
                  
                  const cols = Math.ceil(Math.sqrt(filteredNodes.length));
                  const x1 = 100 + (sourceIndex % cols) * 180;
                  const y1 = 100 + Math.floor(sourceIndex / cols) * 140;
                  const x2 = 100 + (targetIndex % cols) * 180;
                  const y2 = 100 + Math.floor(targetIndex / cols) * 140;

                  const isHighlighted = selectedNodeId && 
                    (edge.source === selectedNodeId || edge.target === selectedNodeId);

                  return (
                    <line
                      key={edge.id}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isHighlighted ? getNodeColor(sourceNode.type) : 'currentColor'}
                      strokeWidth={isHighlighted ? 2.5 : 1}
                      opacity={isHighlighted ? 0.7 : 0.25}
                      className="text-muted-foreground transition-all duration-300"
                      strokeDasharray={isHighlighted ? '0' : '4 2'}
                    />
                  );
                })}

                {/* Render nodes */}
                {filteredNodes.map((node, index) => {
                  const cols = Math.ceil(Math.sqrt(filteredNodes.length));
                  const x = 100 + (index % cols) * 180;
                  const y = 100 + Math.floor(index / cols) * 140;
                  const isSelected = selectedNodeId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isConnected = selectedNodeId && connectedNodes.has(node.id);
                  const shouldHighlight = !selectedNodeId || isSelected || isConnected;
                  const connectionCount = getConnectedNodes(node.id).size;

                  return (
                    <g key={node.id} className="transition-all duration-300">
                      {/* Glow effect for selected/hovered */}
                      {(isSelected || isHovered) && (
                        <circle
                          cx={x}
                          cy={y}
                          r={40}
                          fill={getNodeColor(node.type)}
                          opacity="0.15"
                          className="animate-pulse"
                        />
                      )}

                      {/* Connection indicator ring */}
                      {connectionCount > 0 && (
                        <circle
                          cx={x}
                          cy={y}
                          r={26 + Math.min(connectionCount * 2, 10)}
                          fill="none"
                          stroke={getNodeColor(node.type)}
                          strokeWidth="1"
                          opacity={shouldHighlight ? 0.3 : 0.1}
                          className="transition-all duration-300"
                        />
                      )}

                      {/* Node circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? 30 : isHovered ? 27 : 24}
                        fill={getNodeColor(node.type)}
                        stroke="white"
                        strokeWidth={isSelected ? 4 : 3}
                        className="cursor-pointer transition-all duration-300 hover:stroke-4"
                        style={{ 
                          opacity: shouldHighlight ? 1 : 0.35,
                          filter: isSelected 
                            ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.3))' 
                            : isHovered 
                            ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                            : 'none'
                        }}
                        onClick={() => handleNodeClick(node.id)}
                        onMouseEnter={() => setHoveredNodeId(node.id)}
                        onMouseLeave={() => setHoveredNodeId(null)}
                      />

                      {/* Node icon */}
                      <text
                        x={x}
                        y={y + 7}
                        textAnchor="middle"
                        fontSize={isSelected ? "22" : isHovered ? "18" : "16"}
                        className="pointer-events-none select-none transition-all duration-300"
                      >
                        {getNodeIcon(node.type)}
                      </text>

                      {/* Node label */}
                      <text
                        x={x}
                        y={y + 50}
                        textAnchor="middle"
                        fontSize={isSelected ? "13" : "11"}
                        fontWeight={isSelected ? "600" : "500"}
                        fill="currentColor"
                        className="text-foreground pointer-events-none select-none transition-all duration-300"
                        style={{ opacity: shouldHighlight ? 0.95 : 0.5 }}
                      >
                        {node.label.length > 22 ? node.label.substring(0, 19) + '...' : node.label}
                      </text>

                      {/* Connection count badge */}
                      {(isSelected || isHovered) && connectionCount > 0 && (
                        <g>
                          <circle
                            cx={x + 22}
                            cy={y - 22}
                            r="14"
                            fill="white"
                            stroke={getNodeColor(node.type)}
                            strokeWidth="2.5"
                            className="drop-shadow-lg"
                          />
                          <text
                            x={x + 22}
                            y={y - 17}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="bold"
                            fill={getNodeColor(node.type)}
                            className="pointer-events-none select-none"
                          >
                            {connectionCount}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              {showLegend && (
                <div className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Node Types
                    </h4>
                    <button
                      onClick={() => setShowLegend(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {['publication', 'researcher', 'concept', 'experiment'].map(type => (
                      <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-white"
                          style={{ backgroundColor: getNodeColor(type) }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {getNodeIcon(type)} {getNodeTypeLabel(type)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Help tip */}
              {!showLegend && (
                <button
                  onClick={() => setShowLegend(true)}
                  className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                >
                  <Info className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <div className="space-y-4">
          {/* Statistics Card */}
          {showStats && (
            <Card className="border-2 border-green-200 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Graph Statistics
                  </CardTitle>
                  <button
                    onClick={() => setShowStats(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalNodes}</div>
                    <div className="text-xs text-muted-foreground">Total Nodes</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.totalEdges}</div>
                    <div className="text-xs text-muted-foreground">Connections</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                    <span className="text-xs flex items-center gap-1.5">
                      <BookOpen className="h-3 w-3" />
                      Publications
                    </span>
                    <Badge variant="secondary">{stats.typeCount.publication}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-900/20">
                    <span className="text-xs flex items-center gap-1.5">
                      <Users className="h-3 w-3" />
                      Researchers
                    </span>
                    <Badge variant="secondary">{stats.typeCount.researcher}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-amber-50 dark:bg-amber-900/20">
                    <span className="text-xs flex items-center gap-1.5">
                      <Lightbulb className="h-3 w-3" />
                      Concepts
                    </span>
                    <Badge variant="secondary">{stats.typeCount.concept}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-purple-50 dark:bg-purple-900/20">
                    <span className="text-xs flex items-center gap-1.5">
                      <FlaskConical className="h-3 w-3" />
                      Experiments
                    </span>
                    <Badge variant="secondary">{stats.typeCount.experiment}</Badge>
                  </div>
                </div>

                <div className="pt-3 border-t space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Avg Connections</span>
                    <span className="text-sm font-semibold">{stats.avgConnections}</span>
                  </div>
                  {stats.mostConnectedNode && (
                    <div className="text-xs">
                      <div className="text-muted-foreground mb-1">Most Connected:</div>
                      <button
                        onClick={() => handleNodeClick(stats.mostConnectedNode!.id)}
                        className="w-full text-left p-2 rounded bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/30 dark:hover:to-purple-900/30 transition-colors flex items-center justify-between group"
                      >
                        <span className="font-medium truncate">
                          {getNodeIcon(stats.mostConnectedNode.type)} {stats.mostConnectedNode.label}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
                      </button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {!showStats && (
            <button
              onClick={() => setShowStats(true)}
              className="w-full p-3 bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Show Statistics
            </button>
          )}

          {/* Node Details Card */}
          <Card className="border-2 border-amber-200 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {selectedNode ? 'Node Details' : 'Select a Node'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedNode ? (
                <div className="space-y-4">
                  {/* Node header */}
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 shadow-md"
                      style={{ backgroundColor: getNodeColor(selectedNode.type) + '30' }}
                    >
                      {getNodeIcon(selectedNode.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight mb-1 break-words">
                        {selectedNode.label}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {getNodeTypeLabel(selectedNode.type)}
                      </Badge>
                    </div>
                  </div>

                  {/* Properties */}
                  {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Properties
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {Object.entries(selectedNode.properties).map(([key, value]) => (
                          <div key={key} className="p-2 rounded bg-gray-50 dark:bg-gray-800">
                            <div className="text-xs font-medium text-muted-foreground mb-0.5">
                              {key}:
                            </div>
                            <div className="text-xs text-foreground break-words">
                              {String(value)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Connections */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center justify-between">
                      <span>Connected Nodes</span>
                      <Badge variant="outline">{getConnectedNodes(selectedNode.id).size}</Badge>
                    </h4>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {Array.from(getConnectedNodes(selectedNode.id)).map(connectedId => {
                        const connectedNode = nodes.find(n => n.id === connectedId);
                        if (!connectedNode) return null;
                        return (
                          <button
                            key={connectedId}
                            onClick={() => handleNodeClick(connectedId)}
                            className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted transition-colors group text-left"
                          >
                            <span className="text-lg flex-shrink-0">{getNodeIcon(connectedNode.type)}</span>
                            <span className="text-xs flex-1 truncate group-hover:text-foreground">
                              {connectedNode.label}
                            </span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {connectedNode.type}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedNodeId(null)}
                  >
                    Clear Selection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="text-4xl opacity-50">🔍</div>
                  <p className="text-sm text-muted-foreground">
                    Click on any node in the graph to explore its details and connections.
                  </p>
                  <div className="pt-2 text-xs text-muted-foreground space-y-1">
                    <p>💡 <strong>Tip:</strong> Use filters to focus on specific types</p>
                    <p>🔎 <strong>Tip:</strong> Search to find specific content</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Educational Footer */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-indigo-900 dark:text-indigo-100">
                About This Knowledge Graph
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This interactive visualization represents NASA's 608 bioscience research publications and their 
                interconnections. Each node represents a publication, researcher, scientific concept, or experiment. 
                The connections (edges) show relationships like authorship, citations, shared concepts, and experimental links.
                Use this tool to discover research patterns, find related work, and understand the structure of NASA's bioscience research ecosystem.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="text-[10px]">📊 Interactive Exploration</Badge>
                <Badge variant="outline" className="text-[10px]">🔍 Advanced Search</Badge>
                <Badge variant="outline" className="text-[10px]">📚 Educational Resource</Badge>
                <Badge variant="outline" className="text-[10px]">🎓 Research Tool</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
