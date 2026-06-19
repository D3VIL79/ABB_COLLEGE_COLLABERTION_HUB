'use client';

import { usePlatformStore } from '@/store/usePlatformStore';
import { StudentPortal } from './StudentPortal';
import { AdminPortal } from './AdminPortal';
import { JudgePortal } from './JudgePortal';
import { MentorPortal } from './MentorPortal';
import { DigitalTwinView } from './DigitalTwinView';
import { AnalyticsView } from './AnalyticsView';
import { motion, AnimatePresence } from 'framer-motion';

const slideTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export function PortalView() {
  const { role, activeTab } = usePlatformStore();

  function getContent() {
    // Route overrides that are shared across roles
    if (activeTab === 'twin') {
      return <DigitalTwinView />;
    }

    if (activeTab === 'analytics') {
      return <AnalyticsView />;
    }

    // Render specific portal workspaces based on user role context
    switch (role) {
      case 'student':
        return <StudentPortal />;
      case 'admin':
      case 'staff':
        return <AdminPortal />;
      case 'judge':
        return <JudgePortal />;
      case 'mentor':
        return <MentorPortal />;
      default:
        return (
          <div className="flex-grow flex items-center justify-center p-8 text-center bg-background">
            <div className="max-w-md space-y-2">
              <h3 className="text-sm font-bold text-foreground">Loading workspace...</h3>
              <p className="text-xs text-muted-foreground">
                Please use the floating role switcher at the bottom right to select a portal context.
              </p>
            </div>
          </div>
        );
    }
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${role}-${activeTab}`}
        {...slideTransition}
        className="flex-grow flex flex-col overflow-hidden h-full w-full"
      >
        {getContent()}
      </motion.div>
    </AnimatePresence>
  );
}
