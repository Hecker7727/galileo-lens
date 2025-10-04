// Spell correction utilities for Galileo Lenses
// Focuses on scientific terms and common typos in space medicine research

interface SpellCorrection {
  original: string;
  suggested: string;
  confidence: number;
}

// Dictionary of common scientific terms and their corrections
const scientificTerms: Record<string, string> = {
  // Biology terms
  'migrabiology': 'microbiology',
  'microbilogy': 'microbiology',
  'microbiologi': 'microbiology',
  'microbiolgy': 'microbiology',
  'microbio': 'microbiology',
  
  // Medical terms
  'cardiovasular': 'cardiovascular',
  'cardio-vascular': 'cardiovascular',
  'cardivascular': 'cardiovascular',
  'cardiovasculr': 'cardiovascular',
  
  'musculoskeltal': 'musculoskeletal',
  'musculo-skeletal': 'musculoskeletal',
  'musculoskeletal': 'musculoskeletal',
  'musculosketal': 'musculoskeletal',
  
  'neruoscience': 'neuroscience',
  'neuroscince': 'neuroscience',
  'neuroscienc': 'neuroscience',
  'neuro-science': 'neuroscience',
  
  'immunology': 'immunology',
  'imunology': 'immunology',
  'imunoogy': 'immunology',
  'immunolgy': 'immunology',
  
  // Space medicine terms
  'astornaut': 'astronaut',
  'astronat': 'astronaut',
  'astronaught': 'astronaut',
  'astronout': 'astronaut',
  
  'countermeasure': 'countermeasures',
  'counter-measure': 'countermeasures',
  'countermeasures': 'countermeasures',
  
  'spaceflight': 'spaceflight',
  'space-flight': 'spaceflight',
  'spaceflght': 'spaceflight',
  'spacefligth': 'spaceflight',
  
  'microgravity': 'microgravity',
  'micro-gravity': 'microgravity',
  'microgavity': 'microgravity',
  'microgrivity': 'microgravity',
  
  'radiaton': 'radiation',
  'radition': 'radiation',
  'radiaiton': 'radiation',
  'radation': 'radiation',
  
  // Research areas
  'genomics': 'genomics',
  'genmoics': 'genomics',
  'genomis': 'genomics',
  'genoimcs': 'genomics',
  
  'omics': 'omics',
  'omic': 'omics',
  'omix': 'omics',
  
  'cellular': 'cellular',
  'celular': 'cellular',
  'celluar': 'cellular',
  'celullar': 'cellular',
  
  // Common space terms
  'mars': 'Mars',
  'moon': 'Moon',
  'iss': 'ISS',
  'nasa': 'NASA',
  'mission': 'mission',
  'mision': 'mission',
  'missoin': 'mission',
  
  // General scientific terms
  'analysis': 'analysis',
  'analsis': 'analysis',
  'anaylsis': 'analysis',
  'analisis': 'analysis',
  
  'research': 'research',
  'reserach': 'research',
  'resarch': 'research',
  'researh': 'research',
  
  'experiment': 'experiment',
  'experment': 'experiment',
  'experimnt': 'experiment',
  'experient': 'experiment',
  
  'hypothesis': 'hypothesis',
  'hypothsis': 'hypothesis',
  'hypthesis': 'hypothesis',
  'hypothess': 'hypothesis',
};

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Find the best correction for a word
function findBestCorrection(word: string): SpellCorrection | null {
  const lowerWord = word.toLowerCase();
  
  // Direct match in dictionary
  if (scientificTerms[lowerWord]) {
    return {
      original: word,
      suggested: scientificTerms[lowerWord],
      confidence: 0.95
    };
  }
  
  // Find closest match using Levenshtein distance
  let bestMatch: string | null = null;
  let bestDistance = Infinity;
  const maxDistance = Math.floor(word.length * 0.4); // Allow up to 40% character difference
  
  for (const [incorrect, correct] of Object.entries(scientificTerms)) {
    const distance = levenshteinDistance(lowerWord, incorrect);
    if (distance < bestDistance && distance <= maxDistance) {
      bestDistance = distance;
      bestMatch = correct;
    }
  }
  
  if (bestMatch && bestDistance <= 2) {
    const confidence = Math.max(0.5, 1 - (bestDistance / word.length));
    return {
      original: word,
      suggested: bestMatch,
      confidence
    };
  }
  
  return null;
}

// Check and correct a full text input
export function checkSpelling(text: string): {
  correctedText: string;
  corrections: SpellCorrection[];
  hasSuggestions: boolean;
} {
  const words = text.split(/(\s+)/); // Split preserving whitespace
  const corrections: SpellCorrection[] = [];
  let correctedText = text;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/^\s+$/.test(word)) continue; // Skip whitespace
    
    // Extract just the word part (remove punctuation)
    const cleanWord = word.replace(/[^\w]/g, '');
    if (cleanWord.length < 3) continue; // Skip very short words
    
    const correction = findBestCorrection(cleanWord);
    if (correction && correction.confidence > 0.7) {
      corrections.push(correction);
      // Replace the word in the text while preserving case
      const regex = new RegExp(`\\b${cleanWord}\\b`, 'gi');
      correctedText = correctedText.replace(regex, correction.suggested);
    }
  }
  
  return {
    correctedText,
    corrections,
    hasSuggestions: corrections.length > 0
  };
}

// Get suggestions for partial words (autocomplete)
export function getSuggestions(partial: string, limit: number = 5): string[] {
  if (partial.length < 2) return [];
  
  const lowerPartial = partial.toLowerCase();
  const suggestions: Array<{ term: string; score: number }> = [];
  
  // Find terms that start with the partial
  for (const correct of Object.values(scientificTerms)) {
    if (correct.toLowerCase().startsWith(lowerPartial)) {
      suggestions.push({ term: correct, score: 1.0 });
    }
  }
  
  // Find terms that contain the partial
  for (const correct of Object.values(scientificTerms)) {
    const lowerCorrect = correct.toLowerCase();
    if (!lowerCorrect.startsWith(lowerPartial) && lowerCorrect.includes(lowerPartial)) {
      suggestions.push({ term: correct, score: 0.8 });
    }
  }
  
  // Sort by score and return unique terms
  const uniqueSuggestions = Array.from(new Set(suggestions.map(s => s.term)))
    .sort((a, b) => {
      const scoreA = suggestions.find(s => s.term === a)?.score || 0;
      const scoreB = suggestions.find(s => s.term === b)?.score || 0;
      return scoreB - scoreA;
    });
  
  return uniqueSuggestions.slice(0, limit);
}

// Research domain-specific suggestions
export const researchDomains = [
  'cardiovascular research',
  'musculoskeletal studies',
  'neuroscience analysis',
  'microbiology research',
  'immunology studies',
  'radiation exposure',
  'bone density research',
  'muscle atrophy',
  'exercise countermeasures',
  'nutritional requirements',
  'Mars mission health risks',
  'ISS experiments',
  'astronaut health monitoring',
  'spaceflight effects',
  'microgravity adaptation',
  'cellular biology research',
  'genomics analysis',
  'plant biology studies'
];

export function getResearchSuggestions(query: string, limit: number = 5): string[] {
  if (query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  return researchDomains
    .filter(domain => domain.toLowerCase().includes(lowerQuery))
    .slice(0, limit);
}