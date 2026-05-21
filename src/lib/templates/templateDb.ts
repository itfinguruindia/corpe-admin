import {
  TEMPLATE_DB_NAME,
  TEMPLATE_DB_VERSION,
  TEMPLATE_FILES_STORE,
} from "./constants";

function openTemplateDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = indexedDB.open(TEMPLATE_DB_NAME, TEMPLATE_DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to open template database."));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(TEMPLATE_FILES_STORE)) {
        db.createObjectStore(TEMPLATE_FILES_STORE);
      }
    };
  });
}

export async function saveTemplateBlob(
  storageKey: string,
  blob: Blob,
): Promise<void> {
  const db = await openTemplateDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TEMPLATE_FILES_STORE, "readwrite");
    const store = transaction.objectStore(TEMPLATE_FILES_STORE);
    const request = store.put(blob, storageKey);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to save template file."));
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("Failed to save template file."));
    };
  });
}

export async function getTemplateBlob(storageKey: string): Promise<Blob | null> {
  const db = await openTemplateDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TEMPLATE_FILES_STORE, "readonly");
    const store = transaction.objectStore(TEMPLATE_FILES_STORE);
    const request = store.get(storageKey);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to read template file."));
    };

    request.onsuccess = () => {
      const result = request.result;
      resolve(result instanceof Blob ? result : null);
    };
  });
}

export async function deleteTemplateBlob(storageKey: string): Promise<void> {
  const db = await openTemplateDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(TEMPLATE_FILES_STORE, "readwrite");
    const store = transaction.objectStore(TEMPLATE_FILES_STORE);
    const request = store.delete(storageKey);

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to delete template file."));
    };

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(
        transaction.error ?? new Error("Failed to delete template file."),
      );
    };
  });
}
