import { fetchFileBlob } from '@/lib/fetchFileBlob';

export async function downloadAttachment(
  fileId: string,
  fileName: string,
): Promise<'missing' | 'ok'> {
  const blob = await fetchFileBlob(fileId);
  if (!blob) return 'missing';
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
  return 'ok';
}
