import type { Env } from '../../config/env.js';
import type { Locale } from '../../modules/auth/userDto.js';
import {
  detectUnsupported,
  type PipelineInput,
  type PipelineResult,
} from '../orchestrator/mockEngine.js';
import { createAnthropicClient } from './anthropicClient.js';
import { decideEngineStep } from './decide.js';
import { extractJsonFromModelText } from './extractJson.js';
import { intentModelSchema, promptArtifactSchema, type IntentModel } from './intentModel.js';
import { LlmUnavailableError } from './llmErrors.js';
import {
  assistantReplyForQuestions,
  intentToInterpretation,
  mapClarificationQuestions,
  refusalMessage,
  artifactSections,
} from './mapIntent.js';
import {
  analyzeSystemPrompt,
  formatUserTranscript,
  generateSystemPrompt,
} from './promptTemplates.js';

async function callAnalyze(env: Env, locale: Locale, userContents: string[]): Promise<IntentModel> {
  const client = createAnthropicClient(env);
  const system = analyzeSystemPrompt(locale);
  const user = `Conversation transcript (chronological):\n${formatUserTranscript(userContents)}`;
  const completion = await client.complete(system, user);
  try {
    const raw = extractJsonFromModelText(completion.text);
    return intentModelSchema.parse(raw);
  } catch {
    const repair = await client.complete(
      system,
      `Fix your previous output to be ONLY valid JSON for the schema. Previous output:\n${completion.text.slice(0, 4000)}`,
    );
    const raw = extractJsonFromModelText(repair.text);
    return intentModelSchema.parse(raw);
  }
}

async function callGenerate(
  env: Env,
  locale: Locale,
  intent: IntentModel,
  userContents: string[],
  extraNote?: string,
): Promise<{ bodyMarkdown: string; sections: { heading: string; content: string }[] }> {
  const client = createAnthropicClient(env);
  const system = generateSystemPrompt(locale);
  const user = [
    `IntentModel JSON:\n${JSON.stringify(intent, null, 2)}`,
    `Transcript:\n${formatUserTranscript(userContents)}`,
    extraNote,
  ]
    .filter(Boolean)
    .join('\n\n');
  const completion = await client.complete(system, user);
  try {
    const raw = extractJsonFromModelText(completion.text);
    const artifact = promptArtifactSchema.parse(raw);
    return { bodyMarkdown: artifact.bodyMarkdown, sections: artifactSections(artifact) };
  } catch {
    throw new LlmUnavailableError('LLM_GENERATE_PARSE');
  }
}

export async function llmRunMessagePipeline(input: PipelineInput, env: Env): Promise<PipelineResult> {
  const { locale, userContents, aiState, hasPrompt, triggerText } = input;
  const trimmed = triggerText.trim();

  if (detectUnsupported(trimmed)) {
    return {
      kind: 'refusal',
      assistantContent:
        locale === 'it'
          ? 'Non posso aiutare con consigli medici o legali. Prova con attività di lavoro o comunicazione.'
          : "I can't help with medical or legal advice. Try work or communication tasks.",
      phase: 'idle',
    };
  }

  const intent = await callAnalyze(env, locale, userContents);
  const decision = decideEngineStep(intent, aiState.clarificationTurns);

  if (decision === 'refuse') {
    return {
      kind: 'refusal',
      assistantContent: refusalMessage(intent, locale),
      phase: 'idle',
    };
  }

  if (decision === 'ask' && !hasPrompt) {
    const pendingQuestions = mapClarificationQuestions(intent);
    return {
      kind: 'clarifying',
      assistantContent: assistantReplyForQuestions(pendingQuestions, locale),
      pendingQuestions,
      phase: 'clarifying',
    };
  }

  const generated = await callGenerate(env, locale, intent, userContents);
  const interpretation = intentToInterpretation(intent);
  return {
    kind: 'prompt_ready',
    interpretation,
    promptMarkdown: generated.bodyMarkdown,
    phase: 'prompt_ready',
    clarificationTurns: aiState.clarificationTurns + (decision === 'ask' ? 1 : 0),
    promptSections: generated.sections,
  };
}

export async function llmRunSkipPipeline(
  env: Env,
  locale: Locale,
  userContents: string[],
  clarificationTurns: number,
): Promise<PipelineResult> {
  const intent = await callAnalyze(env, locale, userContents);
  intent.assumptions.push({
    field: 'skipped',
    text:
      locale === 'it'
        ? 'Dettagli mancanti: scelte ragionevoli per PMI/professionisti.'
        : 'Missing details filled with reasonable professional defaults.',
    reason: 'user_skip',
  });
  intent.clarificationPlan = { shouldAsk: false, questions: [] };
  const generated = await callGenerate(env, locale, intent, userContents, 'User skipped clarification questions.');
  return {
    kind: 'prompt_ready',
    interpretation: intentToInterpretation(intent),
    promptMarkdown: generated.bodyMarkdown,
    phase: 'prompt_ready',
    clarificationTurns: clarificationTurns + 1,
    promptSections: generated.sections,
  };
}

export async function llmRunRegeneratePipeline(
  env: Env,
  locale: Locale,
  userContents: string[],
  interpretation: { objective: string; context?: string; audience?: string; assumptions: string[] },
): Promise<{ promptMarkdown: string; sections: { heading: string; content: string }[] }> {
  const intent: IntentModel = {
    objective: interpretation.objective,
    context: interpretation.context,
    audience: interpretation.audience,
    assumptions: interpretation.assumptions.map((text, i) => ({
      field: `a${i}`,
      text,
      reason: 'regenerate',
    })),
    complexity: 'medium',
    clarificationPlan: { shouldAsk: false, questions: [] },
    safety: { outOfScope: false },
  };
  const generated = await callGenerate(
    env,
    locale,
    intent,
    userContents,
    'Regenerate a fresh variant of the prompt with the same intent.',
  );
  return { promptMarkdown: generated.bodyMarkdown, sections: generated.sections };
}

// Extend PipelineResult for sections — update mockEngine type
