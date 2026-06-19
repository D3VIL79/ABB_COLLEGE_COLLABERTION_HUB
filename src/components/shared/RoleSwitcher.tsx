'use client';

import { useState } from 'react';
import { usePlatformStore, UserRole } from '@/store/usePlatformStore';
import { Shield, Sparkles, User, GraduationCap, Award, HelpCircle, ChevronUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function RoleSwitcher() {
  const { role, setRole } = usePlatformStore();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { value: UserRole; label: string; icon: any; color: string; desc: string }[] = [
    { 
      value: 'guest', 
      label: 'Public Guest', 
      icon: Sparkles, 
      color: 'text-abb-red bg-abb-red/10 border-abb-red/20',
      desc: 'ABB Event Landing Page & Tracks',
    },
    { 
      value: 'student', 
      label: 'Student Portal', 
      icon: Users, 
      color: 'text-info bg-info/10 border-info/20',
      desc: 'Team workspace, Problem explorer, Submissions',
    },
    { 
      value: 'staff', 
      label: 'Faculty Portal', 
      icon: GraduationCap, 
      color: 'text-warning bg-warning/10 border-warning/20',
      desc: 'Review team submissions, verify rosters, and view student/mentor requests',
    },
    { 
      value: 'admin', 
      label: 'ABB Admin', 
      icon: Shield, 
      color: 'text-primary bg-primary/10 border-primary/20',
      desc: 'Manage challenges/events, control phases, view global performance analytics',
    },
    { 
      value: 'judge', 
      label: 'Panel Judge', 
      icon: Award, 
      color: 'text-success bg-success/10 border-success/20',
      desc: 'Submissions scoring, Leaderboard grading',
    },
    { 
      value: 'mentor', 
      label: 'Industry Mentor', 
      icon: User, 
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      desc: 'Session scheduler, Help tickets coordinator',
    },
  ];

  const activeRoleData = roles.find((r) => r.value === role) || roles[0];

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-satoshi">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 rounded-2xl glass-panel p-4 shadow-2xl backdrop-blur-xl border border-border/40"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/20">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Switch Portal Context
              </span>
              <HelpCircle className="w-4 h-4 text-muted-foreground opacity-50" />
            </div>

            <div className="space-y-1.5">
              {roles.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.value === role;

                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setRole(item.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-200 border group ${
                      isActive 
                        ? 'bg-primary/15 border-primary/35 text-foreground' 
                        : 'border-transparent hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border ${item.color} mt-0.5 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold flex items-center gap-1.5">
                        {item.label}
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground leading-normal mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-foreground text-background dark:bg-card dark:text-foreground shadow-[0_0_20px_rgba(255,0,15,0.15)] hover:shadow-[0_0_25px_rgba(255,0,15,0.3)] border border-primary/20 dark:border-primary/30 hover:border-primary/50 transition-all duration-300 font-medium text-sm hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
        <span className="font-semibold text-xs tracking-wide uppercase">
          Portal: {activeRoleData.label.split(' ')[0]}
        </span>
        <ChevronUp className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
