import { appConfig } from '@/config';
import { API } from '@/api/endpoints';
import { getFileBlob } from '@/lib/fileBlobStore';

export async function fetchFileBlob(fileId: string): Promise<Blob | null> {
  if (appConfig.useMock) {
    return getFileBlob(fileId);
  }
  const base = appConfig.apiUrl.replace(/\/$/, '');
  const res = await fetch(`${base}${API.files.download(fileId)}`, { credentials: 'include' });
  if (!res.ok) return null;
  return res.blob();
}
