import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Custom hook for debounced auto-saving form data with guaranteed
 * immediate flush on tab close/unload (beforeunload / pagehide).
 */
export function useDebouncedAutoSave<T>(
  data: T,
  saveFn: (latestData: T) => void,
  delay: number = 400
) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const latestDataRef = useRef<T>(data);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef<boolean>(false);

  latestDataRef.current = data;

  const flush = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (isDirtyRef.current) {
      saveFn(latestDataRef.current);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }
  }, [saveFn]);

  const scheduleSave = useCallback((newData: T) => {
    latestDataRef.current = newData;
    isDirtyRef.current = true;
    setSaveStatus('saving');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveFn(latestDataRef.current);
      isDirtyRef.current = false;
      setSaveStatus('saved');
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      timeoutRef.current = null;
    }, delay);
  }, [saveFn, delay]);

  // Flush on page unload or visibility change to protect against accidental tab close
  useEffect(() => {
    const handleBeforeUnload = () => {
      flush();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      flush();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [flush]);

  return { saveStatus, lastSavedTime, scheduleSave, flush };
}
