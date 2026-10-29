import { appConfig } from '@/config';
import { API } from '@/api/endpoints';
import { getFileBlob } from '@/lib/fileBlobStore';

export async function downloadAttachment(
  fileId: string,
  fileName: string,
): Promise<'missing' | 'ok'> {
  if (appConfig.useMock) {
    const blob = await getFileBlob(fileId);
    if (!blob) return 'missing';
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return 'ok';
  }
  const base = appConfig.apiUrl.replace(/\/$/, '');
  window.open(`${base}${API.files.download(fileId)}`, '_blank', 'noopener,noreferrer');
  return 'ok';
}
