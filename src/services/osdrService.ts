/**
 * NASA Open Science Data Repository (OSDR) Integration
 * Official API Documentation: https://osdr.nasa.gov/bio/api/
 * Updated to use correct OSDR Developer API endpoints
 */

export interface OSDRStudy {
  accession: string; // e.g., "OSD-137"
  title: string;
  description?: string;
  organism?: string;
  experimentType?: string;
  releaseDate?: string;
  dataUrl?: string;
  assayTypes?: string[];
  factors?: string[];
  projectType?: string;
  mission?: string;
  fileCount?: number;
}

export interface OSDRSearchResult {
  studies: OSDRStudy[];
  total: number;
  hasMore: boolean;
}

// Official OSDR API endpoints
const OSDR_SEARCH_API = 'https://osdr.nasa.gov/osdr/data/search';
const OSDR_META_API = 'https://osdr.nasa.gov/osdr/data/osd/meta';
const OSDR_FILES_API = 'https://osdr.nasa.gov/osdr/data/osd/files';

/**
 * Search OSDR studies using the official Search API
 * Syntax: https://osdr.nasa.gov/osdr/data/search?term={SEARCH}&from={PAGE}&size={LIMIT}&type=cgene
 */
export async function searchOSDRStudies(
  query: string,
  limit: number = 10
): Promise<OSDRSearchResult> {
  try {
    // Use OSDR Search API with cgene (GeneLab) data source
    const params = new URLSearchParams({
      term: query,
      from: '0',
      size: limit.toString(),
      type: 'cgene', // NASA GeneLab data
    });
    
    const url = `${OSDR_SEARCH_API}?${params}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('OSDR Search API returned non-OK status:', response.status);
      return { studies: [], total: 0, hasMore: false };
    }

    const data = await response.json();
    
    // Parse OSDR Search API response format
    const hits = data.hits?.hits || [];
    const studies: OSDRStudy[] = hits.map((hit: any) => {
      const source = hit._source || {};
      
      return {
        accession: source['Study Identifier'] || source.Accession || hit._id,
        title: source['Study Title'] || 'Untitled Study',
        description: source['Study Description'] || source.description,
        organism: Array.isArray(source.organism) ? source.organism[0] : source.organism,
        experimentType: source['Study Assay Technology Type'],
        releaseDate: source['Study Public Release Date'],
        dataUrl: `https://osdr.nasa.gov/bio/repo/data/studies/${source['Study Identifier'] || source.Accession}`,
        assayTypes: source['Study Assay Measurement Type'] ? [source['Study Assay Measurement Type']] : [],
        factors: source['Study Factor Name'] ? [source['Study Factor Name']] : [],
        projectType: source['Project Type'],
        mission: source['Mission Name'],
      };
    });

    return {
      studies,
      total: data.hits?.total?.value || studies.length,
      hasMore: (data.hits?.total?.value || 0) > limit,
    };
  } catch (error) {
    console.error('Failed to search OSDR:', error);
    return { studies: [], total: 0, hasMore: false };
  }
}

/**
 * Get OSDR study details by accession number using Metadata API
 * Syntax: https://osdr.nasa.gov/osdr/data/osd/meta/{OSD_STUDY_ID}
 * Example: https://osdr.nasa.gov/osdr/data/osd/meta/137 returns OSD-137 metadata
 */
export async function getOSDRStudyDetails(accession: string): Promise<OSDRStudy | null> {
  try {
    // Remove "OSD-" prefix if present, API expects just the number
    const studyId = accession.replace(/^OSD-/i, '');
    const url = `${OSDR_META_API}/${studyId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('OSDR study not found:', accession);
      return null;
    }

    const data = await response.json();
    
    // Parse Metadata API response format
    // Response has structure: { study: { "OSD-###": { ... } } }
    const studyKey = Object.keys(data.study || {})[0];
    if (!studyKey) {
      return null;
    }
    
    const studyData = data.study[studyKey];
    const studyInfo = studyData.studies?.[0] || {};
    
    return {
      accession: studyKey,
      title: studyInfo.title || 'Untitled Study',
      description: studyInfo.description || '',
      organism: studyInfo.additionalInformation?.organisms?.links 
        ? Object.keys(studyInfo.additionalInformation.organisms.links)[0] 
        : 'Unknown',
      experimentType: studyInfo.comments?.find((c: any) => c.name === 'Experiment Platform')?.value,
      releaseDate: studyInfo.publicReleaseDate,
      dataUrl: `https://osdr.nasa.gov/bio/repo/data/studies/${studyKey}`,
      assayTypes: studyInfo.assays?.map((a: any) => Object.keys(a)[0]) || [],
      factors: studyInfo.factors?.map((f: any) => f.factorName) || [],
      projectType: studyInfo.comments?.find((c: any) => c.name === 'Project Type')?.value,
      mission: studyInfo.comments?.find((c: any) => c.name === 'Mission Name')?.value,
    };
  } catch (error) {
    console.error('Failed to get OSDR study details:', error);
    return null;
  }
}

/**
 * Find OSDR studies related to a publication
 */
export async function findRelatedOSDRStudies(
  publicationTitle: string,
  organism?: string
): Promise<OSDRStudy[]> {
  try {
    // Extract key terms from publication title
    const searchTerms = publicationTitle
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 4)
      .slice(0, 5)
      .join(' ');

    const query = organism 
      ? `${searchTerms} ${organism}`
      : searchTerms;

    const result = await searchOSDRStudies(query, 5);
    return result.studies;
  } catch (error) {
    console.error('Failed to find related OSDR studies:', error);
    return [];
  }
}

/**
 * Get OSDR studies by organism
 */
export async function getOSDRStudiesByOrganism(organism: string): Promise<OSDRStudy[]> {
  try {
    const result = await searchOSDRStudies(organism, 20);
    return result.studies.filter(study => 
      study.organism?.toLowerCase().includes(organism.toLowerCase())
    );
  } catch (error) {
    console.error('Failed to get OSDR studies by organism:', error);
    return [];
  }
}

/**
 * Check if OSDR API is available
 */
export async function checkOSDRAvailability(): Promise<boolean> {
  try {
    // Test with a simple search query
    const response = await fetch(`${OSDR_SEARCH_API}?term=mouse&size=1&type=cgene`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn('OSDR API is not available:', error);
    return false;
  }
}
