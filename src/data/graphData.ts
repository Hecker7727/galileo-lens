import { Node, Edge, Cluster, MetricSeries, StoryDefinition } from '../types/dataTypes';
import { getPublications } from './processedPublications';

// Graph data using real NASA publications
export async function getGraphData(): Promise<{ nodes: Node[], edges: Edge[] }> {
  try {
    const publications = await getPublications();
    
    if (publications.length === 0) {
      // Return fallback data if no publications loaded
      return getFallbackGraphData();
    }
  
  // Convert publications to nodes (limit to first 20 for performance)
  const pubNodes: Node[] = publications.slice(0, 20).map(pub => ({
    id: pub.id,
    label: pub.title.length > 60 ? pub.title.slice(0, 60) + '...' : pub.title,
    type: 'publication',
    properties: {
      title: pub.title,
      abstract: pub.abstract,
      link: pub.link,
      organism: pub.tags.organism,
      researchArea: pub.tags.researchArea,
      source: pub.source
    },
    clusterId: pub.tags.researchArea.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }));

  // Create concept nodes for research areas
  const researchAreas = [...new Set(publications.map(pub => pub.tags.researchArea))];
  const conceptNodes: Node[] = researchAreas.map(area => ({
    id: `concept-${area.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
    label: area,
    type: 'concept',
    properties: {
      definition: `Research area focusing on ${area.toLowerCase()}`,
      relatedTerms: [area],
      publicationCount: publications.filter(pub => pub.tags.researchArea === area).length
    },
    clusterId: area.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  }));

  // Create organism nodes
  const organisms = [...new Set(publications.map(pub => pub.tags.organism))].filter(org => org !== 'N/A');
  const organismNodes: Node[] = organisms.map(organism => ({
    id: `organism-${organism.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`,
    label: organism,
    type: 'experiment',
    properties: {
      type: 'Model Organism',
      description: `Studies using ${organism}`,
      publicationCount: publications.filter(pub => pub.tags.organism === organism).length
    },
    clusterId: 'organisms'
  }));

  const nodes = [...pubNodes, ...conceptNodes, ...organismNodes];

  // Create edges between publications and concepts/organisms
  const edges: Edge[] = [];
  let edgeId = 1;

  // Connect publications to their research area concepts
  pubNodes.forEach(pubNode => {
    const researchArea = pubNode.properties.researchArea;
    const conceptId = `concept-${researchArea.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
    edges.push({
      id: `e${edgeId++}`,
      source: pubNode.id,
      target: conceptId,
      type: 'related'
    });
  });

  // Connect publications to organism nodes
  pubNodes.forEach(pubNode => {
    const organism = pubNode.properties.organism;
    if (organism !== 'N/A') {
      const organismId = `organism-${organism.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
      edges.push({
        id: `e${edgeId++}`,
        source: pubNode.id,
        target: organismId,
        type: 'methodology'
      });
    }
  });

  // Create some citation edges between publications in similar areas
  const groupedPubs = pubNodes.reduce((acc, node) => {
    const area = node.properties.researchArea;
    if (!acc[area]) acc[area] = [];
    acc[area].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  Object.values(groupedPubs).forEach(areaNodes => {
    if (areaNodes.length > 1) {
      // Connect the first two publications in each area
      for (let i = 0; i < Math.min(areaNodes.length - 1, 2); i++) {
        edges.push({
          id: `e${edgeId++}`,
          source: areaNodes[i].id,
          target: areaNodes[i + 1].id,
          type: 'citation',
          weight: 0.8
        });
      }
    }
  });

    return { nodes, edges };
  } catch (error) {
    console.error('Error loading graph data:', error);
    return getFallbackGraphData();
  }
}

function getFallbackGraphData(): { nodes: Node[], edges: Edge[] } {
  const fallbackNodes: Node[] = [
    {
      id: 'fallback-1',
      label: 'NASA Space Health Research',
      type: 'concept',
      properties: {
        description: 'Comprehensive research on astronaut health and safety',
        status: 'Loading real data...'
      },
      clusterId: 'health'
    },
    {
      id: 'fallback-2', 
      label: 'Microgravity Effects',
      type: 'concept',
      properties: {
        description: 'Studies on biological adaptations to weightlessness',
        status: 'Loading real data...'
      },
      clusterId: 'microgravity'
    },
    {
      id: 'fallback-3',
      label: 'Countermeasure Development',
      type: 'concept', 
      properties: {
        description: 'Research on protecting astronaut health',
        status: 'Loading real data...'
      },
      clusterId: 'countermeasures'
    }
  ];

  const fallbackEdges: Edge[] = [
    { id: 'fe1', source: 'fallback-1', target: 'fallback-2', type: 'related' },
    { id: 'fe2', source: 'fallback-1', target: 'fallback-3', type: 'related' }
  ];

  return { nodes: fallbackNodes, edges: fallbackEdges };
}

// Synchronous wrapper for backward compatibility
export function getGraphDataSync(): { nodes: Node[], edges: Edge[] } {
  // Return empty data initially - this will be populated by the async version
  return { nodes: [], edges: [] };
}

export async function getClusters(): Promise<Cluster[]> {
  try {
    const publications = await getPublications();
    
    if (publications.length === 0) {
      return getFallbackClusters();
    }
    
    const researchAreas = [...new Set(publications.map(pub => pub.tags.researchArea))];
    
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    
    const clusters: Cluster[] = researchAreas.map((area, index) => {
      const areaPubs = publications.filter(pub => pub.tags.researchArea === area);
      const nodeIds = areaPubs.slice(0, 10).map(pub => pub.id); // Limit nodes per cluster
      nodeIds.push(`concept-${area.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`);
      
      return {
        id: area.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
        name: area,
        nodes: nodeIds,
        color: colors[index % colors.length],
        expanded: index < 2, // Expand first two clusters by default
        summary: `${areaPubs.length} publications studying ${area.toLowerCase()} in space environments`
      };
    });

    // Add organisms cluster
    const organisms = [...new Set(publications.map(pub => pub.tags.organism))].filter(org => org !== 'N/A');
    if (organisms.length > 0) {
      clusters.push({
        id: 'organisms',
        name: 'Model Organisms',
        nodes: organisms.map(org => `organism-${org.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`),
        color: '#6366f1',
        expanded: false,
        summary: `Research using ${organisms.length} different model organisms`
      });
    }

    return clusters;
  } catch (error) {
    console.error('Error loading clusters:', error);
    return getFallbackClusters();
  }
}

function getFallbackClusters(): Cluster[] {
  return [
    {
      id: 'health',
      name: 'Space Health Research',
      nodes: ['fallback-1'],
      color: '#3b82f6',
      expanded: true,
      summary: 'Loading NASA health research data...'
    },
    {
      id: 'microgravity',
      name: 'Microgravity Studies', 
      nodes: ['fallback-2'],
      color: '#ef4444',
      expanded: true,
      summary: 'Loading microgravity research data...'
    },
    {
      id: 'countermeasures',
      name: 'Countermeasures',
      nodes: ['fallback-3'],
      color: '#10b981', 
      expanded: false,
      summary: 'Loading countermeasure research data...'
    }
  ];
}

// Synchronous wrapper for backward compatibility
export function getClustersSync(): Cluster[] {
  return [];
}

export function getMetrics(): MetricSeries[] {
  const baseDate = new Date('2023-01-01');
  return [
    {
      id: 'publications',
      name: 'Monthly Publications',
      color: '#3b82f6',
      data: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(baseDate.getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 20) + 10
      }))
    },
    {
      id: 'citations',
      name: 'Citation Impact',
      color: '#ef4444',
      data: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(baseDate.getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 100) + 50
      }))
    },
    {
      id: 'collaborations',
      name: 'Active Collaborations',
      color: '#10b981',
      data: Array.from({ length: 12 }, (_, i) => ({
        timestamp: new Date(baseDate.getTime() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
        value: Math.floor(Math.random() * 15) + 5
      }))
    }
  ];
}

export function getSampleStory(): StoryDefinition {
  return {
    id: 'mars-mission-sim',
    title: 'Mars Mission Health Simulator',
    description: 'Configure and simulate health risks for a Mars mission scenario',
    steps: [
      {
        id: 'intro',
        title: 'Mission Configuration',
        content: 'Welcome to the Mars Mission Health Simulator. Configure your mission parameters to assess potential health risks.',
        type: 'info',
        nextStep: 'parameters'
      },
      {
        id: 'parameters',
        title: 'Mission Parameters',
        content: 'Set up your mission parameters including duration, gravity conditions, and crew characteristics.',
        type: 'input',
        nextStep: 'simulation'
      },
      {
        id: 'simulation',
        title: 'Run Simulation',
        content: 'Execute the health risk simulation based on your configured parameters.',
        type: 'simulation',
        nextStep: 'results'
      },
      {
        id: 'results',
        title: 'Mission Results',
        content: 'Review the predicted health risks and recommended countermeasures for your mission scenario.',
        type: 'info'
      }
    ]
  };
}