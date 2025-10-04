/**
 * React hook for managing GenAI Live API connection with audio streaming
 * Adapted from chatterbots project for NASA app
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenAILiveClient } from '../lib/genai-live-client';
import { LiveConnectConfig } from '@google/genai';
import { AudioStreamer } from '../lib/audio-streamer';
import { audioContext } from '../lib/utils';
import VolMeterWorket from '../lib/worklets/vol-meter';
import { DEFAULT_LIVE_API_MODEL } from '../lib/constants';

export type UseLiveApiResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;

  connect: () => Promise<void>;
  disconnect: () => void;
  connected: boolean;

  volume: number;
};

export function useLiveApi({
  apiKey,
  model = DEFAULT_LIVE_API_MODEL,
}: {
  apiKey: string;
  model?: string;
}): UseLiveApiResults {
  const client = useMemo(() => new GenAILiveClient(apiKey, model), [apiKey, model]);

  const audioStreamerRef = useRef<AudioStreamer | null>(null);

  const [volume, setVolume] = useState(0);
  const [connected, setConnected] = useState(false);
  const [config, setConfig] = useState<LiveConnectConfig>({});

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: 'audio-out' }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>('vumeter-out', VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          })
          .catch(err => {
            console.error('Error adding worklet:', err);
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      console.log('🟢 Live API connection opened');
      setConnected(true);
    };

    const onClose = (event?: CloseEvent) => {
      console.log('🔴 Live API connection closed', event);
      setConnected(false);
      
      // Check for quota exceeded error
      if (event?.code === 1011 && event?.reason?.toLowerCase().includes('quota')) {
        // Emit quota error as a custom event
        window.dispatchEvent(new CustomEvent('genai-quota-exceeded', { 
          detail: { 
            message: 'API quota exceeded. Please get a new API key or wait for quota reset.',
            originalReason: event.reason 
          } 
        }));
      }
    };

    const onError = (error: ErrorEvent) => {
      console.error('❌ Live API error:', error);
    };

    const stopAudioStreamer = () => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.stop();
      }
    };

    const onAudio = (data: ArrayBuffer) => {
      if (audioStreamerRef.current) {
        audioStreamerRef.current.addPCM16(new Uint8Array(data));
      }
    };

    // Bind event listeners
    client.on('open', onOpen);
    client.on('close', onClose);
    client.on('error', onError);
    client.on('interrupted', stopAudioStreamer);
    client.on('audio', onAudio);

    /**
     * Listen for 'content' events from the GenAI live client.
     * These events contain non-audio parts (text) that represent the model's
     * generated response. Extract readable text and re-dispatch it as a
     * CustomEvent on window so integrating UIs (ChatterBridge) can handle TTS.
     */
    const onContent = (content: any) => {
      try {
        const parts = content?.modelTurn?.parts || [];
        const textParts: string[] = parts
          .map((p: any) => {
            if (!p) return null;
            if (typeof p.text === 'string' && p.text.trim()) return p.text.trim();
            if (typeof p.content === 'string' && p.content.trim()) return p.content.trim();
            if (p.inlineData?.mimeType && typeof p.inlineData?.data === 'string') {
              // inlineData for text may be returned as plain string
              if (String(p.inlineData.mimeType).startsWith('text/')) return p.inlineData.data;
            }
            return null;
          })
          .filter(Boolean) as string[];

        if (textParts.length) {
          const text = textParts.join(' ').trim();
          if (text) {
            window.dispatchEvent(new CustomEvent('genai-live-content', { detail: { text } }));
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('useLiveApi: failed to parse content event', e);
      }
    };

    client.on('content', onContent);

    return () => {
      // Clean up event listeners
      client.off('open', onOpen);
      client.off('close', onClose);
      client.off('error', onError);
      client.off('interrupted', stopAudioStreamer);
      client.off('audio', onAudio);
      client.off('content', onContent);
    };
  }, [client]);

  const connect = useCallback(async () => {
    // Use empty config by default - it works fine for basic connection
    client.disconnect();
    await client.connect(config || {});
  }, [client, config]);

  const disconnect = useCallback(async () => {
    client.disconnect();
    setConnected(false);
  }, [setConnected, client]);

  return {
    client,
    config,
    setConfig,
    connect,
    connected,
    disconnect,
    volume,
  };
}
