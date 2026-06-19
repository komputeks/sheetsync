'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Sheet } from '@/lib/supabase';

export function useSheets() {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSheets = useCallback(async () => {
    try {
      const session = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session.data.session) headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
      const res = await fetch('/api/sheets', { headers });
      const data = await res.json();
      setSheets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch sheets error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSheets(); }, [fetchSheets]);

  const createSheet = async (sheetData: Partial<Sheet>) => {
    const session = await supabase.auth.getSession();
    const res = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.data.session?.access_token}` },
      body: JSON.stringify(sheetData),
    });
    if (res.ok) fetchSheets();
    return res;
  };

  const updateSheet = async (id: string, updates: Partial<Sheet>) => {
    const session = await supabase.auth.getSession();
    const res = await fetch('/api/sheets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.data.session?.access_token}` },
      body: JSON.stringify({ id, ...updates }),
    });
    if (res.ok) fetchSheets();
    return res;
  };

  const deleteSheet = async (id: string) => {
    const session = await supabase.auth.getSession();
    const res = await fetch('/api/sheets', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.data.session?.access_token}` },
      body: JSON.stringify({ id }),
    });
    if (res.ok) fetchSheets();
    return res;
  };

  return { sheets, loading, fetchSheets, createSheet, updateSheet, deleteSheet };
}
