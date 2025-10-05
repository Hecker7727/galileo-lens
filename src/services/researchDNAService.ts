// Research DNA Service - Create genetic fingerprints for publications
import { ask } from './geminiService';
import { Publication } from '../types/dataTypes';

export interface ResearchDNA {
  publicationId: string;
  publicationTitle: string;
  methodology: string[];      // Techniques used: [gene sequencing, proteomics, imaging]
  organism: string[];          // [mouse, human cells, plants]
  stressors: string[];         // [microgravity, radiation, isolation]
  outcomes: string[];          // [bone loss, immune response, growth]
  duration: string;            // short-term, medium-term, long-term
  complexity: number;          // 1-10 scale
  researchArea: string;
  fingerprint: string;         // Unique DNA signature
}

export interface DNACompatibility {
  publication1: ResearchDNA;
  publication2: ResearchDNA;
  compatibilityScore: number;  // 0-100
  sharedMethodology: string[];
  sharedOrganisms: string[];
  sharedStressors: string[];
  sharedOutcomes: string[];
  insights: string[];
}

// Extract DNA from publication using AI
export async function generateResearchDNA(publication: Publication): Promise<ResearchDNA> {
  try {
    const prompt = `Analyze this NASA research publication and extract its "research DNA":

Title: ${publication.title}
Abstract: ${publication.abstract || publication.summary || ''}
Research Area: ${publication.tags?.researchArea || 'Unknown'}
Organism: ${publication.tags?.organism || 'Unknown'}

Extract and structure the following as JSON:
{
  "methodology": ["list of experimental techniques/methods used"],
  "organism": ["organisms or biological systems studied"],
  "stressors": ["environmental stressors applied: microgravity, radiation, etc."],
  "outcomes": ["measured outcomes: bone loss, gene expression, etc."],
  "duration": "short-term (< 1 month) | medium-term (1-6 months) | long-term (> 6 months)",
  "complexity": 1-10 (experimental complexity score)
}

Be specific and extract real details from the abstract. If information is not available, use empty arrays.`;

    const response = await ask(prompt, { temperature: 0.3, maxTokens: 800 });
    
    // Parse the AI response
    let dnaData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        dnaData = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback parsing
        dnaData = parseResponseManually(response.text, publication);
      }
    } catch (error) {
      console.warn('Failed to parse AI response, using fallback:', error);
      dnaData = createFallbackDNA(publication);
    }

    // Generate unique fingerprint
    const fingerprint = generateFingerprint(dnaData);

    const researchDNA: ResearchDNA = {
      publicationId: publication.id,
      publicationTitle: publication.title,
      methodology: Array.isArray(dnaData.methodology) ? dnaData.methodology : [],
      organism: Array.isArray(dnaData.organism) ? dnaData.organism : [publication.tags?.organism || 'Unknown'],
      stressors: Array.isArray(dnaData.stressors) ? dnaData.stressors : [],
      outcomes: Array.isArray(dnaData.outcomes) ? dnaData.outcomes : [],
      duration: dnaData.duration || 'medium-term',
      complexity: Number(dnaData.complexity) || 5,
      researchArea: publication.tags?.researchArea || 'General',
      fingerprint
    };

    return researchDNA;
  } catch (error) {
    console.error('Error generating research DNA:', error);
    return createFallbackDNA(publication);
  }
}

// Create fallback DNA when AI fails
function createFallbackDNA(publication: Publication): ResearchDNA {
  const abstract = (publication.abstract || publication.summary || '').toLowerCase();
  
  // Extract info from abstract using keywords
  const methodology: string[] = [];
  if (abstract.includes('rna') || abstract.includes('gene')) methodology.push('Gene Expression Analysis');
  if (abstract.includes('imaging') || abstract.includes('microscopy')) methodology.push('Microscopy');
  if (abstract.includes('sequencing')) methodology.push('Sequencing');
  if (abstract.includes('proteomics') || abstract.includes('protein')) methodology.push('Proteomics');
  if (methodology.length === 0) methodology.push('Observational Study');

  const stressors: string[] = [];
  if (abstract.includes('microgravity') || abstract.includes('weightless')) stressors.push('Microgravity');
  if (abstract.includes('radiation')) stressors.push('Radiation');
  if (abstract.includes('isolation') || abstract.includes('confined')) stressors.push('Isolation');
  if (abstract.includes('stress')) stressors.push('Environmental Stress');

  const outcomes: string[] = [];
  if (abstract.includes('bone') || abstract.includes('skeletal')) outcomes.push('Bone Density Changes');
  if (abstract.includes('muscle')) outcomes.push('Muscle Mass Changes');
  if (abstract.includes('immune')) outcomes.push('Immune Response');
  if (abstract.includes('cardiovascular') || abstract.includes('heart')) outcomes.push('Cardiovascular Changes');
  if (abstract.includes('gene expression')) outcomes.push('Gene Expression Changes');

  const fingerprint = generateFingerprint({
    methodology,
    organism: [publication.tags?.organism || 'Unknown'],
    stressors,
    outcomes
  });

  return {
    publicationId: publication.id,
    publicationTitle: publication.title,
    methodology,
    organism: [publication.tags?.organism || 'Unknown'],
    stressors,
    outcomes,
    duration: 'medium-term',
    complexity: 5,
    researchArea: publication.tags?.researchArea || 'General',
    fingerprint
  };
}

// Parse AI response manually as fallback
function parseResponseManually(text: string, publication: Publication): any {
  const data: any = {
    methodology: [],
    organism: [],
    stressors: [],
    outcomes: [],
    duration: 'medium-term',
    complexity: 5
  };

  // Try to extract lists from the text
  const methodologyMatch = text.match(/methodology[:\s]*\[(.*?)\]/i);
  if (methodologyMatch) {
    data.methodology = methodologyMatch[1].split(',').map(s => s.trim().replace(/["']/g, ''));
  }

  const organismMatch = text.match(/organism[:\s]*\[(.*?)\]/i);
  if (organismMatch) {
    data.organism = organismMatch[1].split(',').map(s => s.trim().replace(/["']/g, ''));
  }

  const stressorsMatch = text.match(/stressors[:\s]*\[(.*?)\]/i);
  if (stressorsMatch) {
    data.stressors = stressorsMatch[1].split(',').map(s => s.trim().replace(/["']/g, ''));
  }

  const outcomesMatch = text.match(/outcomes[:\s]*\[(.*?)\]/i);
  if (outcomesMatch) {
    data.outcomes = outcomesMatch[1].split(',').map(s => s.trim().replace(/["']/g, ''));
  }

  return data;
}

// Generate unique fingerprint from DNA components
function generateFingerprint(dnaData: any): string {
  const components = [
    ...(dnaData.methodology || []),
    ...(dnaData.organism || []),
    ...(dnaData.stressors || []),
    ...(dnaData.outcomes || [])
  ];
  
  // Create a simple hash-like fingerprint
  const combined = components.join('|').toLowerCase();
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to hex and format like DNA bases
  const bases = ['A', 'T', 'G', 'C'];
  let fingerprint = '';
  for (let i = 0; i < 16; i++) {
    fingerprint += bases[Math.abs(hash >> (i * 2)) % 4];
  }
  
  return fingerprint;
}

// Calculate compatibility between two research DNAs
export function calculateDNACompatibility(dna1: ResearchDNA, dna2: ResearchDNA): DNACompatibility {
  // Find shared elements
  const sharedMethodology = dna1.methodology.filter(m => 
    dna2.methodology.some(m2 => m.toLowerCase().includes(m2.toLowerCase()) || m2.toLowerCase().includes(m.toLowerCase()))
  );
  
  const sharedOrganisms = dna1.organism.filter(o => 
    dna2.organism.some(o2 => o.toLowerCase() === o2.toLowerCase())
  );
  
  const sharedStressors = dna1.stressors.filter(s => 
    dna2.stressors.some(s2 => s.toLowerCase().includes(s2.toLowerCase()) || s2.toLowerCase().includes(s.toLowerCase()))
  );
  
  const sharedOutcomes = dna1.outcomes.filter(o => 
    dna2.outcomes.some(o2 => o.toLowerCase().includes(o2.toLowerCase()) || o2.toLowerCase().includes(o.toLowerCase()))
  );

  // Calculate compatibility score (0-100)
  let score = 0;
  
  // Methodology overlap (30 points max)
  const methodologyScore = Math.min(
    (sharedMethodology.length / Math.max(dna1.methodology.length, dna2.methodology.length, 1)) * 30,
    30
  );
  score += methodologyScore;
  
  // Organism similarity (25 points max)
  const organismScore = Math.min(
    (sharedOrganisms.length / Math.max(dna1.organism.length, dna2.organism.length, 1)) * 25,
    25
  );
  score += organismScore;
  
  // Stressor overlap (25 points max)
  const stressorScore = Math.min(
    (sharedStressors.length / Math.max(dna1.stressors.length, dna2.stressors.length, 1)) * 25,
    25
  );
  score += stressorScore;
  
  // Outcome similarity (20 points max)
  const outcomeScore = Math.min(
    (sharedOutcomes.length / Math.max(dna1.outcomes.length, dna2.outcomes.length, 1)) * 20,
    20
  );
  score += outcomeScore;

  // Generate insights
  const insights: string[] = [];
  
  if (score >= 80) {
    insights.push('🧬 Highly Compatible - These studies share very similar research DNA');
    insights.push('Perfect for cross-validation and meta-analysis');
  } else if (score >= 60) {
    insights.push('✅ Good Compatibility - Significant overlap in research approach');
    insights.push('Studies complement each other well');
  } else if (score >= 40) {
    insights.push('🔄 Moderate Compatibility - Some shared elements');
    insights.push('Could provide different perspectives on similar topics');
  } else if (score >= 20) {
    insights.push('🌟 Low Compatibility - Different research directions');
    insights.push('May offer unique insights when compared');
  } else {
    insights.push('🔬 Minimal Compatibility - Very different research DNA');
    insights.push('Represents distinct areas of space biology');
  }

  if (sharedMethodology.length > 0) {
    insights.push(`🔬 Shared Methods: ${sharedMethodology.join(', ')}`);
  }
  
  if (sharedStressors.length > 0) {
    insights.push(`⚡ Common Stressors: ${sharedStressors.join(', ')}`);
  }

  if (sharedOrganisms.length > 0) {
    insights.push(`🧫 Same Model Systems: ${sharedOrganisms.join(', ')}`);
  }

  if (sharedOutcomes.length > 0) {
    insights.push(`📊 Similar Outcomes: ${sharedOutcomes.join(', ')}`);
  }

  // Duration compatibility
  if (dna1.duration === dna2.duration) {
    insights.push(`⏱️ Matching study durations (${dna1.duration})`);
  }

  // Research area compatibility
  if (dna1.researchArea === dna2.researchArea) {
    insights.push(`🎯 Same research area: ${dna1.researchArea}`);
  }

  return {
    publication1: dna1,
    publication2: dna2,
    compatibilityScore: Math.round(score),
    sharedMethodology,
    sharedOrganisms,
    sharedStressors,
    sharedOutcomes,
    insights
  };
}

// Find most compatible publications for a given DNA
export function findCompatibleResearch(
  targetDNA: ResearchDNA,
  allDNAs: ResearchDNA[],
  limit: number = 10
): DNACompatibility[] {
  const compatibilities = allDNAs
    .filter(dna => dna.publicationId !== targetDNA.publicationId) // Exclude self
    .map(dna => calculateDNACompatibility(targetDNA, dna))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);

  return compatibilities;
}

// Get DNA compatibility color
export function getCompatibilityColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  if (score >= 20) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

// Get DNA compatibility label
export function getCompatibilityLabel(score: number): string {
  if (score >= 80) return 'Highly Compatible';
  if (score >= 60) return 'Good Match';
  if (score >= 40) return 'Moderate Match';
  if (score >= 20) return 'Partial Match';
  return 'Low Match';
}

// Cache for generated DNAs
const dnaCache = new Map<string, ResearchDNA>();

export function getCachedDNA(publicationId: string): ResearchDNA | null {
  return dnaCache.get(publicationId) || null;
}

export function cacheDNA(dna: ResearchDNA): void {
  dnaCache.set(dna.publicationId, dna);
}

export function clearDNACache(): void {
  dnaCache.clear();
}