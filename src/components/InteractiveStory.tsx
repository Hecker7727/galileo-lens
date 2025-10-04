import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle, PlayCircle, Settings, BarChart3 } from 'lucide-react';
import { StoryDefinition, PredictPayload } from '../types/dataTypes';
import { getForecast } from '../services/predictiveService';

interface InteractiveStoryProps {
  story: StoryDefinition;
  onChoice?: (choiceId: string) => void;
}

export default function InteractiveStory({ story, onChoice }: InteractiveStoryProps) {
  const [currentStepId, setCurrentStepId] = useState(story.steps[0]?.id || '');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [missionConfig, setMissionConfig] = useState<PredictPayload>({
    input: {
      durationDays: 180,
      gravity: 0.38,
      subject: {
        age: 35,
        bmi: 24,
        activityLevel: 'moderate'
      }
    },
    contextNotes: []
  });
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const currentStep = story.steps.find(step => step.id === currentStepId);
  const currentStepIndex = story.steps.findIndex(step => step.id === currentStepId);
  const progress = ((currentStepIndex + 1) / story.steps.length) * 100;

  const handleNext = (nextStepId?: string) => {
    if (currentStep && !completedSteps.includes(currentStep.id)) {
      setCompletedSteps(prev => [...prev, currentStep.id]);
    }

    if (nextStepId) {
      setCurrentStepId(nextStepId);
    } else if (currentStep?.nextStep) {
      setCurrentStepId(currentStep.nextStep);
    }
  };

  const handleChoice = (choiceId: string) => {
    const choice = currentStep?.choices?.find(c => c.id === choiceId);
    if (choice) {
      onChoice?.(choiceId);
      handleNext(choice.nextStep);
    }
  };

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    try {
      console.log('🎬 Running simulation...');
      const result = await getForecast(missionConfig);
      console.log('✅ Got forecast result:', result);
      setSimulationResult(result);
      console.log('✅ Set simulation result, moving to next step');
      handleNext();
    } catch (error) {
      console.error('❌ Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const renderStepContent = () => {
    if (!currentStep) return null;

    console.log('🎨 Rendering step:', currentStep.id, 'type:', currentStep.type, 'hasResults:', !!simulationResult);

    switch (currentStep.type) {
      case 'info':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">{currentStep.content}</p>
            
            {/* Show simulation results if available and we're on the results step */}
            {simulationResult && currentStep.id === 'results' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Simulation Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Model: {simulationResult.modelUsed}</p>
                    {simulationResult.timestamp && (
                      <p>Generated: {new Date(simulationResult.timestamp).toLocaleString()}</p>
                    )}
                  </div>
                  
                  {simulationResult.forecastExplanation && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{simulationResult.forecastExplanation}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-medium">Identified Health Risks:</h4>
                    {simulationResult.risks?.map((risk: any) => (
                      <div key={risk.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <span className="font-medium">{risk.name}</span>
                          {risk.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{risk.notes}</p>
                          )}
                        </div>
                        <Badge variant={risk.probability > 0.1 ? 'destructive' : 'secondary'}>
                          {(risk.probability * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {!currentStep.nextStep && (
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200">Mission simulation completed successfully!</span>
              </div>
            )}
            
            {currentStep.nextStep && (
              <Button onClick={() => handleNext()}>
                Continue
              </Button>
            )}
          </div>
        );

      case 'choice':
        return (
          <div className="space-y-4">
            <p className="text-muted-foreground">{currentStep.content}</p>
            <div className="grid gap-2">
              {currentStep.choices?.map(choice => (
                <Button
                  key={choice.id}
                  variant="outline"
                  onClick={() => handleChoice(choice.id)}
                  className="justify-start"
                >
                  {choice.text}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'input':
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">{currentStep.content}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Mission Duration (days)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={missionConfig.input.durationDays}
                  onChange={(e) => setMissionConfig(prev => ({
                    ...prev,
                    input: { ...prev.input, durationDays: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="gravity">Gravity Environment</Label>
                <Select
                  value={(missionConfig.input.gravity || 0).toString()}
                  onValueChange={(value: string) => setMissionConfig(prev => ({
                    ...prev,
                    input: { ...prev.input, gravity: parseFloat(value) }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Microgravity (ISS)</SelectItem>
                    <SelectItem value="0.16">Lunar Gravity</SelectItem>
                    <SelectItem value="0.38">Mars Gravity</SelectItem>
                    <SelectItem value="1">Earth Gravity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="age">Crew Member Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={missionConfig.input.subject?.age || 0}
                  onChange={(e) => setMissionConfig(prev => ({
                    ...prev,
                    input: { 
                      ...prev.input, 
                      subject: { ...prev.input.subject, age: parseInt(e.target.value) || 0 }
                    }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={missionConfig.input.subject?.bmi || 0}
                  onChange={(e) => setMissionConfig(prev => ({
                    ...prev,
                    input: { 
                      ...prev.input, 
                      subject: { ...prev.input.subject, bmi: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                />
              </div>
              
              <div>
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={missionConfig.input.subject?.activityLevel || 'moderate'}
                  onValueChange={(value: 'low' | 'moderate' | 'high') => setMissionConfig(prev => ({
                    ...prev,
                    input: { 
                      ...prev.input, 
                      subject: { ...prev.input.subject, activityLevel: value }
                    }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="context">Mission Focus Areas (optional)</Label>
              <Textarea
                id="context"
                placeholder="e.g., bone health, cardiovascular, psychological stress..."
                onChange={(e) => setMissionConfig(prev => ({
                  ...prev,
                  contextNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
              />
            </div>

            <Button onClick={() => handleNext()}>
              <Settings className="mr-2 h-4 w-4" />
              Configure Mission
            </Button>
          </div>
        );

      case 'simulation':
        return (
          <div className="space-y-6">
            <p className="text-muted-foreground">{currentStep.content}</p>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Mission Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Duration:</span> {missionConfig.input.durationDays} days
                  </div>
                  <div>
                    <span className="font-medium">Gravity:</span> {missionConfig.input.gravity || 0}g
                  </div>
                  <div>
                    <span className="font-medium">Subject Age:</span> {missionConfig.input.subject?.age || 0} years
                  </div>
                  <div>
                    <span className="font-medium">BMI:</span> {missionConfig.input.subject?.bmi || 0}
                  </div>
                </div>
                
                {missionConfig.contextNotes && missionConfig.contextNotes.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Focus Areas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {missionConfig.contextNotes.map((note, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {note}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleRunSimulation} 
              disabled={isSimulating}
              className="w-full"
            >
              {isSimulating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Running Health Risk Simulation...
                </>
              ) : (
                <>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Run Health Risk Simulation
                </>
              )}
            </Button>
          </div>
        );

        default:
          return (
            <div className="space-y-4">
              <p className="text-muted-foreground">{currentStep.content}</p>
              
              {simulationResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Simulation Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      <p>Model: {simulationResult.modelUsed}</p>
                      <p>Generated: {new Date(simulationResult.timestamp).toLocaleString()}</p>
                    </div>
                    
                    {simulationResult.forecastExplanation && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{simulationResult.forecastExplanation}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium">Identified Health Risks:</h4>
                      {simulationResult.risks?.map((risk: any) => (
                        <div key={risk.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="font-medium">{risk.name}</span>
                            {risk.notes && (
                              <p className="text-xs text-muted-foreground mt-1">{risk.notes}</p>
                            )}
                          </div>
                          <Badge variant={risk.probability > 0.1 ? 'destructive' : 'secondary'}>
                            {(risk.probability * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 dark:text-green-200">Mission simulation completed successfully!</span>
              </div>
            </div>
          );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2>{story.title}</h2>
        <p className="text-muted-foreground">{story.description}</p>
        <Progress value={progress} className="w-full max-w-md mx-auto" />
        <p className="text-sm text-muted-foreground">
          Step {currentStepIndex + 1} of {story.steps.length}
        </p>
      </div>

      {/* Current Step */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {completedSteps.includes(currentStep?.id || '') && (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            {currentStep?.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      <div className="flex justify-center space-x-2">
        {story.steps.map((step, index) => (
          <div
            key={step.id}
            className={`w-3 h-3 rounded-full transition-colors ${
              completedSteps.includes(step.id)
                ? 'bg-green-500'
                : step.id === currentStepId
                ? 'bg-blue-500'
                : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
}