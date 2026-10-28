export const DOCUMENT_PREVIEW_DEFAULT_WIDTH = 480;
export const DOCUMENT_PREVIEW_MIN_WIDTH = 320;
export const DOCUMENT_PREVIEW_MAX_WIDTH = 960;

export function clampDocumentPreviewWidth(value: number) {
  return Math.min(DOCUMENT_PREVIEW_MAX_WIDTH, Math.max(DOCUMENT_PREVIEW_MIN_WIDTH, value));
}
