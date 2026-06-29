'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-surface-0">
      <div className="animate-pulse text-forge-400 text-lg">Loading CodeForge AI...</div>
    </div>
  );
}