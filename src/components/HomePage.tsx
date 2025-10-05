import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AnimatedCounter } from './EnhancedCard';
import AboutUs from './AboutUs';
import { Rocket, Activity, Brain, Users, BarChart3, Zap, BookOpen, Mic, TrendingUp, Database, Search, Award } from 'lucide-react';

interface HomePageProps {
  onEnterPlatform: () => void;
}

export default function HomePage({ onEnterPlatform }: HomePageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Black hole background */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1597449031666-21da12583121?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMGhvbGUlMjBzcGFjZSUyMGFzdHJvbm9teXxlbnwxfHx8fDE3NTk1NjkxMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Black hole background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10 text-white">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="border-b border-white/20 backdrop-blur-sm bg-black/20"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div 
                  className="flex items-center space-x-2"
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Rocket className="h-8 w-8 text-blue-400" />
                  </motion.div>
                  <div>
                    <h1 className="text-xl font-semibold">Galileo's Lenses</h1>
                    <p className="text-sm text-blue-200">AI-Powered NASA Bioscience Research Explorer</p>
                  </div>
                </motion.div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Badge variant="secondary" className="bg-green-600/30 text-green-200 border-green-400/30">
                    <Award className="h-3 w-3 mr-1" />
                    NASA Space Apps 2025
                  </Badge>
                </motion.div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={onEnterPlatform}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-blue-400"
                >
                  Enter Platform
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Hero Section */}
        <motion.section 
          className="container mx-auto px-4 py-16"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.2
              }
            }
          }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              className="mb-8"
            >
              <div className="relative mx-auto max-w-md overflow-hidden rounded-lg bg-transparent">
                <img 
                  src="/galileos-lens.jpg" 
                  alt="Galileo's Lens" 
                  className="w-full h-auto object-contain no-black-bars" 
                  style={{ 
                    filter: 'contrast(1.15) brightness(1.1)',
                    mixBlendMode: 'screen',
                    maxHeight: '400px'
                  }}
                />
              </div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/50 px-4 py-2 mb-4">
                NASA Space Apps Challenge 2025 • Build the Biosignature
              </Badge>
            </motion.div>
            <motion.h2 
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Explore <AnimatedCounter value={608} className="inline" /> NASA Bioscience Publications
            </motion.h2>
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              className="text-xl text-gray-200 mb-8 leading-relaxed"
            >
              An AI-powered dashboard leveraging knowledge graphs, voice interaction, and predictive analytics 
              to make decades of NASA space biology research accessible, searchable, and actionable for 
              scientists, mission planners, and researchers worldwide.
            </motion.p>
            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 }
              }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              <Badge className="bg-orange-600/30 text-orange-200 border-orange-400/50 px-4 py-2">
                <BookOpen className="h-4 w-4 mr-1 inline" />
                608 Publications
              </Badge>
              <Badge className="bg-green-600/30 text-green-200 border-green-400/50 px-4 py-2">
                <Brain className="h-4 w-4 mr-1 inline" />
                AI Knowledge Graphs
              </Badge>
              <Badge className="bg-blue-600/30 text-blue-200 border-blue-400/50 px-4 py-2">
                <Mic className="h-4 w-4 mr-1 inline" />
                Voice Chat (Galileo)
              </Badge>
              <Badge className="bg-purple-600/30 text-purple-200 border-purple-400/50 px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-1 inline" />
                Gap Analysis
              </Badge>
            </motion.div>
            <motion.div 
              variants={{
                hidden: { opacity: 0, scale: 0.8 },
                visible: { opacity: 1, scale: 1 }
              }}
              className="flex justify-center gap-4 text-sm text-gray-300"
            >
              <span>🚀 Moon & Mars Missions</span>
              <span>•</span>
              <span>🧬 Space Biology</span>
              <span>•</span>
              <span>💡 Research Innovation</span>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16">
          <h3 className="text-3xl font-bold text-center mb-12 text-blue-200">
            Powerful Features for Space Biology Research
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm hover:border-blue-400/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-200">
                  <Brain className="h-6 w-6" />
                  <span>Knowledge Graphs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Interactive 3D visualization of 608 NASA publications showing relationships, clusters, 
                  and connections between research topics, organisms, and methodologies.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm hover:border-green-400/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-200">
                  <Mic className="h-6 w-6" />
                  <span>Galileo Voice AI</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Natural voice conversations with Galileo AI assistant. Ask questions about space biology 
                  research and get intelligent responses with citations from the 608 publications.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm hover:border-purple-400/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-200">
                  <Search className="h-6 w-6" />
                  <span>Intelligent Search</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  AI-powered search across all 608 publications with semantic understanding, relevance ranking, 
                  and instant access to abstracts, summaries, and full paper links.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-orange-500/30 backdrop-blur-sm hover:border-orange-400/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-200">
                  <TrendingUp className="h-6 w-6" />
                  <span>Gap Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Automated identification of research gaps, under-studied organisms, and methodologies 
                  needing attention. Perfect for funding decisions and hypothesis generation.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-cyan-500/30 backdrop-blur-sm hover:border-cyan-400/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-200">
                  <Activity className="h-6 w-6" />
                  <span>Predictive Health Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Evidence-based health risk forecasting for Moon and Mars missions. Predicts bone loss, 
                  radiation effects, and cardiovascular changes with countermeasure recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-black/40 border-pink-500/30 backdrop-blur-sm hover:border-pink-400/60 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-pink-200">
                  <Database className="h-6 w-6" />
                  <span>OSDR Integration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Direct connection to NASA's Open Science Data Repository. Search studies, view metadata, 
                  and link publications to primary experimental data and protocols.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-400/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-center text-2xl text-blue-200 flex items-center justify-center gap-2">
                  <Award className="h-6 w-6" />
                  Challenge Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-lg text-gray-200 leading-relaxed">
                  <strong>Galileo's Lenses</strong> addresses NASA's challenge to make decades of space biology
                  research accessible and actionable. We've built a dynamic dashboard that summarizes 608 NASA 
                  bioscience publications using AI, knowledge graphs, and interactive tools.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <div>
                    <div className="text-3xl font-bold text-blue-400">608</div>
                    <div className="text-sm text-gray-300">NASA Publications</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-400">5+</div>
                    <div className="text-sm text-gray-300">AI-Powered Tools</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-400">3</div>
                    <div className="text-sm text-gray-300">Target Audiences</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-6 italic">
                  "Enable a new era of human space exploration by making biology research 
                  findings accessible to scientists, managers, and mission architects."
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="container mx-auto px-4 py-12">
          <h3 className="text-3xl font-bold text-center mb-8 text-blue-200">
            Who Benefits from Galileo's Lenses?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-black/40 border-blue-500/30 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <Users className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h4 className="font-bold text-lg text-blue-200 mb-2">Scientists</h4>
                <p className="text-gray-300 text-sm">
                  Generate new hypotheses, find research gaps, and explore related studies 
                  to build on existing knowledge.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-green-500/30 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h4 className="font-bold text-lg text-green-200 mb-2">Managers</h4>
                <p className="text-gray-300 text-sm">
                  Identify investment opportunities, review research priorities, and make 
                  data-driven funding decisions.
                </p>
              </CardContent>
            </Card>
            <Card className="bg-black/40 border-purple-500/30 backdrop-blur-sm">
              <CardContent className="pt-6 text-center">
                <Rocket className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                <h4 className="font-bold text-lg text-purple-200 mb-2">Mission Architects</h4>
                <p className="text-gray-300 text-sm">
                  Plan safe Moon and Mars missions with health risk forecasts and 
                  evidence-based countermeasures.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Us / Team Section */}
        <AboutUs />

        {/* Call to Action */}
        <section className="container mx-auto px-4 py-16 text-center">
          <h3 className="text-3xl font-bold mb-6 text-blue-200">
            Ready to Explore 608 Publications?
          </h3>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Experience the future of space biology research exploration. Talk to Galileo AI, 
            visualize knowledge graphs, and discover research insights in seconds.
          </p>
          <Button 
            onClick={onEnterPlatform}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg shadow-lg hover:shadow-xl transition-all"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Launch Galileo's Lenses
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            🎙️ Try voice chat • 🧠 Explore knowledge graphs • 📊 Analyze research gaps
          </p>
        </section>
      </div>
    </div>
  );
}