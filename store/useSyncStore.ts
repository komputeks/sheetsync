import { create } from 'zustand';

interface SyncItem {
  sheetId: string;
  status: 'queued' | 'syncing' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

interface SyncState {
  queue: Record<string, SyncItem>;
  addToQueue: (sheetId: string) => void;
  updateStatus: (sheetId: string, updates: Partial<SyncItem>) => void;
  removeFromQueue: (sheetId: string) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  queue: {},
  addToQueue: (sheetId) => set((state) => ({
    queue: { ...state.queue, [sheetId]: { sheetId, status: 'queued', progress: 0 } }
  })),
  updateStatus: (sheetId, updates) => set((state) => ({
    queue: {
      ...state.queue,
      [sheetId]: state.queue[sheetId] ? { ...state.queue[sheetId], ...updates } : undefined
    } as Record<string, SyncItem>
  })),
  removeFromQueue: (sheetId) => set((state) => {
    const newQueue = { ...state.queue };
    delete newQueue[sheetId];
    return { queue: newQueue };
  }),
}));
