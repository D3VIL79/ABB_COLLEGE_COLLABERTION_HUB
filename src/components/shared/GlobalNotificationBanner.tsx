'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Bell, Info, X } from 'lucide-react';
import { getActiveNotification, subscribeToDataChanges } from '@/services/dataService';
import { GlobalNotification } from '@/lib/supabase';

export function GlobalNotificationBanner() {
  const [notification, setNotification] = useState<GlobalNotification | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadNotification() {
      try {
        const active = await getActiveNotification();
        if (isMounted) {
          setNotification(active);
        }
      } catch (e) {
        console.error('Error loading active notification:', e);
      }
    }

    loadNotification();
    const unsubscribe = subscribeToDataChanges(() => {
      loadNotification();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (!notification || !notification.is_active || dismissedId === notification.id) {
    return null;
  }

  const isUrgent = notification.type === 'urgent';
  const isAnnouncement = notification.type === 'announcement';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative z-[950] overflow-hidden border-b border-[#ff000f]/30 bg-gradient-to-r from-[#1b0505] via-[#100808] to-[#1a0505] text-white shadow-[0_4px_24px_rgba(255,0,15,0.18)]"
      >
        {/* Glowing top line */}
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff000f] to-transparent" />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {/* Urgency Badge */}
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#ff000f]/50 bg-[#ff000f]/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#ff000f]">
              {isUrgent ? (
                <>
                  <AlertCircle className="h-3 w-3 animate-pulse text-[#ff000f]" />
                  <span>Important</span>
                </>
              ) : isAnnouncement ? (
                <>
                  <Bell className="h-3 w-3 text-[#ff000f]" />
                  <span>Announcement</span>
                </>
              ) : (
                <>
                  <Info className="h-3 w-3 text-cyan-400" />
                  <span className="text-cyan-400">Notice</span>
                </>
              )}
            </div>

            {/* Message Text */}
            <div className="min-w-0 text-xs sm:text-sm">
              <span className="font-bold text-white">{notification.title}</span>
              <span className="mx-2 hidden text-white/40 sm:inline">—</span>
              <span className="line-clamp-1 text-white/80 sm:line-clamp-none sm:inline">
                {notification.message}
              </span>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={() => setDismissedId(notification.id)}
            className="grid h-6 w-6 shrink-0 place-items-center rounded border border-white/10 text-white/60 transition-colors hover:border-[#ff000f]/50 hover:bg-[#ff000f]/20 hover:text-white"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
