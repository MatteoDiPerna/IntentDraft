import { prisma } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import { toPromptDto } from '../modules/conversations/mappers.js';
import type { PromptArtifactDto } from '../types/conversationDto.js';

async function assertConversationOwned(userId: string, conversationId: string) {
  const conv = await prisma.conversation.findFirst({ where: { id: conversationId, userId } });
  if (!conv) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }
  return conv;
}

async function getPromptOwned(userId: string, promptId: string) {
  const prompt = await prisma.promptArtifact.findFirst({
    where: { id: promptId, conversation: { userId } },
  });
  if (!prompt) {
    throw new AppError(404, 'NOT_FOUND', 'Prompt not found');
  }
  return prompt;
}

export async function getLatestPrompt(
  userId: string,
  conversationId: string,
): Promise<PromptArtifactDto> {
  await assertConversationOwned(userId, conversationId);
  const prompt = await prisma.promptArtifact.findFirst({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
  });
  if (!prompt) {
    throw new AppError(404, 'NOT_FOUND', 'No prompt for this conversation');
  }
  return toPromptDto(prompt);
}

export async function updatePromptBody(
  userId: string,
  promptId: string,
  bodyMarkdown: string,
): Promise<PromptArtifactDto> {
  await getPromptOwned(userId, promptId);
  const updated = await prisma.promptArtifact.update({
    where: { id: promptId },
    data: { bodyMarkdown },
  });
  return toPromptDto(updated);
}

export async function submitPromptFeedback(
  userId: string,
  promptId: string,
  useful: boolean,
): Promise<void> {
  await getPromptOwned(userId, promptId);
  await prisma.promptArtifact.update({
    where: { id: promptId },
    data: { feedback: useful ? 'useful' : 'not_useful' },
  });
}
