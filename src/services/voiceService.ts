// Voice interaction service using Gemini Live API
import { checkSpelling } from '../utils/spellCorrection';
import { GenAILiveClient } from '../lib/genai-live-client';
import { audioContext as getAudioContext } from '../lib/utils';
// Reuse proven audio pipeline from the chatterbots project
import { AudioRecorder } from '../../chatterbots/lib/audio-recorder';
import { AudioStreamer } from '../../chatterbots/lib/audio-streamer';

interface VoiceConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
}

interface VoiceSession {
  sessionId: string;
  isActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
}

class VoiceService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private session: VoiceSession | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscriptionCallback: ((text: string) => void) | null = null;
  private onResponseCallback: ((audio: ArrayBuffer, text: string) => void) | null = null;
  private onStatusCallback: ((status: string) => void) | null = null;

  // Live streaming components
  private liveClient: GenAILiveClient | null = null;
  private recorder: AudioRecorder | null = null;
  private outContext: AudioContext | null = null;
  private streamer: AudioStreamer | null = null;

  // Default voice configuration
  private config: VoiceConfig = {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
  };

  constructor() {
    // Initialize audio context when needed
  }

  async initialize(): Promise<boolean> {
    try {
      // Check if we're in a secure context (HTTPS or localhost)
      if (!this.isSecureContext()) {
        this.updateStatus('Voice requires HTTPS connection');
        return false;
      }

      // Check browser compatibility
      if (!this.checkBrowserSupport()) {
        this.updateStatus('Browser does not support voice features');
        return false;
      }

      // Check if permissions were previously denied
      const permissionStatus = await this.checkMicrophonePermission();
      if (permissionStatus === 'denied') {
        this.updateStatus('Microphone access denied. Please enable in browser settings.');
        return false;
      }

      // Prepare playback audio context and streamer (server -> speakers)
      this.outContext = await getAudioContext({ id: 'audio-out' });
      this.streamer = new AudioStreamer(this.outContext);
      this.streamer.onComplete = () => {
        if (this.session) this.session.isSpeaking = false;
      };

      // Initialize GenAI Live client
      // Use the same API key as geminiService.ts
      const apiKey = 'AIzaSyBjsAHXsBTgt1nRop99XusJkwXzADIJGl4';

      this.liveClient = new GenAILiveClient(apiKey);

      // Hook up events similar to chatterbots use-live-api
      this.liveClient.on('open', () => {
        this.updateStatus('Connected');
      });
      this.liveClient.on('close', () => {
        this.updateStatus('Disconnected');
      });
      this.liveClient.on('interrupted', () => {
        try { this.streamer?.stop(); } catch {}
      });
      this.liveClient.on('audio', (data: ArrayBuffer) => {
        // Server audio -> play
        try {
          if (this.session) this.session.isSpeaking = true;
          this.streamer?.addPCM16(new Uint8Array(data));
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Audio playback error:', e);
        }
      });
      this.liveClient.on('content', (content: any) => {
        // Extract text parts like chatterbots
        try {
          const parts = content?.modelTurn?.parts || [];
          const textParts: string[] = parts
            .map((p: any) => {
              if (!p) return null;
              if (typeof p.text === 'string' && p.text.trim()) return p.text.trim();
              if (typeof p.content === 'string' && p.content.trim()) return p.content.trim();
              if (p.inlineData?.mimeType && typeof p.inlineData?.data === 'string') {
                if (String(p.inlineData.mimeType).startsWith('text/')) return p.inlineData.data;
              }
              return null;
            })
            .filter(Boolean) as string[];
          if (textParts.length) {
            const txt = textParts.join(' ').trim();
            if (txt && this.onResponseCallback) {
              // We’re playing server audio; provide text for UI
              this.onResponseCallback(new ArrayBuffer(0), txt);
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse live content:', e);
        }
      });

      // Connect
      const connected = await this.liveClient.connect({});
      if (!connected) {
        this.updateStatus('Failed to connect to Live API');
        return false;
      }
      
      // Create session
      this.session = {
        sessionId: this.generateSessionId(),
        isActive: true,
        isListening: false,
        isSpeaking: false
      };

      this.updateStatus('Voice service ready');
      return true;
    } catch (error) {
      console.error('Failed to initialize voice service:', error);
      this.updateStatus('Voice initialization failed');
      return false;
    }
  }

  private isSecureContext(): boolean {
    return window.isSecureContext || window.location.hostname === 'localhost';
  }

  private checkBrowserSupport(): boolean {
    // For the streaming approach we only need getUserMedia and WebAudio.
    return !!(
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      (window.AudioContext || (window as any).webkitAudioContext)
    );
  }

  private async checkMicrophonePermission(): Promise<string> {
    try {
      if (!navigator.permissions) {
        return 'prompt'; // Assume we can prompt if permissions API not available
      }
      
      const permission = await navigator.permissions.query({ name: 'microphone' as any });
      return permission.state;
    } catch (error) {
      return 'prompt'; // Fallback to prompt if query fails
    }
  }

  private getSupportedMimeType(): string | null { return 'audio/pcm'; }

  private handleMediaError(error: any): boolean {
    console.error('Media error:', error);
    
    switch (error.name) {
      case 'NotAllowedError':
        this.updateStatus('Microphone access denied. Click the microphone icon in your browser\'s address bar to allow access.');
        break;
      case 'NotFoundError':
        this.updateStatus('No microphone found. Please connect a microphone and try again.');
        break;
      case 'NotReadableError':
        this.updateStatus('Microphone is busy or unavailable. Close other applications using the microphone.');
        break;
      case 'OverconstrainedError':
        this.updateStatus('Microphone configuration not supported. Try with a different microphone.');
        break;
      case 'SecurityError':
        this.updateStatus('Microphone access blocked for security reasons. Ensure you\'re on a secure connection.');
        break;
      case 'TypeError':
        this.updateStatus('Browser does not support microphone access.');
        break;
      default:
        this.updateStatus(`Microphone error: ${error.message || 'Unknown error'}`);
    }
    
    return false;
  }

  private setupMediaRecorderEvents(): void { /* no-op with live streaming */ }

  async startListening(): Promise<void> {
    if (!this.session || !this.liveClient) {
      throw new Error('Voice service not initialized');
    }
    if (this.isRecording) return;

    try {
      // Microphone stream via AudioRecorder -> base64 PCM16 -> Live API
      this.recorder = new AudioRecorder(24000);
      this.recorder.on('data', (b64: string) => {
        try {
          this.liveClient!.sendRealtimeInput([
            { mimeType: 'audio/pcm;rate=24000', data: b64 },
          ]);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('sendRealtimeInput failed', e);
        }
      });
      this.recorder.on('volume', (_vol: number) => {
        // Could forward to UI if needed
      });
      await this.recorder.start();

      this.isRecording = true;
      this.session.isListening = true;
      this.updateStatus('Listening...');
    } catch (error) {
      console.error('Failed to start mic:', error);
      this.isRecording = false;
      this.session.isListening = false;
      this.updateStatus('Failed to start listening');
    }
  }

  async stopListening(): Promise<void> {
    if (!this.session) return;
    if (!this.isRecording) return;
    try {
      this.recorder?.stop();
    } catch {}
    this.isRecording = false;
    this.session.isListening = false;
    // Optionally signal end of turn by sending no-op client content; omitted here as live server handles silence
    this.updateStatus('Processing...');
  }

  private async processAudioInput(_audioBlob: Blob): Promise<void> { /* unused with live streaming */ }

  private async transcribeAudio(_audioBlob: Blob): Promise<string> { throw new Error('not supported'); }

  private async sendToGeminiLive(text: string): Promise<void> {
    try {
      this.updateStatus('Getting AI response...');
      
      // Use actual Gemini API for now (in production, use Gemini Live API)
      const response = await this.callGeminiAPI(text);
      
      if (this.onResponseCallback) {
        // Use text-to-speech for audio response
        const audioBuffer = await this.textToSpeech(response);
        this.onResponseCallback(audioBuffer, response);
      }
      
      this.updateStatus('Ready');
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      this.updateStatus('Error getting AI response');
    }
  }

  private async callGeminiAPI(text: string): Promise<string> {
    try {
      // Import the ask function from geminiService
      const { ask } = await import('../services/geminiService');
      
      // Use the existing Gemini service for consistency
      const response = await ask(text, { temperature: 0.7 });
      
      // Return the text response for voice synthesis
      return response.text;
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return this.getFallbackResponse(text);
    }
  }

  private getFallbackResponse(text: string): string {
    // Fallback responses for when Gemini API is unavailable
    if (text.toLowerCase().includes('microbiology')) {
      return 'Microbiology research in space focuses on how microorganisms behave in microgravity environments.';
    } else if (text.toLowerCase().includes('mars')) {
      return 'Mars mission health considerations include radiation exposure, bone density loss, and psychological challenges.';
    } else if (text.toLowerCase().includes('bone')) {
      return 'Bone density loss is a major concern during spaceflight due to microgravity effects.';
    } else if (text.toLowerCase().includes('radiation')) {
      return 'Space radiation poses significant health risks for astronauts on long-duration missions.';
    } else {
      return `I understand you asked about "${text}". Based on NASA research data, I can help analyze space health topics and astronaut safety protocols.`;
    }
  }



  private async textToSpeech(text: string): Promise<ArrayBuffer> {
    return new Promise(async (resolve, reject) => {
      try {
        if (!('speechSynthesis' in window)) {
          reject(new Error('Text-to-speech not supported'));
          return;
        }

        // Attempt to resume audio context early (some browsers gate audio output)
        try {
          if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
          if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
          }
        } catch (e) {
          // Non-fatal
        }

        // Clean text for better speech synthesis
        const cleanedText = this.cleanTextForSpeech(text);

        // Flush any queued utterances to avoid overlap/silence
        try { window.speechSynthesis.cancel(); } catch (_) { /* noop */ }

        const utterance = new SpeechSynthesisUtterance(cleanedText);
        utterance.lang = 'en-US';
        utterance.rate = 0.95; // Slightly slower for clarity but closer to natural
        utterance.pitch = 1.0;
        utterance.volume = 0.95;

        // Helper: wait for voices to be ready with a timeout fallback
        const waitForVoices = () => new Promise<void>((res) => {
          const voices = speechSynthesis.getVoices();
          if (voices && voices.length > 0) return res();
          const handler = () => { speechSynthesis.onvoiceschanged = null as any; res(); };
          speechSynthesis.onvoiceschanged = handler;
          // Fallback timeout in case the event never fires
          setTimeout(() => { if (speechSynthesis.onvoiceschanged === handler) { speechSynthesis.onvoiceschanged = null as any; } res(); }, 1200);
        });

        await waitForVoices();

        // Choose a reasonable voice if available
        const voices = speechSynthesis.getVoices() || [];
        const preferredVoice = voices.find(v =>
          /Google\s.*English/i.test(v.name) ||
          /Microsoft\s.*English/i.test(v.name) ||
          /Neural/i.test(v.name)
        ) || voices.find(v => v.lang?.toLowerCase() === 'en-us') || voices.find(v => v.lang?.toLowerCase().startsWith('en')) || null;

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        // Update visible status and internal speaking state
        utterance.onstart = () => {
          if (this.session) this.session.isSpeaking = true;
          this.updateStatus('Speaking...');
        };

        utterance.onend = () => {
          if (this.session) this.session.isSpeaking = false;
          this.updateStatus('Ready');
          resolve(new ArrayBuffer(0));
        };

        utterance.onerror = (event) => {
          console.error('TTS error:', event);
          if (this.session) this.session.isSpeaking = false;
          this.updateStatus('Text-to-speech failed');
          reject(new Error('Text-to-speech failed'));
        };

        speechSynthesis.speak(utterance);
      } catch (err) {
        reject(err);
      }
    });
  }

  private cleanTextForSpeech(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      // Convert bullet points to spoken form
      .replace(/^[•\-\*]\s/gm, '. ')
      // Remove excessive line breaks
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\n/g, '. ')
      // Clean up spacing
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  async playAudioResponse(audioBuffer: ArrayBuffer): Promise<void> {
    // Play raw PCM16 little-endian audio buffer via Web Audio API as a fallback
    try {
      if (!audioBuffer || audioBuffer.byteLength === 0) {
        console.warn('voiceService.playAudioResponse: empty audio buffer');
        return;
      }

      // Ensure we have an AudioContext
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.session) {
        this.session.isSpeaking = true;
      }

      // Convert ArrayBuffer (assumed Int16 PCM) -> Float32 samples
      const int16 = new Int16Array(audioBuffer);
      const srcSamples = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        srcSamples[i] = int16[i] / 32768; // normalize to [-1,1]
      }

      const srcRate = 16000; // GenAI live audio typically uses 16k
      const dstRate = this.audioContext.sampleRate || 48000;
      const srcLen = srcSamples.length;
      const dstLen = Math.round((srcLen * dstRate) / srcRate);

      // Simple nearest-neighbor resample (fast, acceptable for short responses)
      const resampled = new Float32Array(dstLen);
      for (let i = 0; i < dstLen; i++) {
        const srcIndex = Math.floor((i * srcLen) / dstLen);
        resampled[i] = srcSamples[srcIndex] || 0;
      }

      // Create AudioBuffer and play
      const channelCount = 1;
      const buffer = this.audioContext.createBuffer(channelCount, resampled.length, dstRate);
      buffer.getChannelData(0).set(resampled);

      const src = this.audioContext.createBufferSource();
      src.buffer = buffer;
      src.connect(this.audioContext.destination);

      // Start playback
      src.start(0);

      // Wait for playback to finish
      await new Promise<void>((resolve) => {
        src.onended = () => {
          if (this.session) {
            this.session.isSpeaking = false;
          }
          resolve();
        };
      });
    } catch (error) {
      console.error('Error playing audio response:', error);
      if (this.session) {
        this.session.isSpeaking = false;
      }
    }
  }

  /**
   * Public helper to speak plain text via the built-in TTS pipeline.
   * Calls the internal textToSpeech implementation and resolves when speaking ends.
   */
  async speak(text: string): Promise<void> {
    try {
      // eslint-disable-next-line no-console
      console.log('🔊 VoiceService.speak called with:', text);

      if (!text || text.trim().length === 0) {
        // eslint-disable-next-line no-console
        console.warn('⚠️ Empty text provided to speak');
        return;
      }

      if (!window.speechSynthesis) {
        // eslint-disable-next-line no-console
        console.error('❌ Speech synthesis not available');
        this.updateStatus('Speech synthesis not available');
        return;
      }

      // Ensure audio context is running
      try {
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
      } catch (_) { /* non-fatal */ }

      // eslint-disable-next-line no-console
      console.log('🎯 Starting TTS with text length:', text.length);
      await this.textToSpeech(text);
      // eslint-disable-next-line no-console
      console.log('✅ TTS completed successfully');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ VoiceService.speak error:', err);
      // Surface a status update for callers
      this.updateStatus('Text-to-speech failed');
    }
  }

  /**
   * Simple audible test tone to verify output device and autoplay policy.
   */
  async playTestTone(durationMs = 600): Promise<void> {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      gain.gain.value = 0.1; // quiet
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 test tone
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      await new Promise(r => setTimeout(r, durationMs));
      osc.stop();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Test tone failed:', e);
    }
  }

  // Event handlers
  onTranscription(callback: (text: string) => void): void {
    this.onTranscriptionCallback = callback;
  }

  onResponse(callback: (audio: ArrayBuffer, text: string) => void): void {
    this.onResponseCallback = callback;
  }

  onStatus(callback: (status: string) => void): void {
    this.onStatusCallback = callback;
  }

  private updateStatus(status: string): void {
    if (this.onStatusCallback) {
      this.onStatusCallback(status);
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `voice_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isSessionActive(): boolean {
    return this.session?.isActive || false;
  }

  isCurrentlyListening(): boolean {
    return this.session?.isListening || false;
  }

  isCurrentlySpeaking(): boolean {
    return this.session?.isSpeaking || false;
  }

  async destroy(): Promise<void> {
    try { this.recorder?.stop(); } catch {}
    try { this.streamer?.stop(); } catch {}
    try { this.liveClient?.disconnect(); } catch {}

    if (this.outContext) {
      try { await this.outContext.close(); } catch {}
    }

    this.session = null;
    this.updateStatus('Voice service stopped');
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;
