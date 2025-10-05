import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMResponse, PublicationWithTags, ChatMessage } from '../types/dataTypes';
import { getPublications } from '../data/processedPublications';
import { extractUrls, containsUrls, formatUrlsForDisplay, createUrlContextInstructions } from './urlContextService';

interface AskOptions {
  maxTokens?: number;
  temperature?: number;
  language?: string;
  conversationHistory?: ChatMessage[];
}

// Initialize Gemini API
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY is not defined in environment variables');
  throw new Error('Missing API key. Please add VITE_GEMINI_API_KEY to your .env file');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function ask(prompt: string, opts: AskOptions = {}): Promise<LLMResponse> {
  try {
    // Get real publication data to provide context
    const publications = await getPublications();
    
    if (publications.length === 0) {
      return {
        text: "I'm currently loading the NASA research database. Please try again in a moment, or ask me about general space medicine topics.",
        structured: {
          suggestions: [
            "What are the main health risks of spaceflight?",
            "How does microgravity affect the human body?",
            "What countermeasures protect astronaut health?",
            "Tell me about radiation exposure in space"
          ]
        }
      };
    }
    
    // Search publications based on prompt keywords with improved relevance scoring
    const lowerPrompt = prompt.toLowerCase();
    const searchTerms = lowerPrompt.split(' ').filter(term => term.length > 2);
    
    const relevantPubs = publications
      .map(pub => {
        let relevanceScore = 0;
        const titleLower = pub.title.toLowerCase();
        const abstractLower = (pub.abstract || '').toLowerCase();
        const combinedText = titleLower + ' ' + abstractLower;
        
        // Score based on exact phrase matches
        if (combinedText.includes(lowerPrompt)) relevanceScore += 10;
        
        // Score based on individual search terms
        searchTerms.forEach(term => {
          // Escape special regex characters to prevent syntax errors
          const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const termCount = (combinedText.match(new RegExp(escapedTerm, 'g')) || []).length;
          relevanceScore += termCount * 2;
          
          // Higher score for matches in title
          if (titleLower.includes(term)) relevanceScore += 5;
          
          // Score for research area and organism matches
          if (pub.tags?.researchArea?.toLowerCase().includes(term)) relevanceScore += 3;
          if (pub.tags?.organism?.toLowerCase().includes(term)) relevanceScore += 3;
        });
        
        return { ...pub, relevanceScore };
      })
      .filter(pub => pub.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5); // Get top 5 most relevant
    
    // Automatically collect NCBI URLs from relevant publications for URL context
    let detectedUrls: string[] = [];
    let urlContext = '';
    
    // Add URLs from user's prompt if any
    if (containsUrls(prompt)) {
      const promptUrls = extractUrls(prompt);
      detectedUrls.push(...promptUrls);
      console.log('Found URLs in user prompt:', promptUrls);
    }
    
    // Add NCBI URLs from relevant publications (limit to top 5 to avoid token limits)
    const publicationUrls = relevantPubs
      .slice(0, 5)
      .map(pub => pub.link)
      .filter((link): link is string => Boolean(link && link.includes('ncbi.nlm.nih.gov')));
    
    detectedUrls.push(...publicationUrls);
    
    // Limit total URLs to 20 (Gemini's limit)
    if (detectedUrls.length > 20) {
      console.warn(`Too many URLs (${detectedUrls.length}). Limiting to 20.`);
      detectedUrls = detectedUrls.slice(0, 20);
    }
    
    if (detectedUrls.length > 0) {
      console.log(`🔗 Enabling URL Context with ${detectedUrls.length} URLs (${publicationUrls.length} from NASA papers)`);
      urlContext = formatUrlsForDisplay(detectedUrls);
    }
    
    // Prepare context for the AI model
    const contextInfo = {
      totalPublications: publications.length,
      relevantPublications: relevantPubs.map(pub => ({
        title: pub.title,
        abstract: pub.abstract, // Use full abstract for better context
        researchArea: pub.tags.researchArea,
        organism: pub.tags.organism,
        link: pub.link,
        id: pub.id
      })),
      researchAreas: [...new Set(publications.map(pub => pub.tags.researchArea))],
      organisms: [...new Set(publications.map(pub => pub.tags.organism))]
    };
    
    // Get selected language name
    const languageNames: Record<string, string> = {
      'en-US': 'English',
      'hi-IN': 'Hindi',
      'ta-IN': 'Tamil',
      'kn-IN': 'Kannada',
      'ml-IN': 'Malayalam',
      'te-IN': 'Telugu',
      'mr-IN': 'Marathi',
      'bn-IN': 'Bengali',
      'gu-IN': 'Gujarati',
      'pa-IN': 'Punjabi',
      'es-ES': 'Spanish',
      'fr-FR': 'French',
      'de-DE': 'German',
      'pt-BR': 'Portuguese',
      'ja-JP': 'Japanese',
      'zh-CN': 'Chinese',
    };
    
    const selectedLanguage = languageNames[opts.language || 'en-US'] || 'English';
    const languageInstruction = opts.language && opts.language !== 'en-US' 
      ? `\n\nCRITICAL LANGUAGE REQUIREMENT:
- You MUST respond ONLY in ${selectedLanguage}
- ALL your responses must be in ${selectedLanguage}, no exceptions
- Never switch to other languages during the conversation
- If the user's question is in a different language, still respond in ${selectedLanguage}
- Maintain scientific accuracy while using ${selectedLanguage}\n`
      : '';

    // Build conversation history context
    let conversationContext = '';
    if (opts.conversationHistory && opts.conversationHistory.length > 0) {
      conversationContext = '\n\nCONVERSATION HISTORY (for context and follow-up questions):\n';
      // Get last 10 messages for context (5 exchanges)
      const recentMessages = opts.conversationHistory.slice(-10);
      recentMessages.forEach(msg => {
        if (msg.sender === 'user') {
          conversationContext += `User: ${msg.text}\n`;
        } else if (msg.sender === 'assistant') {
          conversationContext += `Assistant: ${msg.text}\n`;
        }
      });
      conversationContext += '\nUse this conversation history to understand context and answer follow-up questions accurately.\n';
    }

    // Add URL context instructions if URLs detected
    let urlContextSection = '';
    if (detectedUrls.length > 0) {
      urlContextSection = createUrlContextInstructions(detectedUrls);
    }
    
    // Create system prompt that strictly constrains AI to use only provided papers
  const systemPrompt = `You are Galileo's Lenses AI, a research assistant that ONLY analyzes and reports on the specific NASA research publications provided in this database. You have access to ${contextInfo.totalPublications} NASA research publications covering areas like ${contextInfo.researchAreas.join(', ')}.
${languageInstruction}${conversationContext}${urlContextSection}
CRITICAL CONSTRAINTS:
- You MUST ONLY use information from the provided NASA research papers in the database
- Do NOT generate information outside of what is explicitly stated in these papers
- If the provided papers don't contain information to answer a question, say so honestly
- ONLY reference findings, data, and conclusions that appear in the provided abstracts
- Do NOT make generalizations beyond what the research papers explicitly state

Your role is to:
- Analyze ONLY the bioscience data from the provided NASA research papers
- Summarize findings directly from these specific publications
- Interpret research ONLY from the organisms and studies described in these papers
- Explain implications based ONLY on what these specific studies conclude
- Be accurate and limited to the provided research data

RESPONSE FORMAT GUIDELINES:
- Use clear markdown formatting with ## for main sections and ### for subsections
- Always reference specific paper titles when citing findings
- Use bullet points for lists and numbered lists for sequential information
- Include specific research context from the provided papers
- Be comprehensive but ONLY within the scope of provided research
- Use scientific terminology from the papers but explain complex concepts

AVAILABLE RESEARCH PAPERS FOR THIS QUERY:
${contextInfo.relevantPublications.length > 0 ? 
  contextInfo.relevantPublications.map(pub => 
    `Title: "${pub.title}"\nResearch Area: ${pub.researchArea}\nOrganism: ${pub.organism}\nFull Abstract: ${pub.abstract}\nLink: ${pub.link}\n`
  ).join('\n---\n') 
  : 'No relevant papers found in the database for this specific query.'
}

If no relevant papers are provided above, you must inform the user that the database doesn't contain research directly addressing their question, and suggest they refine their query or ask about topics covered by the available research areas: ${contextInfo.researchAreas.join(', ')}.`;

    // Initialize the model with URL context tool if URLs are detected
    const tools = detectedUrls.length > 0 ? [{ urlContext: {} }] : undefined;
    
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-flash-lite-latest',  // Use Gemini Flash Lite model
      generationConfig: {
        temperature: opts.temperature || 0.7,
        maxOutputTokens: opts.maxTokens || 2000,
      },
      tools: tools as any,  // Enable URL context tool when URLs detected
    });

    // Generate response with URL context support
    const urlInstructions = detectedUrls.length > 0 
      ? `\n\n🔗 CRITICAL: You have ${detectedUrls.length} URL(s) to analyze:
${detectedUrls.map((url, i) => `${i + 1}. ${url}`).join('\n')}

INSTRUCTIONS FOR URL CONTEXT:
- Fetch and read the FULL content from these URLs (these are NCBI research papers)
- Extract key findings, methodologies, results, and conclusions from the URL content
- Integrate this detailed information with the NASA research abstracts provided above
- Use the URL content as PRIMARY source material to give comprehensive, detailed answers
- Cross-reference findings between the URL content and NASA abstracts
- Provide specific data, statistics, and results from the papers at these URLs

This will give you much more detailed knowledge than just the abstracts!`
      : "\n\nREMINDER: Base your response STRICTLY on the provided NASA research papers above.";

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User question: ${prompt}` },
      { text: urlInstructions }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Check for URL context metadata
    let urlContextInfo = '';
    if (response.candidates && response.candidates[0] && (response.candidates[0] as any).urlContextMetadata) {
      const urlMetadata = (response.candidates[0] as any).urlContextMetadata;
      console.log('URL Context Metadata:', urlMetadata);
      
      // Add URL retrieval status to response
      if (urlMetadata.url_metadata) {
        urlContextInfo = '\n\n📊 **URL Analysis:**\n';
        urlMetadata.url_metadata.forEach((item: any, index: number) => {
          const status = item.url_retrieval_status === 'URL_RETRIEVAL_STATUS_SUCCESS' ? '✅' : '❌';
          urlContextInfo += `${status} URL ${index + 1}: ${item.url_retrieval_status}\n`;
        });
      }
    }
    
    // Create structured response based on content and relevant publications
    const structuredResponse: any = {};
    
    // Add URL context information if available
    if (detectedUrls.length > 0) {
      structuredResponse.urlsAnalyzed = detectedUrls;
      structuredResponse.urlContextEnabled = true;
    }
    
    if (relevantPubs.length > 0) {
      structuredResponse.citations = relevantPubs.map(pub => ({
        source: pub.title,
        url: pub.link,
        confidence: 0.9
      }));
      // Remove relevanceScore from the publications before adding to response
      structuredResponse.relatedPublications = relevantPubs.map(pub => ({
        id: pub.id,
        title: pub.title,
        abstract: pub.abstract,
        link: pub.link,
        tags: pub.tags,
        source: pub.source,
        authors: pub.authors,
        date: pub.date,
        type: pub.type
      }));
    }
    
    // Extract key points and implications from the AI response
    const responseText = text.toLowerCase();
    
    // Generate key points based on response content
    const keyPoints = [];
    if (responseText.includes('microgravity')) {
      keyPoints.push("Microgravity environment significantly affects biological processes");
    }
    if (responseText.includes('bone') || responseText.includes('muscle')) {
      keyPoints.push("Musculoskeletal system undergoes rapid changes in space");
    }
    if (responseText.includes('cardiovascular') || responseText.includes('heart')) {
      keyPoints.push("Cardiovascular adaptations occur within days of spaceflight");
    }
    if (responseText.includes('radiation')) {
      keyPoints.push("Radiation exposure poses significant health risks for astronauts");
    }
    if (responseText.includes('exercise') || responseText.includes('countermeasure')) {
      keyPoints.push("Exercise protocols are essential for maintaining astronaut health");
    }
    
    if (keyPoints.length > 0) {
      structuredResponse.keyPoints = keyPoints;
    }
    
    // Generate implications for space medicine
    const implications = [];
    if (lowerPrompt.includes('bone') || lowerPrompt.includes('muscle')) {
      implications.push("Requires development of targeted exercise countermeasures for long-duration missions");
      implications.push("May necessitate pharmaceutical interventions for Mars missions");
    }
    if (lowerPrompt.includes('cardiovascular')) {
      implications.push("Critical for developing pre-flight conditioning protocols");
      implications.push("Important for post-flight rehabilitation strategies");
    }
    if (lowerPrompt.includes('radiation')) {
      implications.push("Essential for mission planning and shielding design");
      implications.push("Influences crew selection and mission duration limits");
    }
    
    if (implications.length > 0) {
      structuredResponse.implications = implications;
    }
    
    // Add suggestions based on the actual research areas available in the database
    const suggestions = [];
    const availableAreas = contextInfo.researchAreas.filter(area => area !== 'General');
    
    // Suggest related research areas from the database
    if (availableAreas.length > 0) {
      suggestions.push(...availableAreas.slice(0, 3).map(area => `Research on ${area?.toLowerCase() || 'space biology'}`));
    }
    
    // Add organism-specific suggestions if we have organism data
    const availableOrganisms = contextInfo.organisms.filter(org => org !== 'N/A' && org !== 'Various/Mixed');
    if (availableOrganisms.length > 0 && availableOrganisms[0] && suggestions.length < 4) {
      suggestions.push(`Studies involving ${availableOrganisms[0].toLowerCase()}`);
    }
    
    structuredResponse.suggestions = suggestions.slice(0, 4);
    
    return {
      text,
      structured: structuredResponse
    };
    
  } catch (error) {
    console.error('Gemini API error:', error);
    
    // Fallback to a basic response using publication data
    const publications = await getPublications();
    const lowerPrompt = prompt.toLowerCase();
    const relevantPubs = publications.filter(pub => 
      pub.title.toLowerCase().includes(lowerPrompt) ||
      (pub.abstract || '').toLowerCase().includes(lowerPrompt) ||
      pub.tags?.organism?.toLowerCase().includes(lowerPrompt) ||
      pub.tags?.researchArea?.toLowerCase().includes(lowerPrompt)
    ).slice(0, 3);
    
    if (relevantPubs.length > 0) {
      return {
        text: `I found ${relevantPubs.length} relevant NASA publications related to your query. Here's what the research shows: ${(relevantPubs[0]?.abstract || '').slice(0, 300)}...`,
        structured: {
          citations: relevantPubs.map(pub => ({
            source: pub.title,
            url: pub.link,
            confidence: 0.8
          })),
          relatedPublications: relevantPubs,
          suggestions: [
            "Tell me more about this research area",
            "Show related publications",
            "Analyze the implications for space missions"
          ]
        }
      };
    }
    
    return {
      text: "I apologize, but I'm experiencing technical difficulties. Please try rephrasing your question or ask about specific aspects of space medicine research.",
      structured: {
        suggestions: [
          "Bone density research in space",
          "Muscle atrophy and countermeasures", 
          "Cardiovascular effects of microgravity",
          "Radiation protection strategies"
        ]
      }
    };
  }
}

// Additional service functions
export async function summarizePublication(publicationId: string): Promise<LLMResponse> {
  try {
    const publications = await getPublications();
    const publication = publications.find(pub => pub.id === publicationId);
    
    if (!publication) {
      return {
        text: "Publication not found in the database.",
        structured: {
          error: "Publication ID not found"
        }
      };
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-flash-lite-latest',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      }
    });

    const prompt = `Please provide a comprehensive summary of this NASA research publication:

Title: ${publication.title}
Research Area: ${publication.tags.researchArea}
Organism: ${publication.tags.organism}
Abstract: ${publication.abstract}

Focus on:
- Key research findings and implications
- Relevance to space medicine and astronaut health
- Practical applications for future missions
- How this research contributes to our understanding of biological adaptations in space`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      text,
      structured: {
        title: publication.title,
        organism: publication.tags.organism,
        researchArea: publication.tags.researchArea,
        link: publication.link,
        fullAbstract: publication.abstract
      }
    };
    
  } catch (error) {
    console.error('Gemini API error in summarizePublication:', error);
    
    // Fallback to simple summary
    const publications = await getPublications();
    const publication = publications.find(pub => pub.id === publicationId);
    
    if (!publication) {
      return {
        text: "Publication not found in the database.",
        structured: {
          error: "Publication ID not found"
        }
      };
    }

    return {
      text: `This NASA study "${publication.title}" investigates ${publication.tags?.researchArea?.toLowerCase() || 'space biology'} using ${publication.tags?.organism || 'various subjects'}. ${(publication.abstract || '').slice(0, 300)}...`,
      structured: {
        title: publication.title,
        organism: publication.tags.organism,
        researchArea: publication.tags.researchArea,
        link: publication.link,
        fullAbstract: publication.abstract
      }
    };
  }
}

export async function generateInsights(nodeIds: string[]): Promise<LLMResponse> {
  try {
    const publications = await getPublications();
    const selectedPubs = publications.filter(pub => nodeIds.includes(pub.id));
    
    if (selectedPubs.length === 0) {
      return {
        text: "No publications found for the selected nodes.",
        structured: {
          error: "No matching publications"
        }
      };
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-flash-lite-latest',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1200,
      }
    });

    const publicationData = selectedPubs.map(pub => 
      `Title: ${pub.title}\nResearch Area: ${pub.tags.researchArea}\nOrganism: ${pub.tags.organism}\nAbstract: ${pub.abstract}\n`
    ).join('\n---\n');

    const prompt = `Please analyze these ${selectedPubs.length} NASA research publications and provide insights about their collective implications for space medicine:

${publicationData}

Focus on:
- Common themes and patterns across the research
- How findings from different organisms relate to human spaceflight
- Practical implications for astronaut health and mission planning
- Research gaps and future directions
- Synergistic effects or conflicting findings`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Analyze the research areas and organisms
    const researchAreas = [...new Set(selectedPubs.map(pub => pub.tags.researchArea))];
    const organisms = [...new Set(selectedPubs.map(pub => pub.tags.organism))];

    return {
      text,
      structured: {
        selectedPublications: selectedPubs.length,
        researchAreas: researchAreas,
        organisms: organisms,
        publicationTitles: selectedPubs.map(pub => pub.title),
        recommendations: [
          "Integrate findings across research areas",
          "Develop personalized countermeasure protocols", 
          "Validate results in human studies",
          "Consider synergistic effects of multiple stressors"
        ]
      }
    };
    
  } catch (error) {
    console.error('Gemini API error in generateInsights:', error);
    
    // Fallback to basic analysis
    const publications = await getPublications();
    const selectedPubs = publications.filter(pub => nodeIds.includes(pub.id));
    
    if (selectedPubs.length === 0) {
      return {
        text: "No publications found for the selected nodes.",
        structured: {
          error: "No matching publications"
        }
      };
    }

    const researchAreas = [...new Set(selectedPubs.map(pub => pub.tags.researchArea))];
    const organisms = [...new Set(selectedPubs.map(pub => pub.tags.organism))];

    return {
      text: `Analysis of ${selectedPubs.length} selected publications spanning ${researchAreas.join(', ')} research areas reveals important insights for space medicine. The studies examine effects across ${organisms.join(', ')} model systems.`,
      structured: {
        selectedPublications: selectedPubs.length,
        researchAreas: researchAreas,
        organisms: organisms,
        publicationTitles: selectedPubs.map(pub => pub.title),
        recommendations: [
          "Integrate findings across research areas",
          "Develop personalized countermeasure protocols", 
          "Validate results in human studies",
          "Consider synergistic effects of multiple stressors"
        ]
      }
    };
  }
}