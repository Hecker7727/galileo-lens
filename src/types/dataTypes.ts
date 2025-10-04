// Core TypeScript domain types and aliases for the NASA / chatterbot integration.
// Purpose: provide a single source-of-truth for domain models, use ISO timestamps
// and money-as-integer (cents) pattern to avoid floating-point money issues.
// Keep these types serializable (use string for timestamps) to match network data.

/**
 * Simple aliases for common primitives to make intent explicit.
 */
export type ID = string;
export type Timestamp = string; // ISO 8601, e.g. "2025-10-04T16:00:00Z"
export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;

/**
 * Money represented as integer cents to avoid floating point issues.
 * Why: easier math, deterministic storage and transport.
 */
export type Cents = number;
export interface Money {
  cents: Cents;
  currency: string; // ISO currency code, e.g. "USD"
}

/**
 * Generic API response and pagination helpers.
 * Keep small and extend where necessary per-endpoint.
 */
export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, any>;
  error?: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

/**
 * BaseEntity pattern for shared fields across domain models.
 * Use Timestamp (string) for portability across network boundaries.
 */
export interface BaseEntity {
  id: ID;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  // Optional source tag for provenance (e.g., "608-dataset")
  source?: string;
}

/**
 * Graph structures used in scientific visuals and knowledge graphs.
 * These mirror fields used in the existing codebase but with stronger aliases.
 */
export interface Node extends BaseEntity {
  label: string;
  type: 'publication' | 'researcher' | 'concept' | 'experiment';
  // Prefer explicit types over `any` where possible. For flexible metadata keep Record<string, unknown>.
  properties: Record<string, unknown>;
  clusterId?: ID;
}

export interface Edge extends BaseEntity {
  source: ID;
  target: ID;
  type: 'citation' | 'collaboration' | 'related' | 'methodology';
  weight?: number;
}

export interface Cluster extends BaseEntity {
  name: string;
  nodes: ID[];
  color?: string;
  expanded?: boolean;
  summary?: string;
}

/**
 * Time-series / forecasting types
 */
export interface MetricPoint {
  timestamp: Timestamp;
  value: number;
}

export interface MetricSeries {
  id: ID;
  name: string;
  data: MetricPoint[];
  color?: string;
}

export interface ForecastResult {
  predictions: MetricPoint[];
  confidence: {
    lower: number[];
    upper: number[];
  };
  meta: {
    model: string;
    runId: string;
  };
  risks?: HealthRisk[];
  forecastExplanation?: string;
  modelUsed?: string;
  timestamp?: string;
}

export interface HealthRisk {
  id: ID;
  name: string;
  probability: number; // 0..1
  confidence: number; // 0..1
  notes?: string;
}

/**
 * Publication domain model used by NASA data and the restricted "608 datas" dataset.
 * Keep fields conservative (strings, arrays) for safe transport.
 */
export interface Publication extends BaseEntity {
  title: string;
  link?: string;
  abstract?: string;
  summary?: string;
  source?: string;
  authors?: string[];
  date?: Timestamp;
  type?: string;
  // Optional tags for indexing and retrieval; may include "608" tag in the dataset.
  tags?: Record<string, string | undefined>;
}

export interface PublicationWithTags extends Publication {
  tags: {
    organism?: string;
    researchArea?: string;
    [key: string]: string | undefined;
  };
}

/**
 * OSDR (Open Science Data Repository) types
 */
export interface OSDRStudy {
  accession: string;
  title: string;
  description?: string;
  organism?: string;
  experimentType?: string;
  releaseDate?: string;
  dataUrl?: string;
  assayTypes?: string[];
  factors?: string[];
}

/**
 * Research Gap Analysis types
 */
export interface ResearchGap {
  id: string;
  category: 'organism' | 'research_area' | 'methodology' | 'duration' | 'environment';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  evidence: string[];
  recommendations: string[];
  relatedPublications?: number;
}

export interface GapAnalysisResult {
  gaps: ResearchGap[];
  summary: string;
  totalPublications: number;
  coverageScore: number;
  timestamp: string;
}

/**
 * Chat / LLM response types used for the voice UI and chatterbot integration.
 * Use serializable primitives (timestamp string) and explicit sender enum.
 */
export type Sender = 'user' | 'assistant' | 'system' | 'agent';

export interface ChatMessage {
  id: ID;
  text: string;
  sender: Sender;
  timestamp: Timestamp;
  // attachments should be small descriptors (URLs or lightweight metadata)
  attachments?: Array<Record<string, unknown>>;
  richContent?: Record<string, unknown>;
}

/**
 * LLM / agent output structure.
 * structured can be used when models return JSON-like payloads; prefer unknown over any.
 */
export interface LLMResponse<TStructured = unknown> {
  text: string;
  structured?: TStructured;
  citations?: Citation[];
  source?: string; // provenance label if known
}

export interface Citation {
  source: string;
  url?: string;
  confidence?: number; // 0..1
}

/**
 * Predict payload - domain-specific example left in place for backward compatibility.
 */
export interface PredictPayload {
  input: {
    durationDays: number;
    gravity?: number;
    subject?: {
      age?: number;
      bmi?: number;
      activityLevel?: 'low' | 'moderate' | 'high';
    };
  };
  contextNotes?: string[];
}

/**
 * Story / interactive content models
 */
export interface StoryDefinition extends BaseEntity {
  title: string;
  description?: string;
  steps: StoryStep[];
}

export interface StoryStep {
  id: ID;
  title?: string;
  content: string;
  type: 'info' | 'choice' | 'input' | 'simulation';
  choices?: StoryChoice[];
  nextStep?: ID;
}

export interface StoryChoice {
  id: ID;
  text: string;
  nextStep: ID;
}

/**
 * E-commerce / example models preserved for compatibility with earlier templates.
 * Keep concise — not all fields are required by the NASA app, but types exist for re-use.
 */
export interface Address extends BaseEntity {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface User extends BaseEntity {
  name?: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  // Minimum profile metadata
  profile?: Record<string, unknown>;
}

export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: Money; // cents + currency
  sku?: string;
  metadata?: Record<string, unknown>;
}

export interface CartItem {
  productId: ID;
  quantity: number;
  priceAtPurchase: Money;
}

export interface Order extends BaseEntity {
  userId: ID;
  items: CartItem[];
  total: Money;
  placedAt: Timestamp;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled' | 'completed';
}

/**
 * Validation / runtime guard helpers (lightweight result type).
 * Consider adding zod/io-ts schemas in a separate file if runtime validation is required.
 */
export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Utility types for narrowing / guards (compile-time helpers).
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * NOTE:
 * - Prefer using these types across the NASA UI and the ChatterBridge to ensure
 *   messages and publications are serializable and safe for the voice pipeline.
 * - For runtime enforcement, add a companion `src/types/schemas.ts` containing zod schemas
 *   and import only where validation is needed (e.g., ingestion of the 608 dataset).
 */
