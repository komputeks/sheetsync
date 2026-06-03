'use client';

import { useSession, signOut as nextSignOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/supabase';

export function useAuth() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (session?.user) {
        // @ts-ignore
        const userId = session.user.id;
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        setProfile(data);
      } else {
        setProfile(null);
      }
      setLoadingProfile(false);
    }
    fetchProfile();
  }, [session]);

  const signOut = () => nextSignOut({ callbackUrl: '/' });

  return {
    user: session?.user,
    profile,
    loading: status === 'loading' || loadingProfile,
    signOut
  };
}
