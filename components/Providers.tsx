'use client';

import { useEffect } from 'react';
import { handleGoogleRedirect } from '@/lib/googleAuth';

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    handleGoogleRedirect();
  }, []);

  return <>{children}</>;
}
