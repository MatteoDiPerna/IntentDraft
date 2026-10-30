import type { Locale } from '../modules/auth/userDto.js';
import { prisma } from '../lib/db.js';
import { AppError } from '../lib/errors.js';
import { toMessageDto } from '../modules/conversations/mappers.js';
import type { SendMessageResponseDto } from '../types/messageDto.js';

const AUTO_TITLE_MAX = 48;

const ASSISTANT_STUB: Record<Locale, string> = {
  it: 'Motore AI non ancora collegato. Il messaggio è stato salvato; la risposta completa arriverà in un aggiornamento successivo.',
  en: 'AI engine not connected yet. Your message was saved; full replies will come in a later update.',
};

export async function sendStubMessage(
  userId: string,
  conversationId: string,
  content: string,
  locale: Locale,
  options?: { attachmentIds?: string[] },
): Promise<SendMessageResponseDto> {
  if (options?.attachmentIds?.length) {
    throw new AppError(501, 'NOT_IMPLEMENTED', 'File attachments require file upload (B5)');
  }

  const conv = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });
  if (!conv) {
    throw new AppError(404, 'NOT_FOUND', 'Conversation not found');
  }

  const trimmed = content.trim();
  const titlePatch =
    !conv.title.trim() && trimmed.length > 0
      ? { title: trimmed.slice(0, AUTO_TITLE_MAX) }
      : {};

  const [userRow, assistantRow] = await prisma.$transaction(async (tx) => {
    const userMessage = await tx.message.create({
      data: {
        conversationId,
        role: 'user',
        content: trimmed,
      },
    });

    const assistantMessage = await tx.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: ASSISTANT_STUB[locale] ?? ASSISTANT_STUB.it,
      },
    });

    await tx.conversation.update({
      where: { id: conversationId },
      data: titlePatch,
    });

    return [userMessage, assistantMessage];
  });

  return {
    userMessage: toMessageDto(userRow),
    assistantMessage: toMessageDto(assistantRow),
    conversationPhase: 'idle',
  };
}
