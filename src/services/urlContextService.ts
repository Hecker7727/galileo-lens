// Service for URL context fetching using Gemini's URL Context tool
// Supports direct URL analysis for web pages, PDFs, images, and more

interface UrlContextMetadata {
  retrieved_url: string;
  url_retrieval_status: 'URL_RETRIEVAL_STATUS_SUCCESS' | 'URL_RETRIEVAL_STATUS_FAILURE' | 'URL_RETRIEVAL_STATUS_UNSAFE';
}

interface UrlContextResponse {
  metadata: UrlContextMetadata[];
  success: boolean;
}

/**
 * Extract all URLs from text
 * Supports: http://, https://, www., and common TLDs
 */
export function extractUrls(text: string): string[] {
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|edu|gov|net|io|ai|dev)[^\s]*)/gi;
  const matches = text.match(urlPattern) || [];
  
  // Normalize URLs (add https:// if missing)
  return matches.map(url => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    } else if (url.startsWith('www.')) {
      return `https://${url}`;
    } else {
      return `https://${url}`;
    }
  }).filter((url, index, self) => self.indexOf(url) === index); // Remove duplicates
}

/**
 * Check if text contains URLs
 */
export function containsUrls(text: string): boolean {
  const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|edu|gov|net|io|ai|dev)[^\s]*)/gi;
  return urlPattern.test(text);
}

/**
 * Categorize URL by type for better user feedback
 */
export function categorizeUrl(url: string): string {
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('arxiv.org')) return '📄 Research Paper (arXiv)';
  if (lowerUrl.includes('pubmed.ncbi.nlm.nih.gov') || lowerUrl.includes('ncbi.nlm.nih.gov')) return '🔬 Medical Research (PubMed)';
  if (lowerUrl.includes('github.com')) return '💻 Code Repository (GitHub)';
  if (lowerUrl.includes('stackoverflow.com')) return '💬 Q&A (StackOverflow)';
  if (lowerUrl.includes('wikipedia.org')) return '📚 Encyclopedia (Wikipedia)';
  if (lowerUrl.includes('nasa.gov')) return '🚀 NASA Resource';
  if (lowerUrl.includes('.pdf')) return '📄 PDF Document';
  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) return '🎥 Video (YouTube)';
  if (lowerUrl.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i)) return '🖼️ Image';
  if (lowerUrl.includes('docs.google.com')) return '📝 Google Doc';
  if (lowerUrl.includes('medium.com') || lowerUrl.includes('substack.com')) return '✍️ Blog Post';
  
  return '🌐 Web Page';
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get supported content types description
 */
export function getSupportedContentTypes(): string {
  return `
✅ Supported URL Types:
- 📄 Text content (HTML, JSON, plain text, XML, CSS, JavaScript, CSV, RTF)
- 🖼️ Images (PNG, JPEG, BMP, WebP)
- 📄 PDF documents
- 💻 Code repositories (GitHub, GitLab)
- 🔬 Research papers (arXiv, PubMed, preprints)
- 📚 Documentation sites
- 📰 News articles and blog posts
- 📊 Data visualizations

❌ Not Supported:
- 🎥 YouTube videos (use video understanding feature)
- 🔐 Paywalled content
- 📝 Google Workspace files (Docs, Sheets)
- 🎵 Audio files
- 🎬 Video files (except YouTube via video feature)
`;
}

/**
 * Format URLs for display in chat
 */
export function formatUrlsForDisplay(urls: string[]): string {
  if (urls.length === 0) return '';
  
  let formatted = '\n\n🔗 **Analyzing URLs:**\n';
  urls.slice(0, 20).forEach((url, index) => {
    const category = categorizeUrl(url);
    formatted += `${index + 1}. ${category}\n   ${url}\n`;
  });
  
  if (urls.length > 20) {
    formatted += `\n... and ${urls.length - 20} more URLs (limit: 20 per request)\n`;
  }
  
  return formatted;
}

/**
 * Create URL context instructions for Gemini
 */
export function createUrlContextInstructions(urls: string[]): string {
  return `
IMPORTANT: The user has provided the following URLs for analysis:
${urls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

You MUST:
1. Access and analyze the content from ALL these URLs
2. Extract relevant information, data, and insights
3. Cite specific findings from each URL in your response
4. Compare information across URLs if multiple are provided
5. Provide a comprehensive analysis based on the URL content

When referencing information from URLs:
- Cite the URL number (e.g., "According to URL 1...")
- Quote specific data or findings
- Note any contradictions between sources
- Highlight key insights from each source
`;
}

/**
 * Parse URL context metadata from Gemini response
 */
export function parseUrlContextMetadata(metadata: any): UrlContextResponse {
  if (!metadata || !metadata.url_metadata) {
    return { metadata: [], success: false };
  }
  
  const urlMetadata: UrlContextMetadata[] = metadata.url_metadata.map((item: any) => ({
    retrieved_url: item.retrieved_url || '',
    url_retrieval_status: item.url_retrieval_status || 'URL_RETRIEVAL_STATUS_FAILURE'
  }));
  
  const success = urlMetadata.every(
    item => item.url_retrieval_status === 'URL_RETRIEVAL_STATUS_SUCCESS'
  );
  
  return { metadata: urlMetadata, success };
}

/**
 * Format URL retrieval status for user feedback
 */
export function formatUrlRetrievalStatus(metadata: UrlContextMetadata[]): string {
  if (metadata.length === 0) return '';
  
  let status = '\n\n📊 **URL Retrieval Status:**\n';
  
  metadata.forEach((item, index) => {
    let icon = '❌';
    let statusText = 'Failed';
    
    switch (item.url_retrieval_status) {
      case 'URL_RETRIEVAL_STATUS_SUCCESS':
        icon = '✅';
        statusText = 'Success';
        break;
      case 'URL_RETRIEVAL_STATUS_UNSAFE':
        icon = '⚠️';
        statusText = 'Unsafe content detected';
        break;
      case 'URL_RETRIEVAL_STATUS_FAILURE':
        icon = '❌';
        statusText = 'Failed to retrieve';
        break;
    }
    
    status += `${icon} **URL ${index + 1}:** ${statusText}\n`;
  });
  
  return status;
}

/**
 * Get usage tips for URL context
 */
export function getUrlContextTips(): string[] {
  return [
    '💡 Provide direct URLs to specific content (not homepages)',
    '🔓 Ensure URLs are publicly accessible (no login required)',
    '📝 Use complete URLs with https:// protocol',
    '📊 Can analyze up to 20 URLs per request',
    '🔍 Works with PDFs, images, code repos, and web pages',
    '⚡ URL content counts toward input token usage',
  ];
}

/**
 * Estimate token usage for URLs
 * Note: This is a rough estimate, actual usage may vary
 */
export function estimateUrlTokens(urlCount: number): string {
  const avgTokensPerUrl = 5000; // Average estimate
  const estimated = urlCount * avgTokensPerUrl;
  
  return `📊 Estimated token usage: ~${estimated.toLocaleString()} tokens for ${urlCount} URL${urlCount > 1 ? 's' : ''}`;
}
