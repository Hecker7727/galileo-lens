# NASA OSDR API Integration Guide

## Overview
This guide explains how to use the NASA Open Science Data Repository (OSDR) Developer API within the application. The OSDR service (`osdrService.ts`) provides access to spaceflight experimental data, study metadata, and research files.

## Official API Documentation
- **Base URL**: `https://osdr.nasa.gov/osdr/data/`
- **Official Docs**: https://osdr.nasa.gov/bio/api/
- **API Type**: RESTful with JSON responses

## Available Endpoints

### 1. Search API
**Endpoint**: `https://osdr.nasa.gov/osdr/data/search`

Search dataset metadata by keywords across NASA GeneLab and other omics databases.

**Parameters**:
- `term` (required): Search keyword (string)
- `from`: Starting page number (default: 0)
- `size`: Results per page (default: 10)
- `type`: Data source (e.g., `cgene` for NASA GeneLab)
- `ffield`: Filter field (can be used multiple times)
- `fvalue`: Filter value (paired with ffield)

**Example**:
```typescript
// Search for mouse liver studies
const results = await searchOSDRStudies("mouse liver", 10);
```

**Sample Response Fields**:
- `Study Identifier`: e.g., "OSD-137"
- `Study Title`: Full study title
- `Study Description`: Study description text
- `organism`: Array of organisms studied
- `Study Assay Technology Type`: e.g., "RNA Sequencing"
- `Project Type`: e.g., "Spaceflight Study"
- `Mission Name`: e.g., "SpaceX-8"

### 2. Metadata API
**Endpoint**: `https://osdr.nasa.gov/osdr/data/osd/meta/{STUDY_ID}`

Returns complete metadata for a specific study.

**Parameters**:
- `{STUDY_ID}`: Integer study ID (e.g., `137` for OSD-137)

**Example**:
```typescript
// Get detailed metadata for OSD-137
const study = await getOSDRStudyDetails("OSD-137");
// or
const study = await getOSDRStudyDetails("137");
```

**Response Structure**:
```json
{
  "study": {
    "OSD-137": {
      "studies": [{
        "title": "Rodent Research-3...",
        "description": "The Rodent Research-3...",
        "publicReleaseDate": "28-Aug-2017",
        "assays": [...],
        "factors": [...],
        "comments": [
          { "name": "Mission Name", "value": "SpaceX-8" },
          { "name": "Project Type", "value": "Spaceflight Study" }
        ]
      }]
    }
  }
}
```

### 3. Data Files API
**Endpoint**: `https://osdr.nasa.gov/osdr/data/osd/files/{STUDY_IDs}`

Returns metadata for data files associated with studies, including download URLs.

**Parameters**:
- `{STUDY_IDs}`: Comma-separated study IDs or ranges (e.g., `87-95,137,153.2`)
- `page`: Current page number (starts from 0)
- `size`: Results per page (max 25)
- `all_files`: Include hidden files (true/false)

**Example URL**:
```
https://osdr.nasa.gov/osdr/data/osd/files/137
```

**File Download**:
Files can be downloaded by prefacing `remote_url` with `https://osdr.nasa.gov`:
```
https://osdr.nasa.gov/geode-py/ws/studies/OSD-87/download?source=datamanager&file=GLDS-87_metadata.zip
```

## Service Functions

### searchOSDRStudies()
Search for OSDR studies by keyword.

**Signature**:
```typescript
searchOSDRStudies(query: string, limit: number = 10): Promise<OSDRSearchResult>
```

**Usage**:
```typescript
const results = await searchOSDRStudies("transcriptomics", 20);
console.log(`Found ${results.total} studies`);
results.studies.forEach(study => {
  console.log(`${study.accession}: ${study.title}`);
});
```

### getOSDRStudyDetails()
Retrieve complete metadata for a specific study.

**Signature**:
```typescript
getOSDRStudyDetails(accession: string): Promise<OSDRStudy | null>
```

**Usage**:
```typescript
const study = await getOSDRStudyDetails("OSD-137");
if (study) {
  console.log(`Title: ${study.title}`);
  console.log(`Organism: ${study.organism}`);
  console.log(`Mission: ${study.mission}`);
  console.log(`Data URL: ${study.dataUrl}`);
}
```

### findRelatedOSDRStudies()
Find OSDR studies related to a publication.

**Signature**:
```typescript
findRelatedOSDRStudies(publicationTitle: string, organism?: string): Promise<OSDRStudy[]>
```

**Usage**:
```typescript
const related = await findRelatedOSDRStudies(
  "Effects of spaceflight on mouse liver",
  "Mus musculus"
);
```

### getOSDRStudiesByOrganism()
Search for studies by organism.

**Signature**:
```typescript
getOSDRStudiesByOrganism(organism: string): Promise<OSDRStudy[]>
```

**Usage**:
```typescript
const mouseStudies = await getOSDRStudiesByOrganism("Mus musculus");
const humanStudies = await getOSDRStudiesByOrganism("Homo sapiens");
```

### checkOSDRAvailability()
Check if the OSDR API is accessible.

**Signature**:
```typescript
checkOSDRAvailability(): Promise<boolean>
```

**Usage**:
```typescript
const isAvailable = await checkOSDRAvailability();
if (!isAvailable) {
  console.warn("OSDR API is currently unavailable");
}
```

## Data Types

### OSDRStudy Interface
```typescript
interface OSDRStudy {
  accession: string;        // e.g., "OSD-137"
  title: string;            // Study title
  description?: string;     // Full description
  organism?: string;        // Primary organism
  experimentType?: string;  // e.g., "RNA Sequencing"
  releaseDate?: string;     // Public release date
  dataUrl?: string;         // Link to study page
  assayTypes?: string[];    // Array of assay types
  factors?: string[];       // Experimental factors
  projectType?: string;     // e.g., "Spaceflight Study"
  mission?: string;         // Mission name
  fileCount?: number;       // Number of data files
}
```

### OSDRSearchResult Interface
```typescript
interface OSDRSearchResult {
  studies: OSDRStudy[];     // Array of study objects
  total: number;            // Total results available
  hasMore: boolean;         // More results exist
}
```

## Common Search Filter Fields

Use these with `ffield` and `fvalue` parameters:

| Filter Field | Example Value |
|-------------|--------------|
| `Accession` | "OSD-4" |
| `organism` | "Mus musculus" |
| `Project Type` | "Spaceflight" |
| `Mission Name` | "SpaceX-8" |
| `Study Assay Technology Type` | "RNA Sequencing" |
| `Study Assay Technology Platform` | "Illumina" |
| `Material Type` | "liver tissue" |
| `Space Program` | "NASA" |
| `Managing NASA Center` | "Ames Research Center" |

**Example with filters**:
```
https://osdr.nasa.gov/osdr/data/search?
  ffield=organism&fvalue=Homo%20sapiens&
  ffield=Study%20Assay%20Technology%20Type&fvalue=RNA%20Sequencing
```

## Integration with OSDRPanel Component

The `OSDRPanel.tsx` component uses these services to:

1. **Auto-search** on mount when a publication is selected
2. **Manual search** via input field
3. **Display study cards** with metadata
4. **Link to OSDR portal** for full study details

**Example integration**:
```typescript
// In DetailPanel.tsx
{node.type === 'publication' && (
  <OSDRPanel 
    publicationTitle={node.label} 
    organism={node.properties?.organism} 
  />
)}
```

## API Rate Limits & Best Practices

1. **No Authentication Required**: OSDR API is publicly accessible
2. **Rate Limiting**: Not officially documented, use responsibly
3. **Error Handling**: Always check `response.ok` before parsing
4. **Caching**: Consider caching results to reduce API calls
5. **Timeouts**: Use AbortSignal for request timeouts (5 seconds recommended)

## Testing the API

### Manual Testing with Browser
Visit these URLs directly:

1. **Search for mouse studies**:
   ```
   https://osdr.nasa.gov/osdr/data/search?term=mouse&size=5&type=cgene
   ```

2. **Get OSD-137 metadata**:
   ```
   https://osdr.nasa.gov/osdr/data/osd/meta/137
   ```

3. **Get OSD-87 files**:
   ```
   https://osdr.nasa.gov/osdr/data/osd/files/87
   ```

### Testing with Python
```python
import requests

# Search API
response = requests.get(
    "https://osdr.nasa.gov/osdr/data/search",
    params={"term": "liver", "size": 10, "type": "cgene"}
).json()

# Metadata API
response = requests.get(
    "https://osdr.nasa.gov/osdr/data/osd/meta/137"
).json()

# Files API
response = requests.get(
    "https://osdr.nasa.gov/osdr/data/osd/files/87"
).json()
```

## Common Issues & Troubleshooting

### Issue: CORS Errors
**Solution**: OSDR API supports CORS, but ensure you're making requests from allowed origins.

### Issue: 404 Not Found
**Possible Causes**:
- Invalid study ID (ensure it's a valid OSD number)
- Study doesn't exist or has been removed
- Wrong endpoint format

### Issue: Empty Results
**Possible Causes**:
- Search term too specific
- No studies match the filters
- Try broader search terms or remove filters

### Issue: Timeout Errors
**Solution**: Implement retry logic with exponential backoff:
```typescript
async function fetchWithRetry(url: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(5000) 
      });
      if (response.ok) return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

## Additional Resources

- **OSDR Homepage**: https://osdr.nasa.gov/
- **GeneLab Data Portal**: https://genelab-data.ndc.nasa.gov/
- **API Documentation**: https://osdr.nasa.gov/bio/api/
- **Sample Datasets**: Browse at https://osdr.nasa.gov/bio/repo/search

## Example: Complete Workflow

```typescript
import { 
  searchOSDRStudies, 
  getOSDRStudyDetails,
  checkOSDRAvailability 
} from './services/osdrService';

async function exploreOSDRData() {
  // 1. Check API availability
  const available = await checkOSDRAvailability();
  if (!available) {
    console.error("OSDR API is not available");
    return;
  }

  // 2. Search for studies
  const searchResults = await searchOSDRStudies("mouse liver transcriptomics", 10);
  console.log(`Found ${searchResults.total} studies`);

  // 3. Get details for first result
  if (searchResults.studies.length > 0) {
    const firstStudy = searchResults.studies[0];
    const details = await getOSDRStudyDetails(firstStudy.accession);
    
    if (details) {
      console.log("Study Details:");
      console.log(`  Title: ${details.title}`);
      console.log(`  Organism: ${details.organism}`);
      console.log(`  Mission: ${details.mission}`);
      console.log(`  Assay Types: ${details.assayTypes?.join(", ")}`);
      console.log(`  Data URL: ${details.dataUrl}`);
    }
  }
}

// Run the workflow
exploreOSDRData();
```

## Changelog

### Version 2.0 (Current)
- ✅ Updated to use official OSDR Developer API endpoints
- ✅ Implemented Search API with proper parameters
- ✅ Implemented Metadata API with correct response parsing
- ✅ Added support for mission names and project types
- ✅ Improved error handling and availability checks
- ✅ Added comprehensive documentation

### Version 1.0 (Previous)
- ❌ Used incorrect API endpoints (deprecated)
- ❌ Incorrect response format parsing
