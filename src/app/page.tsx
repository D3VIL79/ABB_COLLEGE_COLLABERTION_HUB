'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Navbar } from '@/components/shared/Navbar';
import { Sidebar } from '@/components/shared/Sidebar';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { LandingView } from '@/components/views/LandingView';
import { OnboardingView } from '@/components/views/OnboardingView';
import { PortalView } from '@/components/views/PortalView';
import { MouseGlow } from '@/components/shared/MouseGlow';
import { ToastContainer } from '@/components/shared/ToastContainer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const { role, activeTab } = usePlatformStore();
  const [mounted, setMounted] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // 1. Wait for mounting to avoid hydration flashes
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Keyboard shortcut listener for Command Palette (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-grow flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center animate-pulse">
            <img
              src="/abb-logo.png"
              alt="ABB Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-xs font-normal tracking-wider text-white/40 uppercase">
            Loading Platform...
          </span>
        </div>
      </div>
    );
  }

  const isGuest = role === 'guest';
  const isOnboarding = role === 'student' && activeTab === 'onboarding';

  return (
    <div className="flex-grow flex flex-col min-h-screen bg-background relative z-10 transition-colors duration-300">
      
      {/* Interactive mouse glow */}
      <MouseGlow />

      {/* Global Toast Notifications Container */}
      <ToastContainer />

      {/* Search Spotlights Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Dynamic role indicator switcher pill */}
      <RoleSwitcher />

      {/* Global Navigation header — only show if guest */}
      {isGuest && <Navbar onSearchClick={() => setIsCommandOpen(true)} />}

      {/* Screen layout Router */}
      <div className="flex-grow flex relative">
        <AnimatePresence mode="wait">
          {isGuest ? (
            <motion.div
              key="guest-landing"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-grow flex flex-col w-full"
            >
              <LandingView />
            </motion.div>
          ) : isOnboarding ? (
            <motion.div
              key="onboarding-setup"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-grow flex flex-col w-full"
            >
              <OnboardingView />
            </motion.div>
          ) : (
            <motion.div
              key="portal-workspace"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex-grow flex w-full h-screen overflow-hidden"
            >
              {/* Sidebar navigation panel */}
              <Sidebar />

              {/* Central Portal Router view workspace with header inside */}
              <div className="flex-grow flex flex-col h-screen overflow-hidden relative">
                <Navbar onSearchClick={() => setIsCommandOpen(true)} />
                <div className="flex-grow overflow-hidden relative">
                  <PortalView />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
