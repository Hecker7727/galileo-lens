// knowledge608.ts
// Utilities to load and filter the project's publications to the "608 datas" subset.
// This is a conservative, non-destructive scaffold — detection heuristics can be refined
// once you confirm the canonical "608 datas" marker (tag name or source field).

import type { Publication } from '../types/dataTypes';

/**
 * Heuristics used to detect "608 datas".
 * - Check any tag value for '608' (case-insensitive)
 * - Check source string for '608'
 * - Fallback: check title/summary/abstract for '608' indicator
 *
 * NOTE: Adjust these heuristics to the concrete dataset marker once you confirm
 * the canonical field (e.g., tags.dataset === '608' or source === '608-dataset').
 */
export function is608Publication(p: Publication): boolean {
  if (!p) return false;

  // Check tags values
  const tags = p.tags;
  if (tags) {
    for (const v of Object.values(tags)) {
      if (typeof v === 'string' && v.toLowerCase().includes('608')) return true;
    }
  }

  // Check provenance/source
  if (typeof p.source === 'string' && p.source.toLowerCase().includes('608')) return true;

  // Heuristic fallback: look for "608" in title/summary/abstract
  const fields = [p.title, p.summary, p.abstract];
  for (const f of fields) {
    if (typeof f === 'string' && f.toLowerCase().includes('608')) return true;
  }

  return false;
}

/**
 * Robust loader for the processed publications module.
 * Supports different module shapes (default export, named 'publications', or exported array).
 */
export async function loadAllPublications(): Promise<Publication[]> {
  try {
    // dynamic import to avoid static coupling; caller must be running in an environment
    // where ES module dynamic import is supported (Vite / TS build).
    const mod = await import('../data/processedPublications');
    const candidate =
      (mod as any).default ?? (mod as any).publications ?? (mod as any).PUBLICATIONS ?? (mod as any);
    // candidate may be an object; try to extract an array if needed
    if (Array.isArray(candidate)) return candidate as Publication[];
    // if candidate is object with values, try to select a plausible array
    if (candidate && typeof candidate === 'object') {
      // common keys to try
      for (const key of ['items', 'data', 'publications', 'papers', 'list']) {
        if (Array.isArray((candidate as any)[key])) return (candidate as any)[key] as Publication[];
      }
    }
    // Last resort: return empty
    return [];
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to load processedPublications:', err);
    return [];
  }
}

/**
 * Return only publications identified as "608 datas".
 */
export async function get608Publications(): Promise<Publication[]> {
  const all = await loadAllPublications();
  return all.filter(is608Publication);
}

/**
 * Simple search over the 608 subset: searches title, summary, abstract (case-insensitive).
 *
 * Behavior note:
 * - If the 608 subset is empty (no publications currently marked as 608), this
 *   function falls back to searching the full publications dataset. This makes
 *   the "Test Audio" and other speak-request flows more resilient when the
 *   dataset lacks explicit 608 markers.
 */
export async function search608(query: string): Promise<Publication[]> {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return [];

  // Prefer the 608-marked subset.
  let items = await get608Publications();

  // Fallback: if no 608-marked publications exist, search the full dataset
  // to avoid silent failures for speak/test flows.
  if (!items || items.length === 0) {
    // eslint-disable-next-line no-console
    console.warn('search608: no 608-marked publications found — falling back to full publications dataset for search');
    items = await loadAllPublications();
  }

  return items.filter((p) => {
    const hay = [p.title, p.summary, p.abstract]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase())
      .join(' ');
    return hay.includes(q);
  });
}

/**
 * Return a speech-safe text for a publication (short summary).
 * Use this when speaking via voiceService to ensure only allowed content is vocalized.
 */
export function publicationSpeechText(p: Publication): string {
  if (!p) return '';
  // Prefer summary, fallback to abstract, then title
  if (p.summary && p.summary.trim().length > 0) return p.summary.trim();
  if (p.abstract && p.abstract.trim().length > 0) return p.abstract.trim();
  return p.title ?? '';
}

/**
 * Convenience: find by id in the 608 subset.
 */
export async function get608PublicationById(id: string): Promise<Publication | undefined> {
  if (!id) return undefined;
  const items = await get608Publications();
  return items.find((p) => p.id === id);
}

/**
 * NOTE:
 * - This module uses runtime dynamic import and light heuristics so it is safe to
 *   include early in the app. If you prefer static imports, replace loadAllPublications
 *   with a direct `import { publications } from '../data/processedPublications'` after
 *   confirming the exported shape.
 * - Next recommended step: wire `onSpeakRequest` in ChatterBridge to call into
 *   search608() or publicationSpeechText() and then delegate to voiceService for TTS.
 */
