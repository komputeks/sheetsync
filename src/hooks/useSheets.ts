'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Sheet } from '@/lib/supabase';

export function useSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSheets = useCallback(async () => {
    try {
      setError(null);
      // Cookie-based auth — no Bearer token needed, cookies are sent automatically
      const res = await fetch('/api/sheets');
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to fetch sheets' }));
        throw new Error(data.error || `Failed to fetch sheets (${res.status})`);
      }
      const data = await res.json();
      setSheets(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sheets';
      console.error('Fetch sheets error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  const createSheet = async (sheetData: Partial<Sheet>): Promise<{ ok: boolean; data?: Sheet; error?: string }> => {
    try {
      setError(null);
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetData),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || `Failed to create sheet (${res.status})`;
        setError(errMsg);
        return { ok: false, error: errMsg };
      }
      await fetchSheets(); // Refresh the list
      return { ok: true, data };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create sheet';
      setError(message);
      return { ok: false, error: message };
    }
  };

  const deleteSheet = async (id: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      setError(null);
      const res = await fetch('/api/sheets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || `Failed to delete sheet (${res.status})`;
        setError(errMsg);
        return { ok: false, error: errMsg };
      }
      await fetchSheets(); // Refresh the list
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete sheet';
      setError(message);
      return { ok: false, error: message };
    }
  };

  return { sheets, loading, error, fetchSheets, createSheet, deleteSheet };
}
