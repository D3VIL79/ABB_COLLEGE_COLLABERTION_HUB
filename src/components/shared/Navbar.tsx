'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore } from '@/store/usePlatformStore';
import { Bell, Search, LogOut, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavbarProps {
  onSearchClick: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const { role, setRole, notifications, markNotificationAsRead, markAllNotificationsAsRead, user, activeTab, setTab } = usePlatformStore();
  const [mounted, setMounted] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavClick = (tabId: string) => {
    setIsMobileMenuOpen(false);
    if (role === 'guest') {
      const element = document.getElementById(tabId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      setTab(tabId);
    }
  };

  const navLinks = role === 'guest'
    ? [
        { id: 'hero', label: 'Home' },
        { id: 'about', label: 'About' },
        { id: 'tracks', label: 'Tracks' },
        { id: 'timeline', label: 'Schedule' },
        { id: 'mentors', label: 'Experts' },
      ]
    : [];

  const menuConfig: Record<string, { id: string; label: string }[]> = {
    student: [
      { id: 'dashboard', label: 'Home' },
      { id: 'explorer', label: 'Challenges' },
      { id: 'twin', label: 'Venue Map' },
      { id: 'leaderboard', label: 'Leaderboard' },
      { id: 'team', label: 'Submissions' },
      { id: 'help-desk', label: 'Help Desk' },
      { id: 'profile', label: 'Settings' },
    ],
    staff: [
      { id: 'dashboard', label: 'Teams Dashboard' },
      { id: 'requests', label: 'Support Requests' },
      { id: 'profile', label: 'Settings' },
    ],
    admin: [
      { id: 'dashboard', label: 'Event Hub' },
      { id: 'manage-events', label: 'Manage Events' },
      { id: 'analytics', label: 'Performance' },
      { id: 'profile', label: 'Settings' },
    ],
    judge: [
      { id: 'dashboard', label: 'Assessor Hub' },
      { id: 'judge', label: 'Grade Teams' },
      { id: 'analytics', label: 'Leaderboard' },
      { id: 'profile', label: 'Settings' },
    ],
    mentor: [
      { id: 'dashboard', label: 'Mentor Hub' },
      { id: 'mentor', label: 'Help Requests' },
      { id: 'twin', label: 'Venue Map' },
      { id: 'profile', label: 'Settings' },
    ]
  };

  return (
    <nav className={`sticky top-0 z-[999] w-full transition-all duration-300 ${
      scrolled 
        ? 'bg-black/95 backdrop-blur-sm border-b border-white/5' 
        : 'bg-black border-b border-white/5'
    }`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            {role === 'guest' && (
              <button
                onClick={() => {
                  setRole('guest');
                  setTab('home');
                }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                {/* ABB logo image */}
                <img
                  src="/abb-logo.png"
                  alt="ABB Logo"
                  className="w-10 h-10 object-contain"
                />
                <div className="hidden sm:block">
                  <div className="text-sm font-bold text-white tracking-wide">
                    College Collaboration Hub
                  </div>
                  <div className="text-[10px] font-normal text-white/50 uppercase tracking-[0.2em]">
                    Collaboration Hub
                  </div>
                </div>
              </button>
            )}

            {/* Desktop Nav Links */}
            {role === 'guest' && (
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => handleNavClick(link.id)}
                    className="px-4 py-2 text-[13px] font-normal text-white/70 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Central Search Bar (non-guest) */}
          {role !== 'guest' && (
            <div className="flex-grow max-w-md mx-auto relative hidden md:block">
              <button
                onClick={onSearchClick}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg bg-[#111] hover:bg-white/5 border border-white/5 text-white/40 text-xs font-semibold gap-2 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-white/40" />
                  <span>Search</span>
                </div>
                <kbd className="px-1.5 py-0.5 text-[9px] bg-white/5 border border-white/10 rounded font-mono">⌘K</kbd>
              </button>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            
            {/* Program Status pill */}
            {role !== 'guest' && (
              <div className="hidden sm:flex flex-col items-end leading-none mr-2">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Program Status:</span>
                <span className="mt-1 px-3 py-0.5 rounded-full border border-primary/45 bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wide">
                  Phase 2 Active
                </span>
              </div>
            )}

            {/* Notifications (non-guest) */}
            {role !== 'guest' && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`relative p-2 rounded transition-all cursor-pointer ${
                    isNotifOpen
                      ? 'bg-white/10 text-white'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>

                <AnimatePresence>
                  {isNotifOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 rounded-lg bg-[#111] border border-white/10 p-4 shadow-2xl z-50"
                      >
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">
                            Notifications ({unreadCount})
                          </h4>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-[10px] font-semibold text-primary hover:underline cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-1.5">
                          {notifications.length === 0 ? (
                            <div className="py-8 text-center text-xs text-white/40">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif.id}
                                onClick={() => markNotificationAsRead(notif.id)}
                                className={`p-2.5 rounded-lg text-left transition-all duration-200 cursor-pointer ${
                                  notif.read
                                    ? 'opacity-50 hover:opacity-70'
                                    : 'bg-white/5 hover:bg-white/8'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-xs font-semibold text-white">
                                    {notif.title}
                                  </div>
                                  {!notif.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                                  )}
                                </div>
                                <div className="text-[10px] text-white/50 mt-0.5">
                                  {notif.content}
                                </div>
                                <div className="text-[9px] text-white/30 mt-1">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Register / Profile */}
            {role === 'guest' ? (
              <button
                onClick={() => {
                  setRole('student');
                  setTab('onboarding');
                }}
                className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-[#e0000d] text-white text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer"
              >
                Register
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-3 pl-2 border-l border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=50&h=50&q=80"
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-white/10 object-cover"
                />
                <button
                  onClick={() => setTab('profile')}
                  className="hidden sm:block text-left cursor-pointer group"
                >
                  <div className="text-[10px] text-white/40 font-medium">
                    Welcome,
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-primary transition-colors mt-0.5">
                    {user.firstName} {user.lastName}
                  </div>
                </button>
                <button
                  onClick={() => setRole('guest')}
                  className="p-2 rounded text-white/40 hover:text-primary hover:bg-white/5 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white/60 hover:text-white cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden border-t border-white/5 bg-black"
            >
              <div className="py-4 space-y-1">
                {role === 'guest' ? (
                  navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      className="block w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      {link.label}
                    </button>
                  ))
                ) : (
                  (menuConfig[role] || []).map((link) => {
                    const isActive = link.id === activeTab;
                    return (
                      <button
                        key={link.id}
                        onClick={() => {
                          setTab(link.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-primary/20 text-primary font-bold border-l-2 border-primary pl-3.5'
                            : 'text-white/70 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {link.label}
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
