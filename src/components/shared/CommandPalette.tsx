'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlatformStore, UserRole } from '@/store/usePlatformStore';
import { useTheme } from 'next-themes';
import { Search, Sparkles, Navigation, Laptop, Sun, Moon, LogOut, Check, ArrowRight, CornerDownLeft, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const { role, setRole, setTab, challenges } = usePlatformStore();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, search]);

  const allCommands = [
    // Navigation Commands
    {
      title: 'Go to Dashboard Home',
      category: 'Navigation',
      icon: Navigation,
      roles: ['student', 'staff', 'judge', 'mentor'] as UserRole[],
      action: () => { setTab('dashboard'); onClose(); }
    },
    {
      title: 'Explore Innovation Challenges',
      category: 'Navigation',
      icon: Search,
      roles: ['student', 'guest'] as UserRole[],
      action: () => { setTab('explorer'); onClose(); }
    },
    {
      title: 'Open 3D Venue Digital Twin',
      category: 'Navigation',
      icon: Sparkles,
      roles: ['student', 'staff', 'judge', 'mentor', 'guest'] as UserRole[],
      action: () => { setTab('twin'); onClose(); }
    },
    {
      title: 'Analyze Event Statistics',
      category: 'Navigation',
      icon: Laptop,
      roles: ['student', 'staff', 'judge', 'mentor', 'guest'] as UserRole[],
      action: () => { setTab('analytics'); onClose(); }
    },
    {
      title: 'Open Profile Settings',
      category: 'Navigation',
      icon: Navigation,
      roles: ['student', 'staff', 'judge', 'mentor'] as UserRole[],
      action: () => { setTab('profile'); onClose(); }
    },
    // Theme commands
    {
      title: 'Switch to Dark Mode',
      category: 'Preferences',
      icon: Moon,
      roles: ['student', 'staff', 'judge', 'mentor', 'guest'] as UserRole[],
      action: () => { setTheme('dark'); onClose(); }
    },
    {
      title: 'Switch to Light Mode',
      category: 'Preferences',
      icon: Sun,
      roles: ['student', 'staff', 'judge', 'mentor', 'guest'] as UserRole[],
      action: () => { setTheme('light'); onClose(); }
    },
    // Context Actions
    {
      title: 'Log out to Public Landing',
      category: 'Session',
      icon: LogOut,
      roles: ['student', 'staff', 'judge', 'mentor'] as UserRole[],
      action: () => { setRole('guest'); setTab('home'); onClose(); }
    },
    {
      title: 'Simulate Member Invite',
      category: 'Team Action',
      icon: Check,
      roles: ['student'] as UserRole[],
      action: () => { setTab('team'); onClose(); }
    }
  ];

  // Map challenge listings dynamically to commands
  const challengeCommands = challenges.map(ch => ({
    title: `View: ${ch.title} (${ch.track})`,
    category: 'Innovation Challenges',
    icon: Search,
    roles: ['student', 'guest'] as UserRole[],
    action: () => { 
      setTab('explorer'); 
      usePlatformStore.getState().setSelectedChallengeId(ch.id);
      onClose(); 
    }
  }));

  const commandsList = [...allCommands, ...challengeCommands];

  const filteredCommands = commandsList.filter(cmd => {
    // Filter by user role availability
    if (cmd.roles && !cmd.roles.includes(role)) return false;
    
    // Filter by search query
    return cmd.title.toLowerCase().includes(search.toLowerCase()) || 
           cmd.category.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9990] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed top-[15%] left-[50%] -translate-x-[50%] z-[9991] w-full max-w-2xl overflow-hidden rounded-2xl glass-panel shadow-2xl border border-border/40 font-satoshi"
          >
            {/* Search Input block */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border/20">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Search command actions or dashboard views..."
                className="w-full bg-transparent border-none text-sm outline-none text-foreground placeholder:text-muted-foreground"
              />
              <button 
                onClick={onClose}
                className="text-[10px] font-bold tracking-wider px-2 py-1 rounded bg-muted/60 text-muted-foreground border border-border/20 uppercase"
              >
                esc
              </button>
            </div>

            {/* Commands list */}
            <div className="max-h-[350px] overflow-y-auto p-2.5 space-y-3">
              {filteredCommands.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShieldAlert className="w-8 h-8 text-muted-foreground/40 mb-2" />
                  <p className="text-xs font-semibold text-muted-foreground">
                    No results matching your query.
                  </p>
                </div>
              ) : (
                // Grouping by category
                Object.entries(
                  filteredCommands.reduce((groups, item) => {
                    const group = groups[item.category] || [];
                    group.push(item);
                    groups[item.category] = group;
                    return groups;
                  }, {} as Record<string, typeof filteredCommands>)
                ).map(([category, items]) => (
                  <div key={category} className="space-y-1">
                    <h5 className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider px-2">
                      {category}
                    </h5>
                    <div className="space-y-0.5">
                      {items.map((cmd) => {
                        const IconComponent = cmd.icon;
                        const globalIndex = filteredCommands.indexOf(cmd);
                        const isSelected = globalIndex === selectedIndex;

                        return (
                          <button
                            key={cmd.title}
                            onClick={cmd.action}
                            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                              isSelected 
                                ? 'bg-primary text-white' 
                                : 'hover:bg-muted/30 text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <IconComponent className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-muted-foreground'}`} />
                              <span className="text-xs font-semibold">{cmd.title}</span>
                            </div>
                            {isSelected && (
                              <div className="flex items-center gap-1 text-[10px] font-bold opacity-80 uppercase">
                                <span>Go</span>
                                <CornerDownLeft className="w-3 h-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-2 border-t border-border/10 bg-muted/10 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                Use <kbd className="px-1 rounded bg-muted/40 font-mono">↑↓</kbd> keys to navigate
              </span>
              <span>
                Press <kbd className="px-1 rounded bg-muted/40 font-mono">Enter</kbd> to execute
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
