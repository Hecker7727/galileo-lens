// Type declarations for AudioWorklet modules
declare module '*/audio-processing' {
  const content: string;
  export default content;
}

declare module '*/vol-meter' {
  const content: string;
  export default content;
}

declare module '*/audioworklet-registry' {
  export function createWorketFromSrc(
    audioContext: AudioContext,
    name: string,
    src: string
  ): Promise<void>;
  
  export function workletExists(
    audioContext: AudioContext,
    name: string
  ): boolean;
}
