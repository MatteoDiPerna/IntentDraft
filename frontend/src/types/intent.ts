/** Allineato a docs/product/ai/ai-prompt-engine-design.md */

export interface IntentModel {
  version: '1';
  language: 'it' | 'en' | string;
  taskSummary: string;
  objective: string;
  audience?: string;
  context?: string;
  inputs?: string[];
  constraints?: string[];
  desiredOutputFormat?: string;
  successCriteria?: string[];
  complexity: 'low' | 'medium' | 'high';
  taskType?:
    | 'writing'
    | 'analysis'
    | 'planning'
    | 'communication'
    | 'learning'
    | 'decision'
    | 'research'
    | 'other';
  gaps: GapItem[];
  assumptions: AssumptionItem[];
  clarificationPlan: ClarificationPlan;
  decomposition?: TaskStep[];
  safety: SafetyFlags;
}

export interface GapItem {
  field: string;
  description: string;
  impact: 'critical' | 'moderate' | 'low';
  canAssume: boolean;
  suggestedAssumption?: string;
}

export interface AssumptionItem {
  field: string;
  text: string;
  reason: string;
}

export interface ClarificationPlan {
  shouldAsk: boolean;
  questions: ClarificationQuestion[];
  maxTurnsRemaining: number;
}

export interface ClarificationQuestion {
  id: string;
  userFacingText: string;
  resolvesGap: string;
  impact: 'critical' | 'moderate';
  optionalSkip: boolean;
}

export interface TaskStep {
  order: number;
  title: string;
  instruction: string;
  dependsOn?: number[];
}

export interface SafetyFlags {
  outOfScope: boolean;
  highStakesDomain?: 'medical' | 'legal' | 'financial' | 'other';
  refusalReason?: string;
}
