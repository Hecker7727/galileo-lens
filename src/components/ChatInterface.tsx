import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Send, Mic, MoreVertical, PanelRight, PanelRightClose, PhoneCall, Globe, Sparkles, Rocket } from 'lucide-react';
import ChatMessage from './ChatMessage';
import ResourcesSidebar from './ResourcesSidebar';
import VoiceChat from './VoiceChat';
import { ChatMessage as ChatMessageType } from '../types/dataTypes';
import { ask } from '../services/geminiService';
import { checkSpelling } from '../utils/spellCorrection';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      text: 'Hey there! 👋 I\'m Galileo AI, your NASA research companion powered by experimental thinking tech. I specialize in the 608 bioscience dataset covering space health, microgravity effects, and astronaut physiology. Ready to explore some mind-blowing space science? 🚀🧬',
      sender: 'assistant',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      richContent: {
        suggestions: [
          '🦴 How does microgravity affect bone density?',
          '🚀 What are health risks on Mars missions?',
          '💪 Tell me about exercise countermeasures',
          '🍎 Space nutrition for astronauts'
        ]
      }
    }
  ]);
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [voiceChatVisible, setVoiceChatVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastScrollHeight = useRef<number>(0);

  // Available languages for chat
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'Hindi (हिंदी)', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'Malayalam (മലയാളം)', flag: '🇮🇳' },
    { code: 'te-IN', name: 'Telugu (తెలుగు)', flag: '🇮🇳' },
    { code: 'mr-IN', name: 'Marathi (मराठी)', flag: '🇮🇳' },
    { code: 'bn-IN', name: 'Bengali (বাংলা)', flag: '🇮🇳' },
    { code: 'gu-IN', name: 'Gujarati (ગુજરાતી)', flag: '🇮🇳' },
    { code: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)', flag: '🇮🇳' },
    { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
    { code: 'de-DE', name: 'German', flag: '🇩🇪' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  ];

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

  useEffect(() => {
    // Scroll to bottom when new messages are added, but only if user isn't manually scrolling
    if (scrollAreaRef.current && !isUserScrolling) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        const currentScrollHeight = scrollElement.scrollHeight;
        
        // Only scroll if content actually changed
        if (currentScrollHeight !== lastScrollHeight.current) {
          lastScrollHeight.current = currentScrollHeight;
          
          // Use smooth scroll with a small delay to ensure content is rendered
          setTimeout(() => {
            scrollElement.scrollTo({
              top: scrollElement.scrollHeight,
              behavior: 'smooth'
            });
          }, 50);
        }
      }
    }
    
    // Reset user scrolling flag after a delay when new messages arrive
    const timer = setTimeout(() => {
      setIsUserScrolling(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [messages.length, isUserScrolling]); // Only scroll when message count changes
  
  // Detect when user manually scrolls
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (!scrollElement) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 50;
      
      // If user scrolls up from bottom, set flag
      if (!isAtBottom) {
        setIsUserScrolling(true);
      } else {
        setIsUserScrolling(false);
      }
    };
    
    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSendMessage = async (messageText?: string) => {
    const originalText = messageText || currentMessage;
    if (!originalText.trim() || isLoading) return;

    // Automatically correct spelling before sending
    const spellCheck = checkSpelling(originalText);
    const correctedText = spellCheck.hasSuggestions ? spellCheck.correctedText : originalText;
    
    // Show user message with original text
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      text: originalText,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);

    // If corrections were made, show a subtle notification
    if (spellCheck.hasSuggestions && correctedText !== originalText) {
      const correctionMessage: ChatMessageType = {
        id: (Date.now() + 0.5).toString(),
        text: `*Auto-corrected query: "${correctedText}"*`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        richContent: {
          type: 'correction',
          corrections: spellCheck.corrections
        }
      };
      setMessages(prev => [...prev, correctionMessage]);
    }

    setCurrentMessage('');
    setIsLoading(true);

    try {
      // Send the corrected text to the AI with selected language and conversation history
      const response = await ask(correctedText, { 
        temperature: 0.7,
        language: selectedLanguage,
        conversationHistory: messages // Pass full conversation history for context
      });
      
      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        richContent: response.structured as Record<string, unknown>
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        text: 'I apologize, but I encountered an error processing your request. Please try again or rephrase your question.',
        sender: 'assistant',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentMessage(value);
    // Auto-correction now happens on send, so no need for live suggestions
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleVoiceMessage = (message: string) => {
    // When voice message is received, process it like a typed message
    handleSendMessage(message);
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const toggleVoiceChat = () => {
    setVoiceChatVisible(!voiceChatVisible);
  };

  const handlePublicationClick = (publication: any) => {
    // Publication modal is handled within ResourcesSidebar
    console.log('Publication clicked:', publication.title);
  };

  return (
    <div className="space-y-4">
      {/* Voice Chat Panel */}
      <AnimatePresence>
        {voiceChatVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <VoiceChat 
              onVoiceMessage={handleVoiceMessage}
              isAiResponding={isLoading}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex h-[calc(100vh-12rem)] gap-4">
        {/* Main Chat Area */}
        <motion.div 
          className="flex-1 flex flex-col"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="flex-1 flex flex-col border-2 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-pink-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Avatar className="h-10 w-10 ring-2 ring-purple-500/30">
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-bold">
                        <Rocket className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-3">
                      <Rocket className="h-6 w-6 text-purple-600" />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-foreground">Galileo's Lenses</h2>
                          <span className="text-xs font-semibold px-2 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full">
                            v1.0
                          </span>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground">Mission Health Analytics</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-2">
                      <Sparkles className="h-3 w-3" />
                      Analyzing 608 NASA Bioscience Studies
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Language Selector */}
                  <div className="flex items-center gap-2 mr-2 px-3 py-1.5 bg-muted rounded-lg">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      className="text-sm bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                      title="Select response language"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {languageNames[lang.code] || lang.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleVoiceChat}
                    className={voiceChatVisible ? 'bg-blue-100 dark:bg-blue-900 text-blue-600' : ''}
                  >
                    <PhoneCall className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleSidebar}
                    className="hidden lg:flex"
                  >
                    {sidebarVisible ? (
                      <PanelRightClose className="h-4 w-4" />
                    ) : (
                      <PanelRight className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 relative overflow-hidden">
              {/* Scroll to bottom button */}
              <AnimatePresence>
                {isUserScrolling && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10"
                  >
                    <Button
                      size="sm"
                      className="shadow-lg rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      onClick={() => {
                        const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
                        if (scrollElement) {
                          scrollElement.scrollTo({
                            top: scrollElement.scrollHeight,
                            behavior: 'smooth'
                          });
                          setIsUserScrolling(false);
                        }
                      }}
                    >
                      ↓ New messages
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
                <div className="space-y-6 max-w-4xl mx-auto">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ChatMessage 
                          message={message}
                          onSuggestionClick={handleSuggestionClick}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-purple-500/30">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                          <Rocket className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 rounded-2xl p-4 max-w-xs border border-purple-200/50 dark:border-purple-800/50">
                          <div className="flex space-x-2">
                            <motion.div 
                              className="w-2.5 h-2.5 bg-purple-600 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div 
                              className="w-2.5 h-2.5 bg-blue-600 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div 
                              className="w-2.5 h-2.5 bg-pink-600 rounded-full"
                              animate={{ y: [0, -8, 0] }}
                              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t bg-background/95 backdrop-blur-sm p-4 space-y-2">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                  <div className="flex-1">
                    <div className="relative">
                      <Sparkles className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-500 z-10" />
                      <Input
                        ref={inputRef}
                        value={currentMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="🚀 What are health risks on Mars missions?"
                        disabled={isLoading}
                        className="pl-10 pr-16 h-14 rounded-full border-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-base"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          disabled={isLoading}
                          onClick={toggleVoiceChat}
                          className={`rounded-full h-9 w-9 p-0 transition-colors ${
                            voiceChatVisible 
                              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                              : 'hover:bg-purple-100 dark:hover:bg-purple-900/20'
                          }`}
                          title={voiceChatVisible ? "Stop voice chat" : "Start voice chat"}
                        >
                          <Mic className={`h-5 w-5 ${voiceChatVisible ? 'animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    className="flex-shrink-0"
                  >
                    <Button 
                      onClick={() => handleSendMessage()} 
                      disabled={!currentMessage.trim() || isLoading}
                      className="relative rounded-full h-14 w-14 p-0 shadow-xl hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed group overflow-hidden"
                      title="Send message (Enter)"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 50%, #ec4899 100%)',
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="relative z-10"
                        >
                          <Sparkles className="h-6 w-6 text-white drop-shadow-lg" />
                        </motion.div>
                      ) : (
                        <Send className="h-6 w-6 text-white drop-shadow-lg relative z-10" />
                      )}
                    </Button>
                  </motion.div>
                </div>
                
                <p className="text-xs text-muted-foreground text-center max-w-4xl mx-auto">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Press Enter to send • AI auto-corrects spelling
                  </span>
                  {voiceChatVisible && (
                    <span className="text-blue-600 dark:text-blue-400 ml-2">
                      • Voice chat active
                    </span>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Resources Sidebar */}
        <AnimatePresence>
          {sidebarVisible && (
            <motion.div 
              className="w-80 flex-shrink-0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ResourcesSidebar
                messages={messages}
                selectedMessageId={selectedMessageId || undefined}
                onPublicationClick={handlePublicationClick}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}