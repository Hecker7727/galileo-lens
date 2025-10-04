# OSDR Integration & Gap Analysis Features

## Overview
Galileo Lenses now integrates with NASA's Open Science Data Repository (OSDR) and provides automated research gap analysis to identify under-studied areas in space bioscience.

---

## 🗄️ OSDR Integration

### What is OSDR?
The NASA Open Science Data Repository (OSDR) is a public database containing raw experimental data, metadata, and analysis tools from spaceflight experiments.

**Data Types:**
- Transcriptomics (RNA-seq, microarray)
- Proteomics
- Metabolomics
- Epigenomics
- Imaging data
- Physiological measurements

### Features Implemented

#### 1. **OSDR Search Service** (`src/services/osdrService.ts`)

```typescript
// Search OSDR studies
const result = await searchOSDRStudies('bone loss', 10);

// Get study details by accession
const study = await getOSDRStudyDetails('OSD-123');

// Find related studies for a publication
const related = await findRelatedOSDRStudies(
  'Bone Density Changes in Microgravity',
  'Mus musculus'
);

// Get studies by organism
const mouseStudies = await getOSDRStudiesByOrganism('Mus musculus');
```

**API Endpoints Used:**
- `https://osdr.nasa.gov/osdr/data/osd/meta/search` - Search studies
- `https://osdr.nasa.gov/osdr/data/osd/meta/{accession}` - Get study details

#### 2. **OSDR Panel Component** (`src/components/OSDRPanel.tsx`)

**Usage:**
```tsx
<OSDRPanel 
  publicationTitle="Effects of Microgravity on Bone"
  organism="Mus musculus"
/>
```

**Features:**
- ✅ Auto-search for related studies when publication selected
- ✅ Manual search capability
- ✅ Display study metadata (organism, assay types, dates)
- ✅ Direct links to OSDR data repository
- ✅ Assay type badges (transcriptomics, proteomics, etc.)

**Location:** Integrated into `DetailPanel` for publication nodes

#### 3. **Integration in Knowledge Graph**

When you select a **publication node** in the Knowledge Graph, the OSDR panel automatically:
1. Extracts key terms from publication title
2. Searches OSDR for related experimental data
3. Displays top 5 matching studies
4. Shows organism, experiment type, and data links

**Example Flow:**
```
User clicks publication: "Muscle Atrophy in Spaceflight"
  ↓
System extracts: "muscle atrophy spaceflight"
  ↓
OSDR API returns: 3 matching studies
  ↓
Display: OSD-123, OSD-456, OSD-789 with metadata
  ↓
User clicks: "View in OSDR" → Opens data portal
```

---

## 🔍 Automated Gap Analysis

### What is Gap Analysis?
Identifies under-studied organisms, research areas, methodologies, and environments in the 608-publication dataset.

### Features Implemented

#### 1. **Gap Analysis Service** (`src/services/gapAnalysisService.ts`)

```typescript
// Analyze all publications
const analysis = await analyzeResearchGaps(publications);

// Analyze specific research area
const areaGaps = await analyzeResearchAreaGaps(publications, 'Bone Biology');

// Analyze specific organism
const organismGaps = await analyzeOrganismGaps(publications, 'Homo sapiens');
```

**Analysis Categories:**
1. **Organism Gaps** - Under-studied species
2. **Research Area Gaps** - Under-funded topics
3. **Methodology Gaps** - Missing experimental approaches
4. **Duration Gaps** - Long vs short mission studies
5. **Environment Gaps** - LEO vs deep space

#### 2. **Gap Detection Logic**

**Organism Gaps:**
```typescript
Priority organisms checked:
- Homo sapiens (human research)
- Arabidopsis thaliana (plant biology)
- Caenorhabditis elegans (aging/muscle)
- Drosophila melanogaster (genetics)
- Mus musculus (mammalian model)

Severity:
- High: 0 studies or < 25% of average
- Medium: < 50% of average
- Low: < average but > 50%
```

**Research Area Gaps:**
```typescript
Critical areas with minimum expected studies:
- Radiation Biology: 30 studies minimum
- Bone Biology: 25 studies
- Cardiovascular: 20 studies
- Immunology: 20 studies
- Plant Biology: 25 studies
- Microbiology: 20 studies
```

**Methodology Gaps:**
- Longitudinal studies (6+ months)
- Multi-omics integration
- Systems biology approaches

**Duration Gaps:**
- Short-term (days/weeks) vs long-term (months/years)
- Critical for Mars missions (2+ years)

**Environment Gaps:**
- LEO (Low Earth Orbit)
- Deep space (beyond LEO)
- Lunar surface
- Mars transit/surface

#### 3. **Coverage Score Calculation**

```typescript
Score = 100 - (high_gaps * 10 + medium_gaps * 5)

Examples:
- 10 high gaps, 5 medium gaps = 100 - (100 + 25) = 0 (critical)
- 3 high gaps, 8 medium gaps = 100 - (30 + 40) = 30 (poor)
- 1 high gap, 5 medium gaps = 100 - (10 + 25) = 65 (moderate)
- 0 high gaps, 2 medium gaps = 100 - (0 + 10) = 90 (excellent)
```

#### 4. **AI-Powered Summary** (Galileo AI)

Uses Gemini Flash to generate a 3-paragraph summary:
1. **Overall assessment** of research coverage
2. **Most critical areas** needing attention
3. **Strategic recommendations** for future research

**Prompt Structure:**
```
Total Publications: 608
Critical Gaps (High): 7
Medium Priority Gaps: 12

Top 5 Gaps:
1. [HIGH] Under-studied: Homo sapiens
2. [HIGH] Limited Long-Duration Studies
3. [MEDIUM] Gap in Radiation Biology Research
...

Provide: Overall assessment, critical areas, recommendations
```

#### 5. **Gap Analysis View** (`src/components/GapAnalysisView.tsx`)

**Features:**
- ✅ Dashboard with total publications, gaps found, coverage score
- ✅ AI-generated summary
- ✅ Category filters (organism, research area, methodology, duration, environment)
- ✅ Color-coded severity badges (red=high, yellow=medium, blue=low)
- ✅ Evidence bullets for each gap
- ✅ Actionable recommendations
- ✅ Related publication counts

**Navigation:** Click "Gaps" tab in main navigation

**Layout:**
```
┌─────────────────────────────────────┐
│  Research Gap Analysis              │
│  [608 pubs] [20 gaps] [65% coverage]│
│  AI Summary: ...                    │
└─────────────────────────────────────┘

Filters: [All] [Organisms] [Areas] [Methods] [Duration] [Environment]

┌─────────────────────────────────────┐
│ 🦠 Under-studied: Homo sapiens  [HIGH]│
│ Only 15 studies found for humans    │
│ Evidence: • Current studies: 15     │
│           • Average: 42              │
│           • Deficit: 27 studies      │
│ Recommendations:                     │
│ → Increase human ISS experiments    │
│ → Leverage ground-based facilities  │
└─────────────────────────────────────┘
```

---

## 🎯 Use Cases

### For Scientists
```
1. Select research area in Knowledge Graph
2. Click "Gaps" tab
3. Filter by research area
4. Identify under-studied topics
5. Use recommendations for grant proposals
```

### For Managers
```
1. View Gap Analysis dashboard
2. Check coverage score (65%)
3. Review high-priority gaps (7 critical)
4. Read AI strategic recommendations
5. Allocate funding to gap areas
```

### For Mission Architects
```
1. Review "Duration Gaps" category
2. Identify: Only 15% long-duration studies
3. Action: Prioritize 6+ month ISS experiments
4. Cross-reference: Check OSDR for existing data
5. Plan: Design Mars mission protocols
```

---

## 📊 Technical Implementation

### Architecture

```
User Interface (React)
    ↓
App.tsx
    ↓
┌────────────────────┬────────────────────┐
│  GapAnalysisView   │  OSDRPanel         │
└────────┬───────────┴──────────┬─────────┘
         ↓                      ↓
┌────────────────────┬────────────────────┐
│ gapAnalysisService │  osdrService       │
└────────┬───────────┴──────────┬─────────┘
         ↓                      ↓
┌────────────────────┬────────────────────┐
│  Gemini AI API     │  OSDR REST API     │
│ (Summary generation)│ (Study search)    │
└────────────────────┴────────────────────┘
```

### Data Flow

**Gap Analysis:**
```typescript
1. Load 608 publications from processedPublications.ts
2. Calculate statistics (organisms, areas, years)
3. Compare against expected baselines
4. Identify gaps with severity levels
5. Send top gaps to Gemini AI
6. Display results with recommendations
```

**OSDR Integration:**
```typescript
1. User selects publication node
2. Extract title and organism from node
3. Search OSDR API with query
4. Parse JSON response
5. Display studies in OSDRPanel
6. Provide direct links to data portal
```

### API Response Formats

**OSDR Search Response:**
```json
{
  "hits": {
    "total": { "value": 127 },
    "hits": [
      {
        "_id": "OSD-123",
        "_source": {
          "accession": "OSD-123",
          "title": "Muscle Gene Expression in Spaceflight",
          "organism": ["Mus musculus"],
          "study_assay": {
            "assay_type": ["RNA-seq", "Proteomics"]
          },
          "release_date": "2023-05-15"
        }
      }
    ]
  }
}
```

**Gap Analysis Result:**
```json
{
  "gaps": [
    {
      "id": "organism-homo-sapiens",
      "category": "organism",
      "title": "Under-studied: Homo sapiens",
      "description": "Only 15 studies found...",
      "severity": "high",
      "evidence": ["Current: 15", "Average: 42"],
      "recommendations": ["Increase ISS experiments"],
      "relatedPublications": 15
    }
  ],
  "summary": "Research gap analysis identified...",
  "totalPublications": 608,
  "coverageScore": 65,
  "timestamp": "2025-10-04T19:30:00Z"
}
```

---

## 🚀 Future Enhancements

### OSDR
- [ ] GLOpenAPI programmatic access
- [ ] Download raw data files directly
- [ ] Visualization of omics data
- [ ] Integration with analysis pipelines
- [ ] Metadata export for citations

### Gap Analysis
- [ ] Temporal trend analysis (gaps over time)
- [ ] International collaboration gaps
- [ ] Funding correlation analysis
- [ ] Predictive gap modeling
- [ ] Export gaps as CSV/PDF reports

### Integration
- [ ] Link OSDR studies to publications
- [ ] Cross-reference Task Book grants
- [ ] Space Life Sciences Library integration
- [ ] Automated gap monitoring dashboard
- [ ] Email alerts for new OSDR data in gap areas

---

## 📝 Code Examples

### Using OSDR Service

```typescript
import { searchOSDRStudies, findRelatedOSDRStudies } from './services/osdrService';

// Basic search
const results = await searchOSDRStudies('radiation', 20);
console.log(`Found ${results.total} studies`);
results.studies.forEach(study => {
  console.log(`${study.accession}: ${study.title}`);
});

// Find related studies
const related = await findRelatedOSDRStudies(
  'Radiation-Induced DNA Damage in Space',
  'Homo sapiens'
);
console.log(`Found ${related.length} related studies`);
```

### Using Gap Analysis Service

```typescript
import { analyzeResearchGaps } from './services/gapAnalysisService';
import { getPublications } from './data/processedPublications';

// Run full analysis
const pubs = await getPublications();
const analysis = await analyzeResearchGaps(pubs);

console.log(`Coverage Score: ${analysis.coverageScore}%`);
console.log(`High Priority Gaps: ${analysis.gaps.filter(g => g.severity === 'high').length}`);

// Filter by category
const organismGaps = analysis.gaps.filter(g => g.category === 'organism');
organismGaps.forEach(gap => {
  console.log(`${gap.title} - ${gap.severity}`);
  gap.recommendations.forEach(rec => console.log(`  → ${rec}`));
});
```

### Custom Gap Detection

```typescript
// Add custom gap detection logic
function detectCustomGaps(publications: PublicationWithTags[]): ResearchGap[] {
  const gaps: ResearchGap[] = [];
  
  // Example: Check for lack of female subject studies
  const femaleKeywords = ['female', 'women', 'sex differences'];
  const femaleStudies = publications.filter(pub =>
    femaleKeywords.some(kw => pub.abstract?.toLowerCase().includes(kw))
  );
  
  if (femaleStudies.length < publications.length * 0.15) {
    gaps.push({
      id: 'sex-bias',
      category: 'methodology',
      title: 'Sex Bias in Research',
      description: `Only ${femaleStudies.length} studies include female subjects`,
      severity: 'high',
      evidence: [`Female studies: ${femaleStudies.length}`, 'Expected: >15%'],
      recommendations: ['Mandate sex-balanced study designs'],
    });
  }
  
  return gaps;
}
```

---

## 🎓 Educational Value

### For Students
- Understand research landscape analysis
- Learn about space biology priorities
- Identify PhD research opportunities
- Discover under-explored topics

### For Researchers
- Find funding opportunities (gaps = opportunities)
- Avoid over-saturated areas
- Plan collaborative studies
- Access raw OSDR data for meta-analysis

### For Educators
- Teach systematic review methods
- Demonstrate AI-powered research tools
- Show real-world NASA data
- Guide capstone projects

---

## ✅ Testing

### OSDR Integration
1. Click publication node in Knowledge Graph
2. Verify OSDR Panel loads
3. Check auto-search returns results
4. Test manual search functionality
5. Click "View in OSDR" link
6. Verify correct accession opens

### Gap Analysis
1. Navigate to "Gaps" tab
2. Wait for analysis to complete
3. Verify 608 publications analyzed
4. Check coverage score calculation
5. Test category filters
6. Read AI-generated summary
7. Verify evidence bullets and recommendations

### Error Handling
- OSDR API timeout → Show "No studies found"
- Gemini AI failure → Show fallback summary
- Empty publications → Show loading state
- Network errors → Retry button

---

## 📚 References

- [NASA OSDR Homepage](https://osdr.nasa.gov/)
- [OSDR API Documentation](https://osdr.nasa.gov/bio/api/)
- [GeneLab Data System](https://genelab.nasa.gov/)
- [Space Life Sciences Library](https://lsda.jsc.nasa.gov/)
- [NASA Task Book](https://taskbook.nasaprs.com/)

---

**Status:** ✅ Fully Implemented and Integrated
**Version:** 1.0.0
**Last Updated:** October 4, 2025
