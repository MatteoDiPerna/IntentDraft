import type { Message } from '@prisma/client';
import { prisma } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import type { Locale } from '../modules/auth/userDto.js';
import { toMessageDto, toPromptDto } from '../modules/conversations/mappers.js';
import type { SendMessageResponseDto } from '../types/messageDto.js';
import { loadEnv } from '../config/env.js';
import {
  runMessagePipelineAsync,
  runRegeneratePipelineAsync,
  runSkipPipelineAsync,
} from './orchestrator/pipeline.js';
import { toLlmAppError } from './llm/llmErrors.js';
import { parseAiState, serializeAiState } from './orchestrator/aiState.js';
import { defaultAiState, type ConversationAiState } from './orchestrator/types.js';

const AUTO_TITLE_MAX = 48;

function userContentsFromMessages(messages: Message[]): string[] {
  return messages.filter((m) => m.role === 'user').map((m) => m.content);
}

async function assertConversation(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  return conv;
}

type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

async function createPromptArtifact(
  tx: Tx,
  conversationId: string,
  bodyMarkdown: string,
  messageId?: string,
  sections?: { heading: string; content: string }[],
) {
  const last = await tx.promptArtifact.findFirst({
    where: { conversationId },
    orderBy: { version: 'desc' },
  });
  const version = (last?.version ?? 0) + 1;
  return tx.promptArtifact.create({
    data: {
      conversationId,
      messageId: messageId ?? null,
      bodyMarkdown,
      version,
      sections: sections ?? [],
    },
  });
}

export async function orchestrateSendMessage(
  userId: string,
  conversationId: string,
  content: string,
  locale: Locale,
  attachmentIds?: string[],
): Promise<SendMessageResponseDto> {
  const conv = await assertConversation(userId, conversationId);
  const trimmed = content.trim();

  if (attachmentIds?.length) {
    const owned = await prisma.uploadedFile.findMany({
      where: { id: { in: attachmentIds }, userId, conversationId },
    });
    if (owned.length !== attachmentIds.length) {
      throw new AppError(400, 'VALIDATION_ERROR', 'Invalid attachment file ids');
    }
  }

  const priorMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  const aiState = parseAiState(conv.aiState);
  const promptCount = await prisma.promptArtifact.count({ where: { conversationId } });
  const hasPrompt = promptCount > 0 || aiState.phase === 'prompt_ready';

  const env = loadEnv();
  let pipeline;
  try {
    pipeline = await runMessagePipelineAsync(
      {
        locale,
        userContents: [...userContentsFromMessages(priorMessages), trimmed],
        aiState: {
          clarificationTurns: aiState.clarificationTurns,
          pendingQuestions: aiState.pendingQuestions,
          interpretation: aiState.interpretation,
        },
        hasPrompt,
        triggerText: trimmed,
      },
      env,
    );
  } catch (err) {
    throw toLlmAppError(err);
  }

  const titlePatch =
    !conv.title.trim() && trimmed.length > 0
      ? { title: trimmed.slice(0, AUTO_TITLE_MAX) }
      : {};

  return prisma.$transaction(async (tx) => {
    const userRow = await tx.message.create({
      data: { conversationId, role: 'user', content: trimmed },
    });

    if (attachmentIds?.length) {
      await tx.uploadedFile.updateMany({
        where: { id: { in: attachmentIds } },
        data: { messageId: userRow.id },
      });
    }

    let assistantRow: Message | null = null;
    let promptArtifact = null;
    let nextState: ConversationAiState = { ...aiState, pendingQuestions: [] };

    if (pipeline.kind === 'refusal') {
      assistantRow = await tx.message.create({
        data: { conversationId, role: 'assistant', content: pipeline.assistantContent },
      });
      nextState = { ...defaultAiState(), phase: 'idle' };
    } else if (pipeline.kind === 'clarifying') {
      assistantRow = await tx.message.create({
        data: { conversationId, role: 'assistant', content: pipeline.assistantContent },
      });
      nextState = {
        ...aiState,
        phase: 'clarifying',
        pendingQuestions: pipeline.pendingQuestions,
        interpretation: null,
      };
    } else {
      promptArtifact = await createPromptArtifact(
        tx,
        conversationId,
        pipeline.promptMarkdown,
        userRow.id,
        pipeline.promptSections,
      );
      nextState = {
        phase: 'prompt_ready',
        interpretation: pipeline.interpretation,
        pendingQuestions: [],
        clarificationTurns: pipeline.clarificationTurns,
      };
    }

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        ...titlePatch,
        aiState: serializeAiState(nextState),
      },
    });

    const response: SendMessageResponseDto = {
      userMessage: toMessageDto(userRow),
      conversationPhase: nextState.phase,
    };
    if (assistantRow) {
      response.assistantMessage = toMessageDto(assistantRow);
    }
    if (promptArtifact) {
      response.prompt = toPromptDto(promptArtifact);
    }
    return response;
  });
}

export async function orchestrateSkipClarification(
  userId: string,
  conversationId: string,
  locale: Locale,
): Promise<SendMessageResponseDto> {
  const conv = await assertConversation(userId, conversationId);
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  const aiState = parseAiState(conv.aiState);
  const env = loadEnv();
  let pipeline;
  try {
    pipeline = await runSkipPipelineAsync(
      env,
      locale,
      userContentsFromMessages(messages),
      aiState.clarificationTurns,
    );
  } catch (err) {
    throw toLlmAppError(err);
  }

  if (pipeline.kind !== 'prompt_ready') {
    throw new AppError(500, 'INTERNAL_ERROR', 'Skip pipeline failed');
  }

  const promptArtifact = await prisma.$transaction(async (tx) => {
    const artifact = await createPromptArtifact(
      tx,
      conversationId,
      pipeline.promptMarkdown,
      undefined,
      pipeline.kind === 'prompt_ready' ? pipeline.promptSections : undefined,
    );
    const nextState: ConversationAiState = {
      phase: 'prompt_ready',
      interpretation: pipeline.interpretation,
      pendingQuestions: [],
      clarificationTurns: pipeline.clarificationTurns,
    };
    await tx.conversation.update({
      where: { id: conversationId },
      data: { aiState: serializeAiState(nextState) },
    });
    return artifact;
  });

  const lastUser = messages.filter((m) => m.role === 'user').at(-1);
  if (!lastUser) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No user message in conversation');
  }

  return {
    conversationPhase: 'prompt_ready',
    userMessage: toMessageDto(lastUser),
    prompt: toPromptDto(promptArtifact),
  };
}

export async function orchestrateRegenerate(
  userId: string,
  conversationId: string,
  locale: Locale,
): Promise<SendMessageResponseDto> {
  const conv = await assertConversation(userId, conversationId);
  const aiState = parseAiState(conv.aiState);
  if (!aiState.interpretation) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No interpretation to regenerate from');
  }

  const env = loadEnv();
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  });
  let regen;
  try {
    regen = await runRegeneratePipelineAsync(
      env,
      locale,
      userContentsFromMessages(messages),
      aiState.interpretation,
    );
  } catch (err) {
    throw toLlmAppError(err);
  }

  const promptArtifact = await prisma.$transaction(async (tx) => {
    const artifact = await createPromptArtifact(
      tx,
      conversationId,
      regen.promptMarkdown,
      undefined,
      regen.promptSections,
    );
    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        aiState: serializeAiState({ ...aiState, phase: 'prompt_ready' }),
      },
    });
    return artifact;
  });

  const lastUser = await prisma.message.findFirst({
    where: { conversationId, role: 'user' },
    orderBy: { createdAt: 'desc' },
  });
  if (!lastUser) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No user message in conversation');
  }

  return {
    conversationPhase: 'prompt_ready',
    userMessage: toMessageDto(lastUser),
    prompt: toPromptDto(promptArtifact),
  };
}
