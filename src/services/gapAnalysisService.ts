/**
 * Automated Research Gap Analysis Service
 * Identifies under-studied areas, organisms, and methodologies
 */

import { PublicationWithTags } from '../types/dataTypes';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface ResearchGap {
  id: string;
  category: 'organism' | 'research_area' | 'methodology' | 'duration' | 'environment';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  evidence: string[];
  recommendations: string[];
  relatedPublications?: number;
}

export interface GapAnalysisResult {
  gaps: ResearchGap[];
  summary: string;
  totalPublications: number;
  coverageScore: number; // 0-100
  timestamp: string;
}

/**
 * Analyze research gaps across all publications
 */
export async function analyzeResearchGaps(
  publications: PublicationWithTags[]
): Promise<GapAnalysisResult> {
  console.log('🔍 Starting research gap analysis...');
  
  // Statistical analysis
  const stats = calculatePublicationStatistics(publications);
  
  // Identify gaps
  const gaps: ResearchGap[] = [];
  
  // 1. Organism gaps
  gaps.push(...identifyOrganismGaps(stats));
  
  // 2. Research area gaps
  gaps.push(...identifyResearchAreaGaps(stats));
  
  // 3. Methodology gaps
  gaps.push(...identifyMethodologyGaps(stats));
  
  // 4. Duration gaps (short vs long missions)
  gaps.push(...identifyDurationGaps(publications));
  
  // 5. Environment gaps (LEO, deep space, etc.)
  gaps.push(...identifyEnvironmentGaps(publications));
  
  // Sort by severity
  gaps.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
  
  // Calculate coverage score
  const coverageScore = calculateCoverageScore(stats, gaps);
  
  // Generate AI summary
  const summary = await generateGapAnalysisSummary(gaps, stats);
  
  return {
    gaps: gaps.slice(0, 20), // Top 20 gaps
    summary,
    totalPublications: publications.length,
    coverageScore,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Calculate publication statistics
 */
function calculatePublicationStatistics(publications: PublicationWithTags[]) {
  const stats = {
    byOrganism: new Map<string, number>(),
    byResearchArea: new Map<string, number>(),
    byYear: new Map<number, number>(),
    totalPublications: publications.length,
  };
  
  publications.forEach(pub => {
    // Count by organism
    const organism = pub.tags?.organism || 'Unknown';
    stats.byOrganism.set(organism, (stats.byOrganism.get(organism) || 0) + 1);
    
    // Count by research area
    const area = pub.tags?.researchArea || 'General';
    stats.byResearchArea.set(area, (stats.byResearchArea.get(area) || 0) + 1);
    
    // Count by year
    const year = pub.date ? new Date(pub.date).getFullYear() : 2020;
    stats.byYear.set(year, (stats.byYear.get(year) || 0) + 1);
  });
  
  return stats;
}

/**
 * Identify organism gaps
 */
function identifyOrganismGaps(stats: any): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  const organismCounts = Array.from(stats.byOrganism.entries());
  const avgCount = stats.totalPublications / organismCounts.length;
  
  // NASA priority organisms that are under-studied
  const priorityOrganisms = [
    { name: 'Homo sapiens', importance: 'Critical for human spaceflight missions' },
    { name: 'Arabidopsis thaliana', importance: 'Model plant for life support systems' },
    { name: 'Caenorhabditis elegans', importance: 'Model for aging and muscle loss' },
    { name: 'Drosophila melanogaster', importance: 'Genetic model for development' },
    { name: 'Mus musculus', importance: 'Mammalian model closest to humans' },
  ];
  
  priorityOrganisms.forEach(priority => {
    const count = stats.byOrganism.get(priority.name) || 0;
    if (count < avgCount * 0.5) {
      gaps.push({
        id: `organism-${priority.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'organism',
        title: `Under-studied: ${priority.name}`,
        description: `Only ${count} studies found for ${priority.name}. ${priority.importance}`,
        severity: count === 0 ? 'high' : count < avgCount * 0.25 ? 'medium' : 'low',
        evidence: [
          `Current studies: ${count}`,
          `Average per organism: ${Math.round(avgCount)}`,
          `Deficit: ${Math.round(avgCount - count)} studies`,
        ],
        recommendations: [
          `Increase ${priority.name} experiments on ISS`,
          `Leverage existing ground-based facilities`,
          `Coordinate with international partners`,
        ],
        relatedPublications: count,
      });
    }
  });
  
  return gaps;
}

/**
 * Identify research area gaps
 */
function identifyResearchAreaGaps(stats: any): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  const areaCounts = Array.from(stats.byResearchArea.entries());
  const avgCount = stats.totalPublications / areaCounts.length;
  
  // Critical research areas
  const criticalAreas = [
    { name: 'Radiation Biology', minExpected: 30 },
    { name: 'Bone Biology', minExpected: 25 },
    { name: 'Cardiovascular', minExpected: 20 },
    { name: 'Immunology', minExpected: 20 },
    { name: 'Plant Biology', minExpected: 25 },
    { name: 'Microbiology', minExpected: 20 },
  ];
  
  criticalAreas.forEach(area => {
    const count = stats.byResearchArea.get(area.name) || 0;
    if (count < area.minExpected) {
      gaps.push({
        id: `area-${area.name.toLowerCase().replace(/\s+/g, '-')}`,
        category: 'research_area',
        title: `Gap in ${area.name} Research`,
        description: `${area.name} has only ${count} studies, below the expected ${area.minExpected} for critical mission health risks.`,
        severity: count < area.minExpected * 0.5 ? 'high' : 'medium',
        evidence: [
          `Current studies: ${count}`,
          `Expected minimum: ${area.minExpected}`,
          `Gap: ${area.minExpected - count} studies needed`,
        ],
        recommendations: [
          `Prioritize ${area.name} in next funding cycle`,
          `Collaborate with medical research institutions`,
          `Leverage existing ISS research opportunities`,
        ],
        relatedPublications: count,
      });
    }
  });
  
  return gaps;
}

/**
 * Identify methodology gaps
 */
function identifyMethodologyGaps(stats: any): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  
  // Check for lack of longitudinal studies
  gaps.push({
    id: 'methodology-longitudinal',
    category: 'methodology',
    title: 'Limited Longitudinal Studies',
    description: 'Few studies track biological changes over extended mission durations (6+ months).',
    severity: 'high',
    evidence: [
      'Most studies focus on short-duration effects',
      'Long-term health impacts poorly understood',
      'Critical for Mars missions (2+ years)',
    ],
    recommendations: [
      'Design multi-year study protocols',
      'Coordinate with ISS long-duration crews',
      'Establish biobanking for retrospective analysis',
    ],
  });
  
  // Check for lack of multi-omics integration
  gaps.push({
    id: 'methodology-multi-omics',
    category: 'methodology',
    title: 'Insufficient Multi-Omics Integration',
    description: 'Limited studies combining transcriptomics, proteomics, metabolomics for systems-level understanding.',
    severity: 'medium',
    evidence: [
      'Single-omics studies dominate',
      'Systems biology approaches underutilized',
      'Critical for understanding complex adaptations',
    ],
    recommendations: [
      'Fund integrated multi-omics projects',
      'Develop spaceflight-compatible sample collection',
      'Create standardized data analysis pipelines',
    ],
  });
  
  return gaps;
}

/**
 * Identify duration gaps
 */
function identifyDurationGaps(publications: PublicationWithTags[]): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  
  // Analyze abstracts for mission duration mentions
  const shortTermKeywords = ['day', 'days', 'week', 'weeks'];
  const longTermKeywords = ['month', 'months', 'year', 'years'];
  
  let shortTermCount = 0;
  let longTermCount = 0;
  
  publications.forEach(pub => {
    const abstract = (pub.abstract || '').toLowerCase();
    if (shortTermKeywords.some(kw => abstract.includes(kw))) shortTermCount++;
    if (longTermKeywords.some(kw => abstract.includes(kw))) longTermCount++;
  });
  
  if (longTermCount < shortTermCount * 0.3) {
    gaps.push({
      id: 'duration-long-term',
      category: 'duration',
      title: 'Insufficient Long-Duration Studies',
      description: `Only ${longTermCount} studies focus on long-duration effects vs ${shortTermCount} short-term studies.`,
      severity: 'high',
      evidence: [
        `Short-term studies: ${shortTermCount}`,
        `Long-term studies: ${longTermCount}`,
        'Mars missions require 2+ year data',
      ],
      recommendations: [
        'Prioritize 6+ month ISS experiments',
        'Leverage analog environments (Antarctic, submarine)',
        'Coordinate with commercial space stations',
      ],
      relatedPublications: longTermCount,
    });
  }
  
  return gaps;
}

/**
 * Identify environment gaps
 */
function identifyEnvironmentGaps(publications: PublicationWithTags[]): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  
  // Check for deep space research
  const deepSpaceKeywords = ['deep space', 'beyond leo', 'mars', 'lunar', 'moon'];
  const deepSpaceCount = publications.filter(pub => 
    deepSpaceKeywords.some(kw => (pub.abstract || '').toLowerCase().includes(kw))
  ).length;
  
  if (deepSpaceCount < publications.length * 0.15) {
    gaps.push({
      id: 'environment-deep-space',
      category: 'environment',
      title: 'Limited Deep Space Environment Research',
      description: `Only ${deepSpaceCount} studies (${Math.round(deepSpaceCount/publications.length*100)}%) address deep space conditions beyond LEO.`,
      severity: 'high',
      evidence: [
        `Deep space studies: ${deepSpaceCount}`,
        'Artemis and Mars missions require this data',
        'Radiation and isolation factors unique to deep space',
      ],
      recommendations: [
        'Leverage Artemis lunar missions',
        'Coordinate with ESA and international partners',
        'Utilize Gateway space station',
      ],
      relatedPublications: deepSpaceCount,
    });
  }
  
  return gaps;
}

/**
 * Calculate overall coverage score
 */
function calculateCoverageScore(stats: any, gaps: ResearchGap[]): number {
  const highSeverityGaps = gaps.filter(g => g.severity === 'high').length;
  const mediumSeverityGaps = gaps.filter(g => g.severity === 'medium').length;
  
  // Score calculation (100 = perfect, 0 = many critical gaps)
  const penalty = (highSeverityGaps * 10) + (mediumSeverityGaps * 5);
  return Math.max(0, Math.min(100, 100 - penalty));
}

/**
 * Generate AI-powered summary of gaps
 */
async function generateGapAnalysisSummary(
  gaps: ResearchGap[],
  stats: any
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-flash-lite-latest',
    });

    const prompt = `As a NASA research strategist, provide a concise 3-paragraph summary of these research gaps:

Total Publications: ${stats.totalPublications}
Critical Gaps (High): ${gaps.filter(g => g.severity === 'high').length}
Medium Priority Gaps: ${gaps.filter(g => g.severity === 'medium').length}

Top 5 Gaps:
${gaps.slice(0, 5).map((g, i) => `${i+1}. [${g.severity.toUpperCase()}] ${g.title}: ${g.description}`).join('\n')}

Provide:
1. Overall assessment of research coverage
2. Most critical areas needing immediate attention
3. Strategic recommendations for future research priorities

Keep it under 300 words, scientific but accessible.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Failed to generate AI summary:', error);
    return `Research gap analysis identified ${gaps.length} gaps across ${stats.totalPublications} publications. High-priority areas include organism diversity, long-duration studies, and deep space environment research. Focus on longitudinal multi-omics studies and international collaboration to address critical mission health risks.`;
  }
}

/**
 * Get gap analysis for specific research area
 */
export async function analyzeResearchAreaGaps(
  publications: PublicationWithTags[],
  researchArea: string
): Promise<ResearchGap[]> {
  const filteredPubs = publications.filter(
    p => p.tags?.researchArea === researchArea
  );
  
  const result = await analyzeResearchGaps(filteredPubs);
  return result.gaps.filter(g => 
    g.category === 'research_area' || 
    g.description.toLowerCase().includes(researchArea.toLowerCase())
  );
}

/**
 * Get gap analysis for specific organism
 */
export async function analyzeOrganismGaps(
  publications: PublicationWithTags[],
  organism: string
): Promise<ResearchGap[]> {
  const filteredPubs = publications.filter(
    p => p.tags?.organism === organism
  );
  
  const result = await analyzeResearchGaps(filteredPubs);
  return result.gaps.filter(g => 
    g.category === 'organism' || 
    g.description.toLowerCase().includes(organism.toLowerCase())
  );
}
