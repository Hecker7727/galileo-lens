// ChatterBridge.tsx
// Lightweight bridge component to embed the chatterbots "BasicFace" demo UI into the NASA voice UI.
// Purpose: lazy-load the face UI, expose minimal props for play/stop and speak handling, and provide
// clear integration points for the knowledge filter (608 dataset) and voiceService wiring.

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useCallback } from 'react';
import type { Publication, ChatMessage } from '../types/dataTypes';
import voiceService from '../services/voiceService';

// Lazy-load the BasicFace component from our local copy
const BasicFace = React.lazy(() => import('./basic-face/BasicFace'));

export interface ChatterBridgeProps {
  isPlaying: boolean;
  // Called when the face UI requests TTS output (text produced by the agent).
  // The handler should ensure only "608 datas" content is spoken.
  onSpeakRequest?: (text: string) => Promise<void>;
  // Optional callback when the user closes/stops the face UI
  onStop?: () => void;
  // Optional publication filter to scope retrieval to the "608 datas"
  publicationsFilter?: (p: Publication) => boolean;
  className?: string;
  // Volume level for face animation (0-1)
  volume?: number;
}

/**
 * ChatterBridge
 * - Lazy-loads the BasicFace UI from the chatterbots demo.
 * - For now, forwards an onSpeak handler that delegates to onSpeakRequest.
 * - Keep this file small and focused: further wiring to voiceService, retrieval,
 *   and runtime validation will be implemented in follow-up steps.
 */
export default function ChatterBridge({
  isPlaying,
  onSpeakRequest,
  onStop,
  publicationsFilter,
  className,
  volume = 0,
}: ChatterBridgeProps) {
  useEffect(() => {
    // Listen for genai-live-client text content events dispatched on window
    // and forward them to the provided onSpeakRequest handler.
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent)?.detail;
        const text = detail?.text;
        if (text) {
          if (typeof onSpeakRequest === 'function') {
            // forward asynchronously but don't await here to avoid blocking event loop
            void onSpeakRequest(String(text));
          } else {
            // eslint-disable-next-line no-console
            console.debug('ChatterBridge: genai-live-content received but onSpeakRequest not provided', text);
          }

          // Developer bypass: if localStorage.bypass608 === '1', attempt direct TTS call
          // This helps debug environments where the 608 filter prevents audible output.
          try {
            if (localStorage.getItem('bypass608') === '1') {
              void voiceService.speak(String(text));
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('ChatterBridge: bypass speak failed', e);
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('ChatterBridge: error handling genai-live-content', e);
      }
    };

    window.addEventListener('genai-live-content', handler as EventListener);

    return () => {
      window.removeEventListener('genai-live-content', handler as EventListener);
    };
  }, [onSpeakRequest]);

  const handleSpeak = useCallback(
    async (text: string) => {
      if (typeof onSpeakRequest === 'function') {
        try {
          await onSpeakRequest(text);
        } catch (err) {
          // swallow errors for now; caller may log
          // eslint-disable-next-line no-console
          console.error('onSpeakRequest failed', err);
        }
      } else {
        // eslint-disable-next-line no-console
        console.debug('ChatterBridge: onSpeakRequest missing, received text:', text);
      }
    },
    [onSpeakRequest]
  );

  // BasicFace props are not assumed here; render it and rely on its internal controls.
  // If BasicFace supports an explicit onSpeak prop we will wire it in a follow-up change
  // after inspecting its API. This scaffolding ensures the face UI appears when playing.
  return (
    <div className={className ?? 'chatter-bridge'} aria-hidden={!isPlaying}>
      {isPlaying ? (
        <React.Suspense fallback={<div className="face-loading">Loading face UI…</div>}>
          <BasicFace
            canvasRef={React.createRef()}
            volume={volume}
            radius={150}
            color="Red"
          />
        </React.Suspense>
      ) : null}
    </div>
  );
}
