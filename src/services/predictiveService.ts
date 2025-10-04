import { PredictPayload, ForecastResult, ValidationResult, HealthRisk } from '../types/dataTypes';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com' 
  : 'http://localhost:9000';

// Initialize Gemini API for direct JSON responses
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Get health risk forecast based on mission parameters
 */
export async function getForecast(payload: PredictPayload): Promise<ForecastResult> {
  console.log('🚀 getForecast called with payload:', payload);
  try {
    console.log('📡 Attempting API call to:', `${API_BASE_URL}/api/predict`);
    const response = await fetch(`${API_BASE_URL}/api/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API call successful, data:', data);
    
    // Transform server response to match our interface
    return {
      predictions: data.predictions || generateMockPredictions(payload),
      confidence: data.confidence || { lower: [], upper: [] },
      meta: {
        model: data.modelUsed || 'heuristic',
        runId: data.runId || generateRunId()
      },
      risks: data.risks || [],
      forecastExplanation: data.forecastExplanation,
      modelUsed: data.modelUsed,
      timestamp: data.timestamp
    };
  } catch (error) {
    console.warn('⚠️ API call failed, using Gemini AI fallback:', error);
    const geminiResult = await generateGeminiForecast(payload);
    console.log('✅ Gemini forecast generated:', geminiResult);
    return geminiResult;
  }
}

/**
 * Validate prediction payload before sending to API
 */
export async function validatePayload(payload: PredictPayload): Promise<ValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validation
  if (!payload.input) {
    errors.push('Input object is required');
    return { isValid: false, errors, warnings };
  }

  if (!payload.input.durationDays || payload.input.durationDays <= 0) {
    errors.push('Duration must be a positive number');
  }

  if (!payload.input.gravity || payload.input.gravity < 0 || payload.input.gravity > 1) {
    errors.push('Gravity must be between 0 and 1');
  }

  if (!payload.input.subject) {
    errors.push('Subject information is required');
  } else {
    if (!payload.input.subject.age || payload.input.subject.age < 18 || payload.input.subject.age > 70) {
      warnings.push('Age should typically be between 18-70 for space missions');
    }

    if (!payload.input.subject.bmi || payload.input.subject.bmi < 18 || payload.input.subject.bmi > 30) {
      warnings.push('BMI outside typical astronaut range (18-30)');
    }

    if (!['low', 'moderate', 'high'].includes(payload.input.subject.activityLevel || '')) {
      errors.push('Activity level must be "low", "moderate", or "high"');
    }
  }

  // Mission-specific warnings
  if (payload.input.durationDays > 365) {
    warnings.push('Mission duration exceeds typical current capabilities');
  }

  if (payload.input.gravity === 0 && payload.input.durationDays > 180) {
    warnings.push('Extended microgravity exposure increases health risks significantly');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Generate AI-powered forecast using Gemini
 */
async function generateGeminiForecast(payload: PredictPayload): Promise<ForecastResult> {
  try {
    const { durationDays, gravity, subject } = payload.input;
    const contextNotes = payload.contextNotes?.join(', ') || 'none';
    
    // Build a detailed prompt for Gemini
    const prompt = `You are an expert space medicine physician analyzing health risks for an upcoming space mission. 

Mission Parameters:
- Duration: ${durationDays} days
- Gravity Environment: ${gravity || 0}g (${!gravity || gravity === 0 ? 'Microgravity' : gravity < 0.4 ? 'Low gravity (e.g., Mars)' : 'Partial gravity'})
- Astronaut Age: ${subject?.age || 'Unknown'} years
- BMI: ${subject?.bmi || 'Unknown'}
- Physical Activity Level: ${subject?.activityLevel || 'moderate'}
- Context Notes: ${contextNotes}

Based on these mission parameters and current space medicine research, provide a comprehensive health risk assessment. Analyze the following critical health risks:

1. **Bone Density Loss**: Calculate probability based on gravity level, duration, age, and BMI
2. **Muscle Atrophy**: Assess risk considering gravity, activity level, and mission duration
3. **Cardiovascular Deconditioning**: Evaluate heart and circulation adaptation risks
4. **Radiation Exposure**: For missions beyond LEO or extended duration
5. **Psychological Stress**: Consider isolation, confinement, and mission demands

For each risk, provide:
- Probability (0.0 to 1.0)
- Confidence level (0.0 to 1.0)
- Specific notes and recommendations

Also generate a weekly health risk progression forecast showing how overall health risk increases over the mission duration.

Return your analysis in the following JSON format:
{
  "risks": [
    {
      "id": "bone_loss",
      "name": "Bone density loss",
      "probability": 0.15,
      "confidence": 0.85,
      "notes": "Detailed explanation..."
    }
  ],
  "weeklyProgression": [
    { "week": 1, "riskLevel": 0.05 },
    { "week": 2, "riskLevel": 0.08 }
  ],
  "overallAssessment": "Summary of mission health outlook",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Provide scientifically grounded analysis based on NASA research and space medicine literature.`;

    // Call Gemini AI with JSON mode
    console.log('🤖 Calling Gemini AI for mission forecast...');
    
    const model = genAI.getGenerativeModel({ 
      model: 'models/gemini-flash-lite-latest',
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();
    
    console.log('✅ Gemini response received');
    console.log('📄 Raw response:', responseText);
    
    // Parse the JSON response
    let aiAnalysis;
    try {
      // Remove markdown code fences if present
      let cleanedResponse = responseText.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      aiAnalysis = JSON.parse(cleanedResponse);
      console.log('✅ Parsed AI analysis:', aiAnalysis);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError);
      console.log('📄 Raw response text:', responseText.substring(0, 500));
      // If parsing fails, create a structured response from the text
      aiAnalysis = {
        risks: extractRisksFromText(responseText),
        weeklyProgression: [],
        overallAssessment: responseText.substring(0, 500),
        recommendations: []
      };
    }
    
    // Convert weekly progression to predictions format
    const predictions = [];
    const startDate = new Date();
    
    if (aiAnalysis.weeklyProgression && aiAnalysis.weeklyProgression.length > 0) {
      aiAnalysis.weeklyProgression.forEach((weekData: any) => {
        const date = new Date(startDate.getTime() + (weekData.week - 1) * 7 * 24 * 60 * 60 * 1000);
        predictions.push({
          timestamp: date.toISOString(),
          value: weekData.riskLevel || 0.1
        });
      });
    } else {
      // Generate default progression if AI didn't provide it
      const weeks = Math.ceil(durationDays / 7);
      for (let week = 0; week < weeks; week++) {
        const date = new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
        const baseRisk = 0.05 + (week / weeks) * 0.15;
        predictions.push({
          timestamp: date.toISOString(),
          value: baseRisk
        });
      }
    }
    
    // Format risks
    const risks: HealthRisk[] = aiAnalysis.risks.map((risk: any) => ({
      id: risk.id || 'unknown',
      name: risk.name || 'Unknown Risk',
      probability: Math.max(0, Math.min(1, risk.probability || 0.1)),
      confidence: Math.max(0, Math.min(1, risk.confidence || 0.7)),
      notes: risk.notes || ''
    }));
    
    // Build the forecast result
    return {
      predictions,
      confidence: {
        lower: predictions.map(p => p.value * 0.85),
        upper: predictions.map(p => p.value * 1.15)
      },
      meta: {
        model: 'Galileo AI',
        runId: generateRunId()
      },
      risks,
      forecastExplanation: aiAnalysis.overallAssessment || 'AI-powered health risk assessment based on mission parameters and space medicine research.',
      modelUsed: 'Galileo AI',
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Gemini forecast generation failed:', error);
    // Fallback to heuristic if Gemini fails
    return generateHeuristicForecast(payload);
  }
}

/**
 * Extract risks from unstructured text response
 */
function extractRisksFromText(text: string): any[] {
  const commonRisks = [
    { id: 'bone_loss', name: 'Bone density loss', keywords: ['bone', 'density', 'osteo'] },
    { id: 'muscle_atrophy', name: 'Muscle atrophy', keywords: ['muscle', 'atrophy', 'sarcopenia'] },
    { id: 'cardiovascular', name: 'Cardiovascular deconditioning', keywords: ['cardio', 'heart', 'circulation'] },
    { id: 'radiation', name: 'Radiation exposure', keywords: ['radiation', 'cosmic', 'solar'] },
    { id: 'psychological', name: 'Psychological stress', keywords: ['psycho', 'mental', 'stress', 'isolation'] }
  ];
  
  return commonRisks.map(risk => {
    const hasKeyword = risk.keywords.some(kw => text.toLowerCase().includes(kw));
    return {
      id: risk.id,
      name: risk.name,
      probability: hasKeyword ? 0.15 : 0.05,
      confidence: 0.6,
      notes: `Identified from AI analysis${hasKeyword ? ' - mentioned in assessment' : ''}`
    };
  });
}

/**
 * Generate heuristic forecast when API is unavailable
 */
function generateHeuristicForecast(payload: PredictPayload): ForecastResult {
  const risks = calculateHeuristicRisks(payload);
  const predictions = generateMockPredictions(payload);
  
  return {
    predictions,
    confidence: {
      lower: predictions.map(p => p.value * 0.8),
      upper: predictions.map(p => p.value * 1.2)
    },
    meta: {
      model: 'Galileo AI (Fallback)',
      runId: generateRunId()
    },
    risks,
    forecastExplanation: 'This forecast uses Galileo AI heuristic models based on published space medicine research data.',
    modelUsed: 'Galileo AI (Fallback)',
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate health risks using heuristic rules
 */
function calculateHeuristicRisks(payload: PredictPayload): HealthRisk[] {
  const { durationDays, gravity = 0, subject } = payload.input;
  const risks: HealthRisk[] = [];

  // Bone density loss risk
  let boneLossProb = 0.02; // Base 2% risk
  if (gravity < 0.5) boneLossProb += 0.05; // Microgravity increases risk
  if (durationDays > 90) boneLossProb += 0.03; // Long duration increases risk
  if (subject && subject.age && subject.age > 45) boneLossProb += 0.02; // Age increases risk
  
  risks.push({
    id: 'bone_loss',
    name: 'Bone density loss',
    probability: Math.min(boneLossProb, 0.25), // Cap at 25%
    confidence: 0.7,
    notes: 'Risk increases with mission duration and lower gravity environments'
  });

  // Muscle atrophy risk
  let muscleAtrophyProb = 0.03;
  if (gravity < 0.5) muscleAtrophyProb += 0.04;
  if (subject && subject.activityLevel === 'low') muscleAtrophyProb += 0.03;
  if (durationDays > 60) muscleAtrophyProb += 0.02;
  
  risks.push({
    id: 'muscle_atrophy',
    name: 'Muscle atrophy',
    probability: Math.min(muscleAtrophyProb, 0.3),
    confidence: 0.7,
    notes: 'Rapid onset in microgravity; exercise countermeasures critical'
  });

  // Cardiovascular deconditioning
  let cardioProb = 0.015;
  if (gravity < 0.2) cardioProb += 0.04;
  if (subject && subject.age && subject.age > 40) cardioProb += 0.015;
  if (durationDays > 120) cardioProb += 0.02;
  
  risks.push({
    id: 'cardiovascular',
    name: 'Cardiovascular deconditioning',
    probability: Math.min(cardioProb, 0.2),
    confidence: 0.65,
    notes: 'Affects orthostatic tolerance and exercise capacity upon return'
  });

  // Radiation exposure (space missions only)
  if (gravity < 0.5) {
    let radiationProb = 0.01;
    if (durationDays > 180) radiationProb += 0.02;
    if (durationDays > 365) radiationProb += 0.03;
    
    risks.push({
      id: 'radiation',
      name: 'Radiation exposure effects',
      probability: Math.min(radiationProb, 0.15),
      confidence: 0.6,
      notes: 'Long-term cancer risk and acute radiation syndrome potential'
    });
  }

  // Psychological stress
  let psychProb = 0.05;
  if (durationDays > 180) psychProb += 0.03;
  if (gravity < 0.1) psychProb += 0.02; // Deep space isolation
  
  risks.push({
    id: 'psychological',
    name: 'Psychological stress',
    probability: Math.min(psychProb, 0.25),
    confidence: 0.5,
    notes: 'Isolation, confinement, and stress from mission demands'
  });

  return risks.sort((a, b) => b.probability - a.probability);
}

/**
 * Generate mock prediction time series
 */
function generateMockPredictions(payload: PredictPayload) {
  const { durationDays } = payload.input;
  const predictions = [];
  const startDate = new Date();
  
  // Generate weekly data points
  const weeks = Math.ceil(durationDays / 7);
  for (let week = 0; week < weeks; week++) {
    const date = new Date(startDate.getTime() + week * 7 * 24 * 60 * 60 * 1000);
    const baseRisk = 0.1 + (week / weeks) * 0.2; // Risk increases over time
    const noise = (Math.random() - 0.5) * 0.05; // Add some variation
    
    predictions.push({
      timestamp: date.toISOString(),
      value: Math.max(0, baseRisk + noise)
    });
  }
  
  return predictions;
}

/**
 * Generate a unique run ID
 */
function generateRunId(): string {
  return 'run_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

/**
 * Test payload helper for development
 */
export function createTestPayload(): PredictPayload {
  return {
    input: {
      durationDays: 180,
      gravity: 0.38,
      subject: {
        age: 35,
        bmi: 24,
        activityLevel: 'moderate'
      }
    },
    contextNotes: ['bone_loss', 'limited_exercise_facility']
  };
}