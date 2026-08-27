'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Menu, X, Bell, Shield, Monitor, Download, Bot, AlertTriangle } from 'lucide-react';
import { asset } from '@/utils/asset';

const registrationUrl =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u';

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

function SecurityNoticeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen, onClose]);

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
        className="relative max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-red-500/20 bg-gradient-to-b from-[#1a0a0a] to-[#0d0d0d] shadow-[0_0_60px_rgba(255,0,15,0.15)]"
        style={{ animation: 'modalSlideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-red-500/15 bg-gradient-to-r from-[#1a0505]/95 to-[#0d0d0d]/95 backdrop-blur-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/15 ring-1 ring-red-500/30">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Important Notice</h2>
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-red-400/80">Information Security & IT Usage Guidelines</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/60 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-white"
              aria-label="Close notice"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-6 py-5 space-y-1">
          {/* Intro */}
          <div className="mb-5 rounded-xl border border-amber-500/15 bg-amber-500/5 px-4 py-3">
            <p className="text-[13px] leading-relaxed text-amber-200/80">
              As part of the <strong className="text-amber-100">ABB College Collaboration Hub</strong> program, company laptops will be provided to support your project work and learning activities. All participants are required to strictly adhere to the following guidelines.
            </p>
          </div>

          {/* Guidelines */}
          {securityGuidelines.map((section, i) => {
            const Icon = section.icon;
            return (
              <div key={i} className="group rounded-xl border border-white/[0.04] bg-white/[0.015] p-4 transition-colors hover:border-red-500/10 hover:bg-white/[0.025]">
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

          {/* Warning footer */}
          <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3">
            <p className="text-[12.5px] font-semibold leading-relaxed text-red-300/90">
              ⚠️ Failure to comply with these guidelines may result in the revocation of laptop access and other actions as deemed appropriate by ABB.
            </p>
          </div>

          {/* Sign-off */}
          <p className="pt-4 pb-2 text-[12px] text-white/30 text-center">
            — ABB College Collaboration Hub Team
          </p>
        </div>

        {/* Footer action */}
        <div className="sticky bottom-0 border-t border-white/[0.06] bg-[#0d0d0d]/95 backdrop-blur-md px-6 py-3">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-red-500/30 bg-red-500/10 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-red-400 transition-all hover:bg-red-500 hover:text-white hover:shadow-[0_0_24px_rgba(255,0,15,0.3)]"
          >
            I Understand & Acknowledge
          </button>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCloseNotice = useCallback(() => setShowNotice(false), []);

  function scrollToSection(id: string) {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
          className="flex min-w-0 items-center gap-3 text-left"
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
                className="px-4 py-2 text-[13px] font-normal text-white/68 transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Security Notice Bell */}
          <button
            onClick={() => setShowNotice(true)}
            className="relative grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white/60 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
            aria-label="View security notice"
            title="Important: IT Security Guidelines"
          >
            <Bell className="h-[18px] w-[18px]" />
            {/* Pulsing red dot */}
            <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-black" />
            </span>
          </button>

          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="border border-[#ff000f] bg-[#ff000f] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(255,0,15,0.28)] transition-all hover:bg-white hover:text-black"
          >
            Register
          </a>
        </div>

        {/* Mobile: bell + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setShowNotice(true)}
            className="relative grid h-10 w-10 place-items-center border border-white/10 text-white/70"
            aria-label="View security notice"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" style={{ animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500 ring-2 ring-black" />
            </span>
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
          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block border border-[#ff000f] bg-[#ff000f] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-white"
          >
            Register
          </a>
        </div>
      )}
    </nav>

    {/* Security Notice Modal */}
    <SecurityNoticeModal isOpen={showNotice} onClose={handleCloseNotice} />

    {/* Ping animation keyframes */}
    <style jsx global>{`
      @keyframes ping {
        75%, 100% {
          transform: scale(2);
          opacity: 0;
        }
      }
    `}</style>
    </>
  );
}
