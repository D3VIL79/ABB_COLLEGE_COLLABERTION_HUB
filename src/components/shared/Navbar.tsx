'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const registrationUrl =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=4OkuN-CcM0CmSsBwc6kezW6EdVPy5IJMkmApxVU6LqRUMjBJNTg0U1pEQVZETFVWTldRRFUwRlhNWi4u';

const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'tracks', label: 'Tracks' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'team', label: 'Team' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 18);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function scrollToSection(id: string) {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <nav
      className={`sticky top-0 z-[900] border-b transition-colors duration-300 ${
        scrolled ? 'border-white/10 bg-black/90 backdrop-blur-md' : 'border-white/5 bg-black'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => scrollToSection('hero')}
          className="flex min-w-0 items-center gap-3 text-left"
          aria-label="Go to ABB Launchpad home"
        >
          <Image
            src="/abb-logo.png"
            alt="ABB"
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span className="min-w-0">
            <span className="block text-sm font-bold tracking-wide text-white">
              ABB Launchpad
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
          <a
            href={registrationUrl}
            target="_blank"
            rel="noreferrer"
            className="border border-[#ff000f] bg-[#ff000f] px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-[0_0_22px_rgba(255,0,15,0.28)] transition-all hover:bg-white hover:text-black"
          >
            Register
          </a>
        </div>

        <button
          onClick={() => setIsOpen((value) => !value)}
          className="grid h-10 w-10 place-items-center border border-white/10 text-white/70 md:hidden"
          aria-label="Open navigation"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
  );
}
