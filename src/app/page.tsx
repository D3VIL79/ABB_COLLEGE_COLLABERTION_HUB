'use client';

import { LandingView } from '@/components/views/LandingView';
import { MouseGlow } from '@/components/shared/MouseGlow';
import { Navbar } from '@/components/shared/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MouseGlow />
      <Navbar />
      <LandingView />
    </div>
  );
}
