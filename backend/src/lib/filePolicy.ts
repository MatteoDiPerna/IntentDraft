export const ALLOWED_MIME_TYPES = new Set([
  'text/plain',
  'text/markdown',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export function assertAllowedMime(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('MIME_NOT_ALLOWED');
  }
}

export function sanitizeOriginalName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'file';
  return base.replace(/[^\w.\- ()[\]]+/g, '_').slice(0, 255) || 'file';
}
