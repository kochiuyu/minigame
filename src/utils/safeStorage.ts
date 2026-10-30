// Safe LocalStorage wrapper with in-memory fallback for iframe & restricted sandbox environments

const memoryStore: Record<string, string> = {};

function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (hasLocalStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fall through to memoryStore
    }
    return memoryStore[key] ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (hasLocalStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fall through to memoryStore
    }
    memoryStore[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (hasLocalStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {
      // Fall through to memoryStore
    }
    delete memoryStore[key];
  }
};
