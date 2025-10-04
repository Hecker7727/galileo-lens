import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Download, Play, AlertTriangle, TrendingUp, Activity, Zap, Rocket, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { ForecastResult, PredictPayload } from '../types/dataTypes';
import { getForecast } from '../services/predictiveService';

interface ForecastViewProps {
  forecast: ForecastResult | null;
  onExport?: () => void;
}

export default function ForecastView({ forecast: initialForecast, onExport }: ForecastViewProps) {
  const [forecast, setForecast] = useState<ForecastResult | null>(initialForecast);
  const [isLoading, setIsLoading] = useState(false);
  const [payload, setPayload] = useState<PredictPayload>({
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

  const handleRunForecast = async () => {
    setIsLoading(true);
    try {
      const result = await getForecast(payload);
      setForecast(result);
    } catch (error) {
      console.error('Forecast failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportResults = () => {
    if (!forecast) return;

    // Create comprehensive export data
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        modelUsed: forecast.modelUsed,
        forecastTimestamp: forecast.timestamp,
      },
      missionConfiguration: {
        durationDays: payload.input.durationDays,
        gravityLevel: payload.input.gravity,
        subject: payload.input.subject,
        contextNotes: payload.contextNotes,
      },
      forecastExplanation: forecast.forecastExplanation,
      risks: forecast.risks?.map(risk => ({
        id: risk.id,
        name: risk.name,
        probability: risk.probability,
        probabilityPercentage: `${(risk.probability * 100).toFixed(2)}%`,
        notes: risk.notes,
      })) || [],
      predictions: forecast.predictions.map((pred, index) => ({
        timestamp: pred.timestamp,
        date: new Date(pred.timestamp).toLocaleString(),
        value: pred.value,
        confidenceLower: forecast.confidence.lower[index],
        confidenceUpper: forecast.confidence.upper[index],
      })),
      confidence: forecast.confidence,
    };

    // Convert to JSON string with pretty formatting
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create blob and download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasa-forecast-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also trigger the parent export if provided
    if (onExport) {
      onExport();
    }
  };

  const handleExportCSV = () => {
    if (!forecast) return;

    // Create CSV header
    let csv = 'Date,Value,Confidence Lower,Confidence Upper\n';
    
    // Add prediction data
    forecast.predictions.forEach((pred, index) => {
      const date = new Date(pred.timestamp).toLocaleString();
      const lower = forecast.confidence.lower[index] || 0;
      const upper = forecast.confidence.upper[index] || 0;
      csv += `"${date}",${pred.value},${lower},${upper}\n`;
    });

    // Add risks section
    csv += '\n\nRisk Assessment\n';
    csv += 'Risk Name,Probability,Probability %,Notes\n';
    forecast.risks?.forEach(risk => {
      csv += `"${risk.name}",${risk.probability},${(risk.probability * 100).toFixed(2)}%,"${risk.notes || ''}"\n`;
    });

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasa-forecast-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportText = () => {
    if (!forecast) return;

    // Create formatted text report
    let text = '='.repeat(60) + '\n';
    text += 'NASA GALILEO LENSES - FORECAST REPORT\n';
    text += '='.repeat(60) + '\n\n';
    
    text += `Generated: ${new Date().toLocaleString()}\n`;
    text += `Model: ${forecast.modelUsed}\n\n`;
    
    text += 'MISSION CONFIGURATION\n';
    text += '-'.repeat(60) + '\n';
    text += `Duration: ${payload.input.durationDays} days\n`;
    text += `Gravity Level: ${payload.input.gravity}g\n`;
    text += `Subject Age: ${payload.input.subject?.age || 'N/A'}\n`;
    text += `Subject BMI: ${payload.input.subject?.bmi || 'N/A'}\n`;
    text += `Activity Level: ${payload.input.subject?.activityLevel || 'N/A'}\n\n`;
    
    if (forecast.forecastExplanation) {
      text += 'FORECAST EXPLANATION\n';
      text += '-'.repeat(60) + '\n';
      text += forecast.forecastExplanation + '\n\n';
    }
    
    text += 'HEALTH RISK ASSESSMENT\n';
    text += '-'.repeat(60) + '\n';
    forecast.risks?.forEach(risk => {
      text += `\n${risk.name}:\n`;
      text += `  Probability: ${(risk.probability * 100).toFixed(2)}%\n`;
      if (risk.notes) {
        text += `  Notes: ${risk.notes}\n`;
      }
    });
    
    text += '\n\nPREDICTION DATA\n';
    text += '-'.repeat(60) + '\n';
    forecast.predictions.forEach((pred, index) => {
      const date = new Date(pred.timestamp).toLocaleString();
      const lower = forecast.confidence.lower[index] || 0;
      const upper = forecast.confidence.upper[index] || 0;
      text += `${date}: ${pred.value.toFixed(4)} (CI: ${lower.toFixed(4)} - ${upper.toFixed(4)})\n`;
    });

    // Create blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nasa-forecast-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartData = forecast?.predictions.map((pred, index) => ({
    timestamp: new Date(pred.timestamp).toLocaleDateString(),
    value: pred.value,
    lower: forecast.confidence.lower[index] || pred.value * 0.8,
    upper: forecast.confidence.upper[index] || pred.value * 1.2
  })) || [];

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Rocket className="h-6 w-6 text-primary" />
              </motion.div>
              Mission Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Mission Duration (days)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={payload.input.durationDays}
                  onChange={(e) => setPayload(prev => ({
                    ...prev,
                    input: { ...prev.input, durationDays: parseInt(e.target.value) || 0 }
                  }))}
                  className="mt-1.5"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Label htmlFor="gravity" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Gravity Level
                </Label>
                <Select
                  value={payload.input.gravity?.toString() || "0.38"}
                  onValueChange={(value: string) => setPayload(prev => ({
                    ...prev,
                    input: { ...prev.input, gravity: parseFloat(value) }
                  }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">🌌 Microgravity (0g)</SelectItem>
                    <SelectItem value="0.16">🌙 Moon (0.16g)</SelectItem>
                    <SelectItem value="0.38">🔴 Mars (0.38g)</SelectItem>
                    <SelectItem value="1">🌍 Earth (1g)</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="age">Subject Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={payload.input.subject?.age || 35}
                  onChange={(e) => setPayload(prev => ({
                    ...prev,
                    input: { 
                      ...prev.input, 
                      subject: { ...prev.input.subject!, age: parseInt(e.target.value) || 0 }
                    }
                  }))}
                  className="mt-1.5"
                />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="bmi">BMI</Label>
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  value={payload.input.subject?.bmi || 24}
                  onChange={(e) => setPayload(prev => ({
                    ...prev,
                    input: { 
                      ...prev.input, 
                      subject: { ...prev.input.subject!, bmi: parseFloat(e.target.value) || 0 }
                    }
                  }))}
                  className="mt-1.5"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="activity">Activity Level</Label>
                <Select
                  value={payload.input.subject?.activityLevel || 'moderate'}
                  onValueChange={(value: 'low' | 'moderate' | 'high') => setPayload(prev => ({
                    ...prev,
                    input: { 
                      ...prev.input, 
                      subject: { ...prev.input.subject!, activityLevel: value }
                    }
                  }))}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Label htmlFor="notes">Additional Context (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Enter any additional context or concerns..."
                onChange={(e) => setPayload(prev => ({
                  ...prev,
                  contextNotes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                }))}
                className="mt-1.5"
              />
            </motion.div>

            <motion.div 
              className="flex gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Button 
                onClick={handleRunForecast} 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      className="mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Simulation
                  </>
                )}
              </Button>
              {forecast && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-2"
                >
                  <Button 
                    variant="outline" 
                    onClick={handleExportResults}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20"
                  >
                    <FileJson className="mr-2 h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportCSV}
                    className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20"
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleExportText}
                    className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Export TXT
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {forecast && (
          <>
            {/* Health Risk Assessment */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="border-2 border-amber-500/30 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    </motion.div>
                    Health Risk Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Model: {forecast.modelUsed}
                      </span>
                      <span>Generated: {new Date(forecast.timestamp || Date.now()).toLocaleString()}</span>
                    </div>
                    
                    {forecast.forecastExplanation && (
                      <motion.div 
                        className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-primary/20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <p className="text-sm leading-relaxed">{forecast.forecastExplanation}</p>
                      </motion.div>
                    )}

                    <div className="grid gap-3">
                      {forecast.risks?.map((risk, index) => (
                        <motion.div 
                          key={risk.id}
                          className="flex items-center justify-between p-4 border-2 rounded-lg hover:shadow-md transition-shadow bg-card"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium text-lg">{risk.name}</span>
                              <Badge 
                                variant={risk.probability > 0.1 ? 'destructive' : 'secondary'}
                                className="animate-pulse"
                              >
                                {(risk.probability * 100).toFixed(1)}% risk
                              </Badge>
                            </div>
                            {risk.notes && (
                              <p className="text-sm text-muted-foreground">{risk.notes}</p>
                            )}
                          </div>
                          <div className="w-32 ml-4">
                            <Progress 
                              value={risk.probability * 100} 
                              className="h-3"
                            />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Chart Visualization */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="border-2 border-primary/20 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Risk Trend Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                          <XAxis 
                            dataKey="timestamp" 
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            tickMargin={10}
                          />
                          <YAxis 
                            stroke="var(--color-muted-foreground)"
                            fontSize={12}
                            tickMargin={10}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'var(--color-popover)',
                              border: '2px solid var(--color-primary)',
                              borderRadius: '8px',
                              color: 'var(--color-popover-foreground)',
                              padding: '12px'
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="upper"
                            stroke="transparent"
                            fill="url(#colorValue)"
                            fillOpacity={0.3}
                          />
                          <Area
                            type="monotone"
                            dataKey="lower"
                            stroke="transparent"
                            fill="var(--color-background)"
                            fillOpacity={1}
                          />
                          <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}