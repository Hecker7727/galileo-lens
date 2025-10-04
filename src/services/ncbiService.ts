// Service for fetching and processing NCBI publication data
// Supports PubMed URLs and extracts relevant research information

interface NCBIPublication {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  doi?: string;
  keywords?: string[];
}

/**
 * Extract PubMed ID from various NCBI URL formats
 */
export function extractPubMedId(url: string): string | null {
  const patterns = [
    /pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/,
    /ncbi\.nlm\.nih\.gov\/pubmed\/(\d+)/,
    /www\.ncbi\.nlm\.nih\.gov\/pubmed\/(\d+)/,
    /pmid[:\s](\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // Check if it's just a number (PMID)
  if (/^\d+$/.test(url.trim())) {
    return url.trim();
  }

  return null;
}

/**
 * Fetch publication data from NCBI E-utilities API
 */
export async function fetchNCBIPublication(pmidOrUrl: string): Promise<NCBIPublication | null> {
  try {
    const pmid = extractPubMedId(pmidOrUrl);
    if (!pmid) {
      console.error('Could not extract PMID from:', pmidOrUrl);
      return null;
    }

    // Use NCBI E-utilities API to fetch publication details
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    const fetchUrl = `${baseUrl}/efetch.fcgi?db=pubmed&id=${pmid}&retmode=xml`;

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      console.error('NCBI API error:', response.statusText);
      return null;
    }

    const xmlText = await response.text();
    
    // Parse XML response
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

    // Check for errors
    const errorNode = xmlDoc.querySelector('ERROR');
    if (errorNode) {
      console.error('NCBI returned error:', errorNode.textContent);
      return null;
    }

    // Extract publication data
    const article = xmlDoc.querySelector('PubmedArticle');
    if (!article) {
      console.error('No article found in response');
      return null;
    }

    // Extract title
    const titleNode = article.querySelector('ArticleTitle');
    const title = titleNode?.textContent || 'Unknown Title';

    // Extract abstract
    const abstractNodes = article.querySelectorAll('AbstractText');
    const abstractParts: string[] = [];
    abstractNodes.forEach(node => {
      const label = node.getAttribute('Label');
      const text = node.textContent || '';
      if (label) {
        abstractParts.push(`${label}: ${text}`);
      } else {
        abstractParts.push(text);
      }
    });
    const abstract = abstractParts.join('\n\n');

    // Extract authors
    const authorNodes = article.querySelectorAll('Author');
    const authors: string[] = [];
    authorNodes.forEach(node => {
      const lastName = node.querySelector('LastName')?.textContent || '';
      const foreName = node.querySelector('ForeName')?.textContent || '';
      if (lastName && foreName) {
        authors.push(`${foreName} ${lastName}`);
      } else if (lastName) {
        authors.push(lastName);
      }
    });

    // Extract journal
    const journalNode = article.querySelector('Journal > Title');
    const journal = journalNode?.textContent || 'Unknown Journal';

    // Extract publication date
    const pubDateNode = article.querySelector('PubDate');
    let publicationDate = 'Unknown Date';
    if (pubDateNode) {
      const year = pubDateNode.querySelector('Year')?.textContent || '';
      const month = pubDateNode.querySelector('Month')?.textContent || '';
      const day = pubDateNode.querySelector('Day')?.textContent || '';
      publicationDate = [year, month, day].filter(Boolean).join(' ');
    }

    // Extract DOI
    const doiNode = article.querySelector('ArticleId[IdType="doi"]');
    const doi = doiNode?.textContent || undefined;

    // Extract keywords/MeSH terms
    const keywordNodes = article.querySelectorAll('Keyword, DescriptorName');
    const keywords: string[] = [];
    keywordNodes.forEach(node => {
      const keyword = node.textContent?.trim();
      if (keyword) keywords.push(keyword);
    });

    return {
      pmid,
      title,
      abstract,
      authors,
      journal,
      publicationDate,
      doi,
      keywords: keywords.length > 0 ? keywords : undefined,
    };

  } catch (error) {
    console.error('Error fetching NCBI publication:', error);
    return null;
  }
}

/**
 * Format NCBI publication data for display
 */
export function formatNCBIPublication(pub: NCBIPublication): string {
  let formatted = `📄 **${pub.title}**\n\n`;
  
  if (pub.authors.length > 0) {
    const authorList = pub.authors.slice(0, 5).join(', ');
    const moreAuthors = pub.authors.length > 5 ? ` et al.` : '';
    formatted += `👥 **Authors:** ${authorList}${moreAuthors}\n\n`;
  }
  
  formatted += `📚 **Journal:** ${pub.journal}\n`;
  formatted += `📅 **Published:** ${pub.publicationDate}\n`;
  
  if (pub.doi) {
    formatted += `🔗 **DOI:** ${pub.doi}\n`;
  }
  
  formatted += `🆔 **PMID:** ${pub.pmid}\n\n`;
  
  if (pub.keywords && pub.keywords.length > 0) {
    formatted += `🏷️ **Keywords:** ${pub.keywords.slice(0, 10).join(', ')}\n\n`;
  }
  
  if (pub.abstract) {
    formatted += `📝 **Abstract:**\n${pub.abstract}\n`;
  }
  
  return formatted;
}

/**
 * Check if text contains NCBI URLs or PMIDs
 */
export function containsNCBIReference(text: string): boolean {
  const patterns = [
    /pubmed\.ncbi\.nlm\.nih\.gov\/\d+/i,
    /ncbi\.nlm\.nih\.gov\/pubmed\/\d+/i,
    /pmid[:\s]\d+/i,
  ];
  
  return patterns.some(pattern => pattern.test(text));
}

/**
 * Extract all NCBI references from text
 */
export function extractNCBIReferences(text: string): string[] {
  const references: string[] = [];
  
  // Extract URLs
  const urlPattern = /(https?:\/\/(?:www\.)?(?:pubmed\.)?ncbi\.nlm\.nih\.gov\/(?:pubmed\/)?(\d+))/gi;
  let match;
  while ((match = urlPattern.exec(text)) !== null) {
    references.push(match[1]);
  }
  
  // Extract PMIDs
  const pmidPattern = /pmid[:\s](\d+)/gi;
  while ((match = pmidPattern.exec(text)) !== null) {
    references.push(match[1]);
  }
  
  return [...new Set(references)]; // Remove duplicates
}
