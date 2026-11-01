import { useState, useCallback, useEffect } from 'react';
import { BannerAdState } from '../types';

const MAX_HISTORY_LENGTH = 30;

export interface BannerHistoryControls {
  state: BannerAdState;
  setState: (
    next: BannerAdState | ((prev: BannerAdState) => BannerAdState),
    recordHistory?: boolean
  ) => void;
  undo: () => boolean;
  redo: () => boolean;
  canUndo: boolean;
  canRedo: boolean;
  historyLength: number;
  resetHistory: (newState: BannerAdState) => void;
}

export function useBannerHistory(initialState: BannerAdState): BannerHistoryControls {
  const [history, setHistory] = useState<{
    past: BannerAdState[];
    present: BannerAdState;
    future: BannerAdState[];
  }>({
    past: [],
    present: initialState,
    future: [],
  });

  const setState = useCallback(
    (
      next: BannerAdState | ((prev: BannerAdState) => BannerAdState),
      recordHistory: boolean = true
    ) => {
      setHistory((curr) => {
        const nextPresent = typeof next === 'function' ? next(curr.present) : next;

        // Skip if identical reference or no deep change
        if (nextPresent === curr.present) {
          return curr;
        }

        if (!recordHistory) {
          return {
            ...curr,
            present: nextPresent,
          };
        }

        const newPast = [...curr.past, curr.present].slice(-MAX_HISTORY_LENGTH);
        return {
          past: newPast,
          present: nextPresent,
          future: [], // clear redo stack on new action
        };
      });
    },
    []
  );

  const undo = useCallback((): boolean => {
    let succeeded = false;
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;
      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);
      succeeded = true;
      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
    return succeeded;
  }, []);

  const redo = useCallback((): boolean => {
    let succeeded = false;
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;
      const next = curr.future[0];
      const newFuture = curr.future.slice(1);
      succeeded = true;
      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
    return succeeded;
  }, []);

  const resetHistory = useCallback((newState: BannerAdState) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  // Global Keyboard shortcuts: Ctrl+Z / Cmd+Z and Ctrl+Y / Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          // Redo
          e.preventDefault();
          redo();
        } else {
          // Undo
          e.preventDefault();
          undo();
        }
      } else if (modifier && e.key.toLowerCase() === 'y' && !isMac) {
        // Redo on Windows/Linux
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    state: history.present,
    setState,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    historyLength: history.past.length,
    resetHistory,
  };
}
