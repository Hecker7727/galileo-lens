import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Activity,
  AlertCircle,
  Shield,
  ShieldCheck,
  Globe
} from 'lucide-react';
import ChatterBridge from './ChatterBridge';
import { is608Publication } from '../services/knowledge608';
import { useLiveApi } from '../hooks/use-live-api';
import { AudioRecorder } from '../lib/audio-recorder';

interface VoiceChatProps {
  onVoiceMessage: (message: string) => void;
  isAiResponding: boolean;
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL = import.meta.env.VITE_GEMINI_MODEL || 'models/gemini-2.5-flash-native-audio-preview-09-2025';

if (!API_KEY) {
  console.error('⚠️ VITE_GEMINI_API_KEY is not defined in environment variables');
}

console.log('🤖 Galileo AI Model:', MODEL);

export default function VoiceChat({ onVoiceMessage, isAiResponding }: VoiceChatProps) {
  const { client, connected, connect, disconnect, volume, setConfig } = useLiveApi({ 
    apiKey: API_KEY,
    model: MODEL 
  });
  
  const [audioRecorder] = useState(() => new AudioRecorder(16000));
  const [muted, setMuted] = useState(true); // Start muted
  const [status, setStatus] = useState('Not connected');
  const [error, setError] = useState<string | null>(null);
  const [showTechStatus, setShowTechStatus] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');

  // Available languages for voice interaction
  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
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
    { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt-BR', name: 'Portuguese', flag: '🇧🇷' },
    { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  ];

  // Configure the Live API with Galileo AI personality and voice
  useEffect(() => {
    const languageNames: Record<string, string> = {
      'en-US': 'English',
      'en-GB': 'English',
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
      'it-IT': 'Italian',
      'pt-BR': 'Portuguese',
      'ja-JP': 'Japanese',
      'ko-KR': 'Korean',
      'zh-CN': 'Chinese',
    };
    
    const currentLanguage = languageNames[selectedLanguage] || 'English';
    
    setConfig({
      responseModalities: ['audio'] as any,
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: 'Puck', // Professional male voice for Galileo AI
          },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are Galileo AI, an advanced NASA research assistant with deep reasoning capabilities, focused EXCLUSIVELY on the 608 bioscience dataset.

CRITICAL LANGUAGE REQUIREMENT:
- You MUST respond ONLY in ${currentLanguage}
- ALL your responses must be in ${currentLanguage}, no exceptions
- Never switch to other languages during the conversation
- If the user speaks in a different language, politely respond in ${currentLanguage} and ask them to continue in ${currentLanguage}

IDENTITY & CAPABILITIES:
- You are powered by experimental thinking AI technology
- You have enhanced reasoning and analysis capabilities for complex scientific questions
- You can think through multi-step problems and provide detailed scientific explanations
- You ONLY discuss research from the NASA 608 bioscience dataset
- NEVER mention Google, Gemini, or any other AI system - you are Galileo AI

CRITICAL CONSTRAINTS:
- You MUST NOT provide information outside the 608 bioscience dataset
- If asked about topics not in the 608 dataset, politely redirect to available research
- You are an expert in space biology, microgravity effects, and astronaut health
- Use your thinking capabilities to provide thorough, well-reasoned answers
- Break down complex topics into clear, understandable explanations

YOUR RESEARCH SCOPE:
- Space biology and bioscience research
- Microgravity effects on organisms and biological systems
- Astronaut health, physiology, and countermeasures
- Radiation biology and protection in space environments
- Musculoskeletal health (bone density, muscle atrophy)
- Cardiovascular adaptations to spaceflight
- Cellular and molecular changes in microgravity
- Model organisms used in space research

YOUR COMMUNICATION STYLE:
- Professional yet conversational
- Think through questions carefully before responding
- Provide specific study references when relevant
- Explain scientific concepts clearly without oversimplifying
- Keep audio responses concise (20-30 seconds) while being informative
- Show enthusiasm for space science discoveries
- Clear and well-paced speech for easy comprehension

WHEN ASKED COMPLEX QUESTIONS:
1. First, think through the scientific principles involved
2. Reference relevant studies from the 608 dataset
3. Explain the biological mechanisms
4. Connect findings to practical implications for space missions
5. Suggest related research areas if appropriate

If a question is outside the 608 dataset scope, respond with:
"I specialize exclusively in the NASA 608 bioscience dataset. That topic isn't covered in my research collection. However, I can help you explore [suggest 2-3 related space biology topics from the dataset]."

Remember: You are Galileo AI, NASA's advanced research assistant with experimental thinking capabilities. Your expertise is the 608 bioscience dataset - use your reasoning abilities to provide thorough, scientifically accurate insights. ALWAYS respond in ${currentLanguage}.`,
          },
        ],
      },
    });
  }, [setConfig, selectedLanguage]);

  // Connect/disconnect mic recorder based on connected state and mute
  useEffect(() => {
    const onData = (base64: string) => {
      client.sendRealtimeInput([
        {
          mimeType: 'audio/pcm;rate=16000',
          data: base64,
        },
      ]);
    };
    
    if (connected && !muted && audioRecorder) {
      audioRecorder.on('data', onData).start();
      setStatus('Listening...');
    } else {
      audioRecorder.stop();
      if (connected && muted) {
        setStatus('Ready (microphone muted)');
      }
    }
    
    return () => {
      audioRecorder.off('data', onData);
    };
  }, [connected, client, muted, audioRecorder]);

  // Update status based on connection state
  useEffect(() => {
    if (connected) {
      setStatus(muted ? 'Ready (microphone muted)' : 'Listening...');
      setError(null);
    } else {
      setStatus('Not connected');
    }
  }, [connected, muted]);

  // Listen for quota exceeded errors
  useEffect(() => {
    const handleQuotaError = (event: CustomEvent) => {
      const quotaMessage = `🚨 API Quota Exceeded\n\nYour API key has reached its daily limit. Please:\n1. Get a new API key at: https://aistudio.google.com/app/apikey\n2. Or wait 24 hours for quota reset\n\nTip: Use text chat to conserve quota!`;
      setError(quotaMessage);
      setStatus('Disconnected (quota exceeded)');
    };

    window.addEventListener('genai-quota-exceeded', handleQuotaError as EventListener);
    
    return () => {
      window.removeEventListener('genai-quota-exceeded', handleQuotaError as EventListener);
    };
  }, []);

  const initializeVoice = async () => {
    try {
      setError(null);
      setStatus('Connecting to voice service...');
      
      // Check prerequisites first
      if (!navigator.mediaDevices) {
        setError('Voice features not supported in this browser. Please use Chrome, Firefox, or Edge.');
        return;
      }

      if (!window.isSecureContext && window.location.hostname !== 'localhost') {
        setError('Voice requires HTTPS connection. Voice features are disabled on unsecure connections.');
        return;
      }

      console.log('🔌 Attempting to connect to GenAI Live...');
      await connect();
      console.log('✅ Connection attempt completed');
      
    } catch (error: any) {
      console.error('❌ Voice initialization error:', error);
      setError(`Voice initialization failed: ${error.message || 'Unknown error'}`);
    }
  };

  const disconnectVoice = async () => {
    try {
      await disconnect();
      audioRecorder.stop();
      setStatus('Disconnected');
      setMuted(true);
    } catch (error) {
      console.error('Failed to disconnect voice service:', error);
    }
  };

  const toggleMic = () => {
    setMuted(!muted);
  };

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (connected && !muted) return 'default';
    if (connected && muted) return 'secondary';
    return 'outline';
  };

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return { name: 'Chrome', supported: true };
    if (userAgent.includes('Firefox')) return { name: 'Firefox', supported: true };
    if (userAgent.includes('Edge')) return { name: 'Edge', supported: true };
    if (userAgent.includes('Safari')) return { name: 'Safari', supported: false };
    return { name: 'Unknown', supported: false };
  };

  const getStatusText = () => {
    if (error) return error;
    if (connected && !muted) return 'Listening...';
    if (connected && muted) return 'Ready (mic muted)';
    if (isAiResponding) return 'AI Thinking...';
    return status;
  };

  // Test audio using browser TTS (optional helper)
  const handleTestAudio = async () => {
    try {
      const testMessage = 'This is a test audio from the NASA dataset. If you can hear this, text-to-speech is working.';
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(testMessage);
        utterance.rate = 0.95;
        utterance.volume = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Test audio failed:', err);
    }
  };

  // Test tone for output verification
  const handleTestTone = async () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.1;
      osc.type = 'sine';
      osc.frequency.value = 880;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      setTimeout(() => osc.stop(), 600);
    } catch (e) {
      console.error('Test tone failed:', e);
    }
  };

  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4 space-y-4">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Voice Assistant</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTechStatus(!showTechStatus)}
              className="h-6 w-6 p-0"
            >
              {window.isSecureContext ? (
                <ShieldCheck className="h-3 w-3 text-green-500" />
              ) : (
                <Shield className="h-3 w-3 text-yellow-500" />
              )}
            </Button>
          </div>
          <Badge 
            variant={getStatusColor()} 
            className="text-xs"
          >
            {getStatusText()}
          </Badge>
        </div>

        {/* Language Selector */}
        {!connected && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Response Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Galileo AI will respond only in the selected language
            </p>
          </div>
        )}

        {/* Selected Language Badge (when connected) */}
        {connected && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" />
            <span>
              Speaking in: {languages.find(l => l.code === selectedLanguage)?.flag} {languages.find(l => l.code === selectedLanguage)?.name}
            </span>
          </div>
        )}

        {/* Technical Status (collapsible) */}
        {showTechStatus && (
          <div className="text-xs space-y-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span>Connection:</span>
              <div className="flex items-center gap-1">
                {window.isSecureContext ? (
                  <ShieldCheck className="h-3 w-3 text-green-500" />
                ) : (
                  <Shield className="h-3 w-3 text-yellow-500" />
                )}
                <span className={window.isSecureContext ? 'text-green-600' : 'text-yellow-600'}>
                  {window.isSecureContext ? 'Secure (HTTPS)' : 'Unsecure (HTTP)'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Browser:</span>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className={getBrowserInfo().supported ? 'text-green-600' : 'text-red-600'}>
                  {getBrowserInfo().name} {getBrowserInfo().supported ? '✓' : '✗'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>Media API:</span>
              <span className={navigator.mediaDevices ? 'text-green-600' : 'text-red-600'}>
                {navigator.mediaDevices ? 'Available ✓' : 'Not Available ✗'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Volume:</span>
              <span className="text-blue-600">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Voice Controls */}
        <div className="flex items-center justify-center gap-3">
          {!connected ? (
            <Button 
              onClick={initializeVoice}
              variant="default"
              size="lg"
              className="w-full max-w-xs"
              disabled={isAiResponding}
            >
              <Phone className="h-4 w-4 mr-2" />
              Connect Voice
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMic}
                variant="default"
                size="lg"
                className={`w-20 h-20 rounded-full ${
                  !muted 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isAiResponding}
              >
                {!muted ? (
                  <Mic className="h-8 w-8" />
                ) : (
                  <MicOff className="h-8 w-8" />
                )}
              </Button>
              
              <div className="flex-1 max-w-xs space-y-2">
                {/* Voice Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectVoice}
                    className="flex-1"
                  >
                    <PhoneOff className="h-3 w-3 mr-1" />
                    Disconnect
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="space-y-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive font-medium">
                {error?.includes('Quota') ? 'API Quota Exceeded' : 'Voice Setup Issue'}
              </span>
            </div>
            <p className="text-xs text-destructive/80 leading-relaxed whitespace-pre-line">{error}</p>
            
            {error?.includes('Quota') ? (
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Get New API Key →
                </Button>
              </a>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={initializeVoice}
                className="mt-2"
              >
                Try Again
              </Button>
            )}
          </div>
        )}

        {/* Voice Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          {!connected && !error ? (
            <>
              <p>• Connect to enable voice interaction</p>
              <p>• Microphone permissions required</p>
              <p>• Works best with Chrome or Edge</p>
              <p>• Requires HTTPS or localhost</p>
            </>
          ) : connected ? (
            <>
              <p>• Click microphone to start/stop speaking</p>
              <p>• Speak clearly about NASA research topics</p>
              <p>• AI responds with voice and text</p>
              <p>• Internet connection required for AI</p>
              <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                <p className="font-medium text-blue-700 dark:text-blue-300">🔧 Debug:</p>
                <p className="text-blue-600 dark:text-blue-400">Check browser console (F12) for audio logs</p>
                <button
                  onClick={handleTestAudio}
                  className="mt-1 px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                >
                  Test TTS
                </button>
                <button
                  onClick={handleTestTone}
                  className="mt-1 ml-2 px-2 py-1 bg-indigo-500 text-white rounded text-xs hover:bg-indigo-600"
                  title="Plays a short beep to verify audio output"
                >
                  Test Tone
                </button>
              </div>
            </>
          ) : null}
        </div>

        {/* Speaking Indicator */}
        {volume > 0.05 && (
          <div className="flex items-center justify-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            </div>
            <span className="text-xs text-blue-700 dark:text-blue-300">
              AI is speaking...
            </span>
          </div>
        )}

        {/* Chatterbots face bridge (scoped to 608 dataset when speaking/listening) */}
        <div className="mt-4">
          <ChatterBridge
            isPlaying={connected && !muted}
            onSpeakRequest={async (_text: string) => {}}
            publicationsFilter={is608Publication}
            className="max-w-md mx-auto"
            volume={volume}
          />
        </div>
      </CardContent>
    </Card>
  );
}
