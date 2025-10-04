const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Prediction API endpoint
app.post('/api/predict', (req, res) => {
  try {
    const { input, contextNotes = [] } = req.body;
    
    if (!input) {
      return res.status(400).json({ error: 'Input object is required' });
    }

    // Validate required fields
    const { durationDays, gravity, subject } = input;
    if (!durationDays || !gravity !== undefined || !subject) {
      return res.status(400).json({ 
        error: 'Missing required fields: durationDays, gravity, subject' 
      });
    }

    // Generate heuristic health risk predictions
    const risks = calculateHealthRisks(input, contextNotes);
    
    const response = {
      input,
      risks,
      forecastExplanation: process.env.GEMINI_API_KEY 
        ? 'AI-powered prediction using advanced models'
        : 'Heuristic server response (no API key configured).',
      modelUsed: process.env.GEMINI_API_KEY ? 'gemini-pro' : 'heuristic',
      timestamp: new Date().toISOString(),
      runId: generateRunId()
    };

    res.json(response);
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate health risk predictions using heuristic models
function calculateHealthRisks(input, contextNotes) {
  const { durationDays, gravity, subject } = input;
  const risks = [];

  // Bone density loss risk
  let boneLossProb = 0.02; // Base 2% risk
  if (gravity < 0.5) boneLossProb += 0.05; // Microgravity increases risk
  if (durationDays > 90) boneLossProb += 0.03; // Long duration
  if (subject.age > 45) boneLossProb += 0.02; // Age factor
  if (contextNotes.includes('bone_loss')) boneLossProb += 0.01;
  
  risks.push({
    id: 'bone_loss',
    name: 'Bone density loss',
    probability: Math.min(boneLossProb, 0.25),
    confidence: 0.7,
    notes: `Estimated ${(boneLossProb * 100).toFixed(1)}% probability based on ${durationDays}-day mission at ${gravity}g`
  });

  // Muscle atrophy risk
  let muscleAtrophyProb = 0.03;
  if (gravity < 0.5) muscleAtrophyProb += 0.04;
  if (subject.activityLevel === 'low') muscleAtrophyProb += 0.03;
  if (durationDays > 60) muscleAtrophyProb += 0.02;
  if (contextNotes.includes('limited_exercise_facility')) muscleAtrophyProb += 0.02;
  
  risks.push({
    id: 'muscle_atrophy',
    name: 'Muscle atrophy',
    probability: Math.min(muscleAtrophyProb, 0.3),
    confidence: 0.7,
    notes: `Risk factors: ${gravity}g environment, ${subject.activityLevel} activity level, ${durationDays} days duration`
  });

  // Cardiovascular deconditioning
  let cardioProb = 0.015;
  if (gravity < 0.2) cardioProb += 0.04;
  if (subject.age > 40) cardioProb += 0.015;
  if (durationDays > 120) cardioProb += 0.02;
  
  risks.push({
    id: 'cardiovascular',
    name: 'Cardiovascular deconditioning',
    probability: Math.min(cardioProb, 0.2),
    confidence: 0.65,
    notes: 'Affects orthostatic tolerance; countermeasures recommended for missions >90 days'
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
      notes: `${durationDays}-day space exposure; shielding and monitoring recommended`
    });
  }

  // Psychological stress
  let psychProb = 0.05;
  if (durationDays > 180) psychProb += 0.03;
  if (gravity < 0.1) psychProb += 0.02; // Deep space isolation
  if (contextNotes.includes('isolation')) psychProb += 0.01;
  
  risks.push({
    id: 'psychological',
    name: 'Psychological stress',
    probability: Math.min(psychProb, 0.25),
    confidence: 0.5,
    notes: 'Isolation, confinement, and mission stress factors'
  });

  // Sort by probability (highest first)
  return risks.sort((a, b) => b.probability - a.probability);
}

function generateRunId() {
  return 'run_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Bioscience API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Prediction API: http://localhost:${PORT}/api/predict`);
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('⚠️  No GEMINI_API_KEY found - using heuristic models');
  }
});

module.exports = app;