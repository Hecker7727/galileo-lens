import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ResearchDNA } from '../services/researchDNAService';
import { Dna, Microscope, Zap, Target, Clock } from 'lucide-react';

interface DNAVisualizationProps {
  dna: ResearchDNA;
  showDetails?: boolean;
}

export function DNAVisualization({ dna, showDetails = true }: DNAVisualizationProps) {
  // Generate DNA helix visualization data
  const helixData = useMemo(() => {
    const points = [];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 4; // 2 full rotations
      points.push({
        id: i,
        x: 50 + Math.cos(angle) * 30,
        y: (i / 20) * 180 + 10,
        color: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'][i % 4]
      });
    }
    return points;
  }, []);

  const getComplexityColor = (complexity: number) => {
    if (complexity >= 8) return 'text-red-600 bg-red-50';
    if (complexity >= 6) return 'text-orange-600 bg-orange-50';
    if (complexity >= 4) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <Card className="overflow-hidden border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Dna className="h-5 w-5 text-purple-600" />
          Research DNA Fingerprint
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* DNA Helix Animation */}
        <div className="relative h-48 bg-gradient-to-b from-blue-900 to-purple-900 rounded-lg overflow-hidden">
          <svg viewBox="0 0 100 200" className="w-full h-full">
            {/* DNA Helix Strands */}
            {helixData.map((point, index) => {
              if (index === helixData.length - 1) return null;
              const nextPoint = helixData[index + 1];
              const oppositeX = 100 - point.x;
              const nextOppositeX = 100 - nextPoint.x;
              
              return (
                <g key={point.id}>
                  {/* Left strand */}
                  <motion.line
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke={point.color}
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                  
                  {/* Right strand */}
                  <motion.line
                    x1={oppositeX}
                    y1={point.y}
                    x2={nextOppositeX}
                    y2={nextPoint.y}
                    stroke={point.color}
                    strokeWidth="2"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  />
                  
                  {/* Connecting base pairs (every 2nd) */}
                  {index % 2 === 0 && (
                    <motion.line
                      x1={point.x}
                      y1={point.y}
                      x2={oppositeX}
                      y2={point.y}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
                    />
                  )}
                  
                  {/* Nodes */}
                  <motion.circle
                    cx={point.x}
                    cy={point.y}
                    r="2"
                    fill={point.color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  />
                  <motion.circle
                    cx={oppositeX}
                    cy={point.y}
                    r="2"
                    fill={point.color}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Fingerprint overlay */}
          <div className="absolute bottom-2 left-0 right-0 text-center">
            <div className="inline-block bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
              <code className="text-xs font-mono text-white tracking-wider">
                {dna.fingerprint}
              </code>
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            {/* DNA Components */}
            <div className="space-y-3">
              {/* Methodology */}
              {dna.methodology.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Microscope className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Methodology Genes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dna.methodology.map((method, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-blue-300">
                          {method}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organisms */}
              {dna.organism.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Dna className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Organism Genes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dna.organism.map((org, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-300">
                          {org}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stressors */}
              {dna.stressors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Stressor Genes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dna.stressors.map((stressor, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.4 }}
                      >
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-300">
                          {stressor}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcomes */}
              {dna.outcomes.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Outcome Genes
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {dna.outcomes.map((outcome, index) => (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.6 }}
                      >
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700 border-purple-300">
                          {outcome}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Duration</div>
                  <div className="text-sm font-medium capitalize">{dna.duration}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 flex items-center justify-center">
                  <span className="text-lg">🧪</span>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Complexity</div>
                  <div className="flex items-center gap-2">
                    <Badge className={getComplexityColor(dna.complexity)}>
                      {dna.complexity}/10
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Compatibility Score Display
interface CompatibilityScoreProps {
  score: number;
  label?: string;
}

export function CompatibilityScore({ score, label }: CompatibilityScoreProps) {
  const getColor = () => {
    if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-200' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', ring: 'ring-blue-200' };
    if (score >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', ring: 'ring-yellow-200' };
    if (score >= 20) return { bg: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-200' };
    return { bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-200' };
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <motion.circle
            cx="56"
            cy="56"
            r="40"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={color.bg}
            strokeLinecap="round"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className={`text-3xl font-bold ${color.text}`}
          >
            {score}%
          </motion.div>
        </div>
      </div>
      {label && (
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
          {label}
        </div>
      )}
    </div>
  );
}