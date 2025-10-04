import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  FileText, 
  Database, 
  Brain, 
  ChevronDown, 
  ChevronRight, 
  ExternalLink,
  Sparkles,
  Target,
  Users,
  Calendar,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage as ChatMessageType } from '../types/dataTypes';
import PublicationModal from './PublicationModal';

interface ResourcesSidebarProps {
  messages: ChatMessageType[];
  selectedMessageId?: string;
  onPublicationClick?: (publication: any) => void;
}

interface ResourceSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string;
  items: any[];
}

export default function ResourcesSidebar({ 
  messages, 
  selectedMessageId,
  onPublicationClick 
}: ResourcesSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['publications', 'insights']);
  const [selectedPublication, setSelectedPublication] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get the latest AI message or selected message resources
  const getRelevantMessage = () => {
    if (selectedMessageId) {
      return messages.find(m => m.id === selectedMessageId && m.sender === 'assistant');
    }
    // Get the most recent AI message
    return messages.filter(m => m.sender === 'assistant').pop();
  };

  const relevantMessage = getRelevantMessage();
  const richContent = relevantMessage?.richContent;

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handlePublicationClick = (publication: any) => {
    setSelectedPublication(publication);
    setIsModalOpen(true);
    onPublicationClick?.(publication);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPublication(null);
  };

  // Prepare resource sections
  const resourceSections: ResourceSection[] = [
    {
      id: 'publications',
      title: 'NASA Publications Used',
      icon: FileText,
      count: Array.isArray(richContent?.relatedPublications) ? richContent.relatedPublications.length : 0,
      color: 'text-blue-500',
      items: Array.isArray(richContent?.relatedPublications) ? richContent.relatedPublications : []
    },
    {
      id: 'insights',
      title: 'Key Research Insights',
      icon: Sparkles,
      count: Array.isArray(richContent?.keyPoints) ? richContent.keyPoints.length : 0,
      color: 'text-purple-500',
      items: Array.isArray(richContent?.keyPoints) ? richContent.keyPoints : []
    },
    {
      id: 'implications',
      title: 'Space Medicine Implications',
      icon: Target,
      count: Array.isArray(richContent?.implications) ? richContent.implications.length : 0,
      color: 'text-green-500',
      items: Array.isArray(richContent?.implications) ? richContent.implications : []
    },
    {
      id: 'suggestions',
      title: 'Related Topics',
      icon: Brain,
      count: Array.isArray(richContent?.suggestions) ? richContent.suggestions.length : 0,
      color: 'text-orange-500',
      items: Array.isArray(richContent?.suggestions) ? richContent.suggestions : []
    }
  ];

  const totalResources = resourceSections.reduce((acc, section) => acc + section.count, 0);

  if (!relevantMessage) {
    return (
      <Card className="w-80 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-muted-foreground" />
            Research Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center text-muted-foreground">
            <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI responses yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-80 h-full flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Research Sources
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {totalResources} items
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Latest AI response sources
            </p>
            {relevantMessage && (
              <Badge variant="outline" className="text-xs">
                {new Date(relevantMessage.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {resourceSections.map((section) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Collapsible
                    open={expandedSections.includes(section.id)}
                    onOpenChange={() => toggleSection(section.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-between p-2 h-auto"
                        disabled={section.count === 0}
                      >
                        <div className="flex items-center gap-2">
                          <section.icon className={`h-4 w-4 ${section.color}`} />
                          <span className="text-sm font-medium">{section.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {section.count}
                          </Badge>
                          {section.count > 0 && (
                            expandedSections.includes(section.id) ? 
                              <ChevronDown className="h-3 w-3" /> : 
                              <ChevronRight className="h-3 w-3" />
                          )}
                        </div>
                      </Button>
                    </CollapsibleTrigger>

                    <AnimatePresence>
                      {expandedSections.includes(section.id) && section.count > 0 && (
                        <CollapsibleContent asChild>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pl-6 pr-2 pb-2 space-y-2">
                              {section.id === 'publications' && (
                                <div className="space-y-2">
                                  {section.items.map((publication: any, index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="p-2 bg-muted/50 rounded-lg border cursor-pointer hover:bg-muted/70 transition-colors group"
                                      onClick={() => handlePublicationClick(publication)}
                                    >
                                      <div className="space-y-1">
                                        <h4 className="text-xs font-medium line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                          {publication.title}
                                        </h4>
                                        <div className="flex items-center gap-1 flex-wrap">
                                          <Badge variant="outline" className="text-xs h-4">
                                            {publication.tags?.researchArea || 'Research'}
                                          </Badge>
                                          <Badge variant="secondary" className="text-xs h-4">
                                            {publication.tags?.organism || 'Study'}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            {publication.authors && (
                                              <>
                                                <Users className="h-3 w-3" />
                                                <span>{publication.authors[0]} et al.</span>
                                              </>
                                            )}
                                          </div>
                                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                              <Eye className="h-3 w-3" />
                                            </Button>
                                            {publication.link && (
                                              <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-5 w-5 p-0"
                                                asChild
                                                onClick={(e: React.MouseEvent) => e.stopPropagation()}
                                              >
                                                <a href={publication.link} target="_blank" rel="noopener noreferrer">
                                                  <ExternalLink className="h-3 w-3" />
                                                </a>
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}

                              {section.id === 'insights' && (
                                <div className="space-y-1">
                                  {section.items.map((insight: string, index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="text-xs p-2 bg-blue-50 dark:bg-blue-950/20 rounded border-l-2 border-blue-500"
                                    >
                                      {insight}
                                    </motion.div>
                                  ))}
                                </div>
                              )}

                              {section.id === 'implications' && (
                                <div className="space-y-1">
                                  {section.items.map((implication: string, index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="text-xs p-2 bg-green-50 dark:bg-green-950/20 rounded border-l-2 border-green-500"
                                    >
                                      {implication}
                                    </motion.div>
                                  ))}
                                </div>
                              )}

                              {section.id === 'suggestions' && (
                                <div className="space-y-1">
                                  {section.items.map((suggestion: string, index: number) => (
                                    <motion.div
                                      key={index}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="text-xs p-2 bg-orange-50 dark:bg-orange-950/20 rounded border-l-2 border-orange-500 hover:bg-orange-100 dark:hover:bg-orange-950/30 cursor-pointer transition-colors"
                                    >
                                      {suggestion}
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        </CollapsibleContent>
                      )}
                    </AnimatePresence>
                  </Collapsible>

                  {section.id !== 'suggestions' && <Separator />}
                </motion.div>
              ))}

              {totalResources === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No resources available</p>
                  <p className="text-xs">Ask a question to see sources</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Publication Modal */}
      <PublicationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        publication={selectedPublication}
      />
    </>
  );
}