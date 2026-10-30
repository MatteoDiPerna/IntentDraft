import { API } from '@/api/endpoints';
import { request } from '@/api/client';
import type { MessagePort } from '@/adapters/types';
import type { SendMessageResponse, UploadedFileDto } from '@/types/api';
import { loadConversationDetailFromApi } from '@/adapters/api/apiConversationAdapter';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = [
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

function validateFiles(files: File[]): 'size' | 'type' | null {
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) return 'size';
    if (!ALLOWED_MIME.includes(f.type)) return 'type';
  }
  return null;
}

async function uploadFilesForConversation(
  conversationId: string,
  files: File[],
): Promise<string[]> {
  const ids: string[] = [];
  for (const f of files) {
    const form = new FormData();
    form.append('file', f);
    const res = await request<{ file: UploadedFileDto }>('POST', API.conversations.files(conversationId), {
      formData: form,
    });
    ids.push(res.file.id);
  }
  return ids;
}

export const apiMessageAdapter: MessagePort = {
  async send(userId, conversationId, text, _locale, attachmentFiles = []) {
    const trimmed = text.trim();
    if (!trimmed) return null;

    const fileErr = validateFiles(attachmentFiles);
    if (fileErr) return fileErr;

    const attachmentIds =
      attachmentFiles.length > 0
        ? await uploadFilesForConversation(conversationId, attachmentFiles)
        : undefined;

    await request<SendMessageResponse>('POST', API.conversations.messages(conversationId), {
      body: {
        content: trimmed,
        ...(attachmentIds?.length ? { attachments: attachmentIds } : {}),
      },
    });
    await loadConversationDetailFromApi(userId, conversationId);
    return null;
  },
  async editUserMessage() {
    throw new Error('NOT_IMPLEMENTED');
  },
  async skipClarification(userId, conversationId) {
    await request('POST', API.conversations.skipClarification(conversationId));
    await loadConversationDetailFromApi(userId, conversationId);
  },
  async regeneratePrompt(userId, conversationId) {
    await request('POST', API.conversations.regenerate(conversationId), { body: {} });
    await loadConversationDetailFromApi(userId, conversationId);
  },
};
