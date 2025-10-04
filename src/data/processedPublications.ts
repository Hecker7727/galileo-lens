import { Publication, PublicationWithTags } from '../types/dataTypes';

// Import the real NASA papers data
import { nasaPapersData } from './nasaPapersData';

let cachedPublications: PublicationWithTags[] | null = null;

function getTags(publication: Publication): { organism: string; researchArea: string } {
    const text = (publication.title + ' ' + (publication.abstract || '')).toLowerCase();

    // Organism tagging
    const organismsFound: string[] = [];
    if (/\b(mouse|mice|murine)\b/.test(text)) organismsFound.push('Mice');
    if (/\b(rat|rats)\b/.test(text)) organismsFound.push('Rats');
    if (/\b(human|astronaut|men|women|patient|crew|civilian)\b/.test(text)) organismsFound.push('Human');
    if (/\b(drosophila|fruit fl(?:y|ies))\b/.test(text)) organismsFound.push('Drosophila');
    if (/\b(c\. elegans|nematode)\b/.test(text)) organismsFound.push('C. elegans');
    if (/\b(plant|arabidopsis|seedling|root|leaf|lettuce|wheat|crop|brachypodium|wolffia|mizuna|maize|populus|zinni|cauliflower|fern|flax)\b/.test(text)) organismsFound.push('Plants');
    if (/\b(microb|bacteri|fung|yeast|e\. coli|salmonella|pseudomonas|spore|alga|tardigrade|pathogen|cell culture|vessel|bioreactor|organoid|archaea)\b/.test(text)) organismsFound.push('Microbes');
    
    let organism: string;
    const uniqueOrganisms = [...new Set(organismsFound)];
    if (uniqueOrganisms.length > 1) {
        organism = 'Various/Mixed';
    } else if (uniqueOrganisms.length === 1) {
        organism = uniqueOrganisms[0];
    } else {
        organism = 'N/A';
    }
    
    // Research Area tagging
    let researchArea = 'General';
    if (/\b(bone|skeletal|osteoporosis|osteoclast|osteoblast|femur|vertebra|cartilage|osteopen|sarcopenia|muscle|musculoskeletal)\b/.test(text)) researchArea = 'Musculoskeletal';
    else if (/\b(cardiovascular|cardiac|heart|artery|vascular|endotheli|blood flow|blood pressure)\b/.test(text)) researchArea = 'Cardiovascular';
    else if (/\b(immune|immunolog|lymphocyte|leukocyte|macrophage|t-cell|cytokine|inflammation|innate|adaptive)\b/.test(text)) researchArea = 'Immunology';
    else if (/\b(neuro|brain|neuronal|hippocamp|cns|vestibular|synap|cognit|ocul|retina)\b/.test(text)) researchArea = 'Neuroscience';
    else if (/\b(radiat|ionizing|cosmic ray|gcr|spe|hze|gamma|proton)\b/.test(text)) researchArea = 'Radiation';
    else if (/\b(cell|cellular|cytoskeleton|mitochondri|apoptosis|dna|rna|proliferat|differentiation)\b/.test(text)) researchArea = 'Cellular Biology';
    else if (/\b(microb|bacteri|fung|yeast|microbiome|biofilm|pathogen|host-pathogen|symbio)\b/.test(text)) researchArea = 'Microbiology';
    else if (/\b(plant|arabidopsis|seedling|root|photosynthesis|gravitropism|auxin|lettuce|crop)\b/.test(text)) researchArea = 'Plant Biology';
    else if (/\b(gene|genomic|transcriptom|proteom|epigenetic|expression|molecular|dna|rna|splicing)\b/.test(text)) researchArea = 'Genomics & Omics';
    
    return { organism, researchArea };
}

// Function to load and process the real NASA papers data
function loadRealPublications(): PublicationWithTags[] {
    // Convert the imported NASA papers data to our Publication format
    const publications: Publication[] = nasaPapersData.map((paper) => ({
        id: paper.id,
        title: paper.title,
        link: paper.link,
        abstract: paper.abstract,
        summary: paper.summary || "",
        source: "NASA",
        authors: (paper as any).authors || [],
        date: (paper as any).date || "2023",
        type: (paper as any).type || "Research Article",
        createdAt: "2023-01-01T00:00:00Z"
    }));

    return publications.map(pub => ({
        ...pub,
        tags: getTags(pub)
    }));
}

export const getPublications = async (): Promise<PublicationWithTags[]> => {
    if (cachedPublications) {
        return cachedPublications;
    }
    
    console.log('Loading NASA research publications from real database...');
    
    // Use the real publications data
    const publicationsWithTags = loadRealPublications();
    console.log('Loaded publications:', publicationsWithTags.length);
    
    cachedPublications = publicationsWithTags;
    return publicationsWithTags;
};
