import type {
  Conversation,
  Message,
  PromptArtifact,
  UploadedFile,
} from '@prisma/client';
import { parseAiState } from '../../services/orchestrator/aiState.js';
import type {
  ChatMessageDto,
  ConversationDetailDto,
  ConversationMetadataDto,
  ConversationSummaryDto,
  PromptArtifactDto,
  UploadedFileDto,
} from '../../types/conversationDto.js';

const PREVIEW_MAX = 120;

function parseMetadata(raw: unknown): ConversationMetadataDto {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  return {
    ...(typeof o.pinned === 'boolean' ? { pinned: o.pinned } : {}),
    ...(typeof o.inProject === 'boolean' ? { inProject: o.inProject } : {}),
    ...(o.projectId === null || typeof o.projectId === 'string' ? { projectId: o.projectId as string | null } : {}),
  };
}


function previewFromMessage(msg: Message | undefined): string | undefined {
  if (!msg?.content) return undefined;
  const trimmed = msg.content.trim();
  if (!trimmed) return undefined;
  return trimmed.length <= PREVIEW_MAX ? trimmed : `${trimmed.slice(0, PREVIEW_MAX)}…`;
}

export function toMessageDto(msg: Message): ChatMessageDto {
  return {
    id: msg.id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
  };
}

export function toFileDto(file: UploadedFile): UploadedFileDto {
  return {
    id: file.id,
    conversationId: file.conversationId ?? '',
    messageId: file.messageId,
    originalName: file.originalName,
    mimeType: file.mimeType,
    sizeBytes: Number(file.sizeBytes),
    scanStatus: file.scanStatus,
    createdAt: file.createdAt.toISOString(),
  };
}

export function toPromptDto(prompt: PromptArtifact): PromptArtifactDto {
  const sectionsRaw = prompt.sections;
  const sections =
    Array.isArray(sectionsRaw) &&
    sectionsRaw.every(
      (s) =>
        s &&
        typeof s === 'object' &&
        typeof (s as { heading?: unknown }).heading === 'string' &&
        typeof (s as { content?: unknown }).content === 'string',
    )
      ? (sectionsRaw as { heading: string; content: string }[])
      : [];

  return {
    version: '1',
    id: prompt.id,
    title: 'Prompt',
    bodyMarkdown: prompt.bodyMarkdown,
    sections,
    decompositionIncluded: sections.length > 0,
  };
}

export function toConversationSummaryDto(
  conv: Conversation,
  latestMessage?: Message,
): ConversationSummaryDto {
  return {
    id: conv.id,
    title: conv.title,
    status: conv.status,
    metadata: parseMetadata(conv.metadata),
    updatedAt: conv.updatedAt.toISOString(),
    createdAt: conv.createdAt.toISOString(),
    lastMessagePreview: previewFromMessage(latestMessage),
  };
}

export function toConversationDetailDto(
  conv: Conversation,
  messages: Message[],
  files: UploadedFile[],
  latestPrompt: PromptArtifact | null,
  latestMessage?: Message,
): ConversationDetailDto {
  const summary = toConversationSummaryDto(conv, latestMessage ?? messages[messages.length - 1]);
  const ai = parseAiState(conv.aiState);
  return {
    ...summary,
    messages: messages.map(toMessageDto),
    files: files.map(toFileDto),
    latestPrompt: latestPrompt ? toPromptDto(latestPrompt) : null,
    phase: ai.phase,
    interpretation: ai.interpretation,
    pendingQuestions: ai.pendingQuestions,
    clarificationTurns: ai.clarificationTurns,
  };
}
