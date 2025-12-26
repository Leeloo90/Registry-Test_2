
import { useState, useEffect, useCallback } from 'react';
import { MediaFile } from '../types';

const DB_NAME = 'MediaRegistryDB';
const STORE_NAME = 'media_registry';
const DB_VERSION = 1;

export const useRegistry = () => {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [registry, setRegistry] = useState<MediaFile[]>([]);

  useEffect(() => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      setDb((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', event);
    };
  }, []);

  const refreshRegistry = useCallback(async () => {
    if (!db) return;
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      setRegistry(request.result);
    };
  }, [db]);

  useEffect(() => {
    if (db) refreshRegistry();
  }, [db, refreshRegistry]);

  const upsertMedia = useCallback((file: MediaFile) => {
    if (!db) return;
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(file);
    
    transaction.oncomplete = () => {
      refreshRegistry();
    };
  }, [db, refreshRegistry]);

  const clearRegistry = useCallback(() => {
    if (!db) return;
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.clear();
    transaction.oncomplete = () => {
      refreshRegistry();
    };
  }, [db, refreshRegistry]);

  return { registry, upsertMedia, clearRegistry, refreshRegistry };
};
