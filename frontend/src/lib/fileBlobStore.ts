const DB_NAME = 'intentdraft_file_blobs_v1';
const STORE = 'blobs';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onerror = () => reject(req.error);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

function runTx<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const req = fn(tx.objectStore(STORE));
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => {
          db.close();
          resolve(req.result);
        };
        tx.onerror = () => reject(tx.error);
      }),
  );
}

export function putFileBlob(id: string, blob: Blob): Promise<void> {
  return runTx('readwrite', (store) => store.put(blob, id)).then(() => undefined);
}

export function getFileBlob(id: string): Promise<Blob | null> {
  return runTx<Blob | undefined>('readonly', (store) => store.get(id)).then(
    (value) => value ?? null,
  );
}

export function deleteFileBlob(id: string): Promise<void> {
  return runTx('readwrite', (store) => store.delete(id)).then(() => undefined);
}

export function deleteFileBlobs(ids: string[]): Promise<void> {
  if (ids.length === 0) return Promise.resolve();
  return Promise.all(ids.map((id) => deleteFileBlob(id))).then(() => undefined);
}

export function persistAttachmentBlobs(attached: { id: string }[], files: File[]): void {
  void Promise.all(attached.map((meta, i) => putFileBlob(meta.id, files[i])));
}
