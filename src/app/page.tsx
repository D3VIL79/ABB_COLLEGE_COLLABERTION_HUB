'use client';

import { LandingView } from '@/components/views/LandingView';
import { MouseGlow } from '@/components/shared/MouseGlow';
import { Navbar } from '@/components/shared/Navbar';
import { GlobalNotificationBanner } from '@/components/shared/GlobalNotificationBanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MouseGlow />
      <GlobalNotificationBanner />
      <Navbar />
      <LandingView />
    </div>
  );
}
