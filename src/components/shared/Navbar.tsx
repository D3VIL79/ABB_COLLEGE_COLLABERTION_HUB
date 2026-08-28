'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  Menu,
  X,
  Bell,
  Shield,
  Monitor,
  Download,
  Bot,
  AlertTriangle,
  AlertCircle,
  Megaphone,
  Info,
  Calendar,
} from 'lucide-react';
import { asset } from '@/utils/asset';
import {
  getSiteSettings,
  getGlobalNotifications,
  DEFAULT_SITE_SETTINGS,
  subscribeToDataChanges,
} from '@/services/dataService';
import { SiteSettings, GlobalNotification } from '@/lib/supabase';

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'team', label: 'Team' },
];

const securityGuidelines = [
  {
    icon: Shield,
    title: '1. Protection of Company Data',
    points: [
      'Any information, documents, files, presentations, source code, reports, or other data related to ABB must be treated as confidential.',
      'Company data must not be shared, copied, forwarded, uploaded, or transmitted to any external person, organization, personal device, or personal email account without prior authorization.',
      'Under no circumstances should confidential ABB data be stored on public or unauthorized online platforms.',
    ],
  },
  {
    icon: Monitor,
    title: '2. Use of Online Platforms',
    points: [
      'If the data is classified as confidential or sensitive, it must not be uploaded to any external website, cloud storage service, file-sharing platform, or online tool unless explicitly approved by ABB.',
      'Participants must ensure that company information remains within approved ABB systems and platforms.',
    ],
  },
  {
    icon: Download,
    title: '3. Software Installation & File Transfers',
    points: [
      'Do not install any software, applications, extensions, or utilities on the company laptop without prior approval.',
      'Before installing any software or transferring company-related files, participants must consult and obtain approval from their respective ABB mentor.',
      'Unauthorized software installations or file transfers are strictly prohibited.',
    ],
  },
  {
    icon: Bot,
    title: '4. Use of Artificial Intelligence (AI) Tools',
    points: [
      'The use of unauthorized AI tools is strictly prohibited.',
      'Participants are not permitted to enter, upload, or share ABB data with any AI platform.',
      'Only the following approved AI tools may be used: ABBY and Microsoft Copilot.',
      'No other AI applications, chatbots, or generative AI tools are allowed for ABB-related work.',
    ],
  },
  {
    icon: AlertTriangle,
    title: '5. Responsibility & Compliance',
    points: [
      'Each participant is personally responsible for safeguarding ABB information and complying with all information security requirements.',
      'Any suspected data leak, security incident, or policy violation must be reported immediately to the respective ABB mentor.',
    ],
  },
];

function NotificationCenterModal({
  isOpen,
  onClose,
  notifications,
}: {
  isOpen: boolean;
  onClose: () => void;
  notifications: GlobalNotification[];
}) {
  const activeNotifications = notifications.filter((n) => n.is_active);
  const [activeTab, setActiveTab] = useState<'announcements' | 'guidelines'>('announcements');

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      // Default to announcements if active ones exist, otherwise guidelines
      setActiveTab(activeNotifications.length > 0 ? 'announcements' : 'guidelines');
    }
  }, [isOpen, activeNotifications.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative max-h-[88vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-[#1a0a0a] to-[#0d0d0d] shadow-[0_0_60px_rgba(255,0,15,0.2)]"
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-red-500/15 bg-gradient-to-r from-[#1a0505]/95 to-[#0d0d0d]/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 ring-1 ring-red-500/30">
                <Bell className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">
                  Notification Center &amp; Guidelines
                </h2>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-400/80">
                  ABB College Collaboration Hub
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-white cursor-pointer"
              aria-label="Close notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Modal Tabs */}
          <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'announcements'
                  ? 'border border-[#ff000f]/60 bg-[#ff000f]/20 text-[#ff000f]'
                  : 'border border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>Announcements</span>
              {activeNotifications.length > 0 && (
                <span className="rounded-full bg-[#ff000f] px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {activeNotifications.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('guidelines')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'guidelines'
                  ? 'border border-red-500/60 bg-red-500/20 text-red-400'
                  : 'border border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              <span>IT Security Guidelines</span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(88vh-180px)] px-6 py-5 space-y-4">
          {/* TAB 1: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="space-y-3">
              {activeNotifications.length === 0 ? (
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center">
                  <Bell className="mx-auto h-8 w-8 text-white/30 mb-2" />
                  <h3 className="text-sm font-bold text-white">No New Announcements</h3>
                  <p className="mt-1 text-xs text-white/50">
                    You are all caught up! New updates from the event administration will appear here.
                  </p>
                </div>
              ) : (
                activeNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-[#1c0505]/70 to-[#0e0707]/70 p-4 shadow-[0_4px_20px_rgba(255,0,15,0.12)]"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-[#ff000f]" />
                    <div className="flex items-center gap-2 mb-2 pl-2">
                      {notif.type === 'urgent' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
                          <AlertCircle className="h-3 w-3 animate-pulse" />
                          Important Notice
                        </span>
                      ) : notif.type === 'announcement' ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                          <Megaphone className="h-3 w-3" />
                          Announcement
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-500/20 border border-cyan-500/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                          <Info className="h-3 w-3" />
                          Update
                        </span>
                      )}

                      {notif.created_at && (
                        <span className="text-[10px] text-white/40 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(notif.created_at).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    <div className="pl-2">
                      <h3 className="text-sm font-bold text-white">{notif.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-white/80">{notif.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: IT SECURITY GUIDELINES */}
          {activeTab === 'guidelines' && (
            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3">
                <p className="text-[13px] leading-relaxed text-amber-200/80">
                  As part of the <strong className="text-amber-100">ABB College Collaboration Hub</strong> program, company laptops and tools will be provided to support your project work. All participants are required to strictly adhere to the following guidelines.
                </p>
              </div>

              {securityGuidelines.map((section, i) => {
                const Icon = section.icon;
                return (
                  <div
                    key={i}
                    className="group rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 transition-colors hover:border-red-500/10 hover:bg-white/[0.025]"
                  >
                    <div className="mb-3 flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-red-400/80 shrink-0" />
                      <h3 className="text-[13.5px] font-bold text-white/90">{section.title}</h3>
                    </div>
                    <ul className="space-y-2 pl-6">
                      {section.points.map((point, j) => (
                        <li key={j} className="relative text-[12.5px] leading-[1.65] text-white/55">
                          <span className="absolute -left-4 top-[7px] h-1.5 w-1.5 rounded-full bg-red-500/40" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}

              <div className="rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
                <p className="text-[12.5px] font-semibold leading-relaxed text-red-300/90">
                  ⚠️ Failure to comply with these guidelines may result in the revocation of access and other actions as deemed appropriate by ABB.
                </p>
              </div>

              <p className="pt-2 pb-1 text-[12px] text-white/30 text-center">
                — ABB College Collaboration Hub Team
              </p>
            </div>
          )}
        </div>

        {/* Footer action */}
        <div className="sticky bottom-0 border-t border-white/[0.06] bg-[#0d0d0d]/95 backdrop-blur-md px-6 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-red-400 transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_24px_rgba(255,0,15,0.3)] cursor-pointer"
          >
            I Understand &amp; Acknowledge
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotice, setShowNotice] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [s, n] = await Promise.all([getSiteSettings(), getGlobalNotifications()]);
      setSettings(s);
      setNotifications(n);
    } catch (e) {
      console.error('Navbar loadData error:', e);
    }
  }, []);

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeToDataChanges(loadData);
    return () => unsubscribe();
  }, [loadData]);

  const handleCloseNotice = useCallback(() => setShowNotice(false), []);

  function scrollToSection(id: string) {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const activeCount = notifications.filter((n) => n.is_active).length;

  return (
    <>
      <nav
        className={`sticky top-0 z-[900] border-b transition-colors duration-300 ${
          scrolled ? 'border-white/10 bg-black/90 backdrop-blur-md' : 'border-white/5 bg-black'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => scrollToSection('hero')}
            className="flex min-w-0 items-center gap-3 text-left cursor-pointer"
            aria-label="Go to ABB TRI-WIN home"
          >
            <Image
              src={asset('/abb-logo.png')}
              alt="ABB"
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 object-contain"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold tracking-wide text-white">
                ABB <strong className="font-black text-white">TRI-WIN</strong>
              </span>
              <span className="block text-[10px] font-normal uppercase tracking-[0.24em] text-white/50">
                College Collaboration
              </span>
            </span>
          </button>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="px-4 py-2 text-[13px] font-normal text-white/68 transition-colors hover:text-white cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Notification & Security Alarm Bell Button */}
            <button
              onClick={() => setShowNotice(true)}
              className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/70 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
              aria-label="View notifications and announcements"
              title="Notifications & Guidelines"
            >
              <Bell className="h-[18px] w-[18px]" />

              {/* Alarm Badge Counter / Pulsing red indicator */}
              {activeCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff000f] px-1 text-[10px] font-bold text-white ring-2 ring-black shadow-[0_0_10px_#ff000f]">
                  {activeCount}
                </span>
              ) : (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
                    style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                  />
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-black" />
                </span>
              )}
            </button>

            {/* Dynamic Registration Button */}
            {settings.registration_open ? (
              <a
                href={settings.registration_url}
                target="_blank"
                rel="noreferrer"
                className="border border-[#ff000f] bg-[#ff000f] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(255,0,15,0.28)] transition-all hover:bg-white hover:text-black cursor-pointer"
              >
                {settings.registration_button_text || 'Register'}
              </a>
            ) : (
              <span
                className="border border-white/20 bg-white/5 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/40 cursor-not-allowed select-none"
                title="Registration is currently closed by the administrator"
              >
                Registration Closed
              </span>
            )}
          </div>

          {/* Mobile: bell + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowNotice(true)}
              className="relative grid h-10 w-10 place-items-center border border-white/10 text-white/70"
              aria-label="View notifications and announcements"
            >
              <Bell className="h-[18px] w-[18px]" />
              {activeCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff000f] px-1 text-[10px] font-bold text-white ring-2 ring-black">
                  {activeCount}
                </span>
              ) : (
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                  <span
                    className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"
                    style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}
                  />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-black" />
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center border border-white/10 text-white/70"
              aria-label="Open navigation"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-white/10 bg-black px-4 py-3 md:hidden">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="block w-full px-2 py-3 text-left text-sm text-white/75"
              >
                {link.label}
              </button>
            ))}
            {settings.registration_open ? (
              <a
                href={settings.registration_url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block border border-[#ff000f] bg-[#ff000f] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white"
              >
                {settings.registration_button_text || 'Register'}
              </a>
            ) : (
              <div className="mt-3 block border border-white/20 bg-white/5 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white/40 cursor-not-allowed">
                Registration Closed
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Notification Center & Guidelines Modal */}
      <NotificationCenterModal
        isOpen={showNotice}
        onClose={handleCloseNotice}
        notifications={notifications}
      />

      {/* Ping animation keyframes */}
      <style jsx global>{`
        @keyframes ping {
          75%,
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
