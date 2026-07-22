'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Cpu,
  ExternalLink,
  Handshake,
  Lightbulb,
  MapPin,
  Maximize2,
  MessageSquareText,
  SearchCheck,
  Settings,
  Timer,
  Trophy,
  Users,
  UsersRound,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';

const targetDate = '2026-08-03T09:00:00+05:30';

const timeUnits = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Mins'],
  ['seconds', 'Secs'],
] as const;

const trackCards = [
  {
    title: 'Automation',
    image: '/track-automation-new.jpg',
    caption: 'Control systems, machine logic, and smart line operations.',
  },
  {
    title: 'Digitalization',
    image: '/track-digitalization-new.jpg',
    caption: 'Connected workflows, dashboards, and digital process visibility.',
  },
  {
    title: 'Artificial Intelligence',
    image: '/track-ai-new.jpg',
    caption: 'Pattern recognition, prediction, and intelligent decision support.',
  },
  {
    title: 'IoT',
    image: '/track-iot-new.jpg',
    caption: 'Sensorized assets, connected devices, and live industrial data.',
  },
  {
    title: 'AGV Automated Guided Vehicle',
    image: '/track-agv-new.jpg',
    caption: 'Autonomous material movement across factory and warehouse spaces.',
  },
  {
    title: 'Simulation',
    image: '/track-simulation-new.jpg',
    caption: 'Virtual replicas for safe testing, tuning, and process validation.',
  },
];

const agenda = [
  {
    phase: 'Registration & Team Formation',
    date: 'Aug 03 – 07, 2026',
    purpose: 'Sign up, form teams of 5, and get paired with an industry mentor.',
    icon: ClipboardList,
  },
  {
    phase: 'Kick-off Meeting',
    date: 'Aug 10, 2026',
    purpose: 'Official launch day with ABB leadership, mentors, and networking.',
    icon: Handshake,
  },
  {
    phase: 'Problem Discovery & Selection',
    date: 'Aug 11 – 21, 2026',
    purpose: 'Identify real industrial challenges and finalize problem statements.',
    icon: SearchCheck,
  },
  {
    phase: 'Training & Support',
    date: 'Aug 24 – Sep 04, 2026',
    purpose: 'Focused workshops on tools, tech, and working methodologies.',
    icon: Lightbulb,
  },
  {
    phase: 'Use Case Development',
    date: 'Sep 07 – Nov 27, 2026',
    purpose: '90+ days of prototyping, iteration, and mentor-guided building.',
    icon: UsersRound,
  },
  {
    phase: 'Jury Round',
    date: 'Nov 30 – Dec 04, 2026',
    purpose: 'Top 3 solutions shortlisted by an expert evaluation panel.',
    icon: MessageSquareText,
  },
  {
    phase: 'Evaluation & Rewards',
    date: 'Dec 07 – 11, 2026',
    purpose: 'Final pitches, live demos, winner announcement, and prizes.',
    icon: Trophy,
  },
];

const benefits = [
  {
    title: '3+ Months On-Hand Training',
    desc: 'Practical 90+ day industry exposure while working around real manufacturing and digital workflows.',
    icon: Cpu,
  },
  {
    title: 'Technical Workshops',
    desc: 'Focused sessions on automation, digitalization, AI, IoT, simulation, and industrial systems.',
    icon: BookOpen,
  },
  {
    title: 'Industry Credentials',
    desc: 'Participation and achievement certificates backed by program outcomes.',
    icon: Award,
  },
  {
    title: 'Awards & Trophies',
    desc: 'Recognition for strong solutions, clear demos, and high-impact project work.',
    icon: Trophy,
  },
  {
    title: 'Multi-Field Experience',
    desc: 'Exposure across operations, production, quality, product development, and digital tools.',
    icon: Briefcase,
  },
  {
    title: 'Premium Tools Access',
    desc: 'Access to Microsoft 365 tools such as Teams, SharePoint, Forms, Planner, OneDrive, PowerPoint, Excel, and Power BI-style workflows that are not always easy to access in regular academic projects.',
    icon: Settings,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 42 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
} as const;

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: '-80px' },
} as const;

const itemMotion = {
  initial: { opacity: 0, y: 30, scale: 0.96 },
  whileInView: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 120, damping: 18 },
  },
} as const;

type Person = {
  name: string;
  role: string;
  linkedin: string;
  photo?: string;
};

const coreTeam: Person[] = [
  {
    name: 'Manoj M. Wagh',
    role: 'Local Product Line Manager - Vacuum',
    linkedin: 'https://in.linkedin.com/in/manojmwagh',
    photo: '/people/manoj-wagh.jpg',
  },
  {
    name: 'Rohan Ghogare',
    role: 'Local Division Operations Manager',
    linkedin: 'https://in.linkedin.com/in/rohan-ghogare-42490b16',
    photo: '/people/rohan-ghogare.jpg',
  },
  {
    name: 'Dayanand Kulkarni',
    role: 'Division HR Business Partner & Industrial Relations',
    linkedin: 'https://in.linkedin.com/in/dayanand-kulkarni-3420301b1',
    photo: '/people/dayanand-kulkarni.jpg',
  },
  {
    name: 'Shrikant Nimbalkar',
    role: 'Manufacturing Digitalization Manager',
    linkedin: 'https://in.linkedin.com/in/shrikant-nimbalkar-80038376',
    photo: '/people/shrikant-nimbalkar.jpg',
  },
  {
    name: 'Vinod Dattawadkar',
    role: 'Sr. Manager - Production & Operational Excellence',
    linkedin: 'https://in.linkedin.com/in/vinod-dattawadkar-b6a13553',
    photo: '/people/vinod-dattawadkar.jpg',
  },
  {
    name: 'Abhijeet Vinayaksolanke',
    role: 'EL, ELDS, DSSWPAIS',
    linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Abhijeet%20Vinayaksolanke%20ABB',
    photo: '/people/abhijeet-vinayaksolanke.jpg',
  },
];

const industryMentors: Person[] = [
  {
    name: 'Machhindra Khadake',
    role: 'Senior Manager - Operations at ABB India Ltd',
    linkedin: 'https://in.linkedin.com/in/machhindra-khadake-627a03195',
    photo: '/people/machhindra-khadake.jpg',
  },
  {
    name: 'Shivam Deore',
    role: 'Production Engineer at ABB India Ltd.',
    linkedin: 'https://in.linkedin.com/in/shivam-deore-089ab01b5',
  },
  {
    name: 'Ashok Sanap',
    role: 'AVP at ABB India Ltd.',
    linkedin: 'https://in.linkedin.com/in/ashok-sanap-a87548b1',
    photo: '/people/ashok-sanap.jpg',
  },
  {
    name: 'Pavan Harde',
    role: 'Procurement Specialist, Ex ABB',
    linkedin: 'https://in.linkedin.com/in/pavan-harde-b1092a9b',
  },
  {
    name: 'Ganesh Waichal',
    role: 'Operations Strategy & Manufacturing Excellence',
    linkedin: 'https://in.linkedin.com/in/ganesh-waichal-30242b315',
    photo: '/people/ganesh-waichal.jpg',
  },
  {
    name: 'Yogesh Chaudhari',
    role: 'Procurement & Logistics Manager, ABB India Ltd',
    linkedin: 'https://in.linkedin.com/in/yogesh-chaudhari-4bb70958',
    photo: '/people/yogesh-chaudhari.jpg',
  },
  {
    name: 'Bhushan Dhake',
    role: 'Testing & Quality Engineer at ABB India Limited',
    linkedin: 'https://in.linkedin.com/in/bhushan-dhake-497255a8',
    photo: '/people/bhushan-dhake.jpg',
  },
  {
    name: 'Surendra Sutar',
    role: 'ABB India Ltd. Field Service Engineer',
    linkedin: 'https://in.linkedin.com/in/surendra-sutar-115134277',
  },
  {
    name: 'Vikas Jadhav',
    role: 'Sub-Contracting Buyer - MV PGIS',
    linkedin: 'https://in.linkedin.com/in/vikas-jadhav-057641150',
  },
  {
    name: 'Sachin Patil',
    role: 'EL, ELSE, SER SAI A',
    linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Sachin%20Patil%20ABB%20Nashik',
    photo: '/people/sachin-patil.jpg',
  },
];

function getTimeLeft() {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  };
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  return (
    <motion.div {...fadeUp} className="mx-auto mb-10 max-w-3xl text-center">
      {kicker && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.34em] text-[#ff000f]">
          {kicker}
        </p>
      )}
      <h2 className="text-3xl font-bold text-white sm:text-5xl">{title}</h2>
    </motion.div>
  );
}

function PeopleGrid({
  people,
  compact = false,
}: {
  people: Person[];
  compact?: boolean;
}) {
  return (
    <motion.div {...stagger} className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <motion.article key={person.name} variants={itemMotion} className="group">
          <h3 className="mb-4 text-xl font-bold text-white">{person.name}</h3>
          <div className="min-h-56 border border-[#ff000f] bg-white p-4 text-black transition-transform duration-300 group-hover:-translate-y-1">
            <div className="flex items-start gap-4">
              {person.photo ? (
                <Image
                  src={person.photo}
                  alt={`${person.name} portrait`}
                  width={72}
                  height={72}
                  className="h-[72px] w-[72px] shrink-0 rounded-full object-cover ring-2 ring-zinc-100"
                />
              ) : (
                <div
                  className="grid h-[72px] w-[72px] shrink-0 place-items-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-900 ring-1 ring-zinc-200"
                  aria-label={`${person.name} portrait`}
                >
                  {initialsFor(person.name)}
                </div>
              )}
              <div className="min-w-0 pt-1">
                <p className="text-sm font-bold text-black">{person.name}</p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                  {person.role}
                </p>
                <a
                  href={person.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#ff000f]"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  LinkedIn
                </a>
              </div>
            </div>
            {!compact && <div className="mt-10 h-px w-full bg-zinc-100" />}
          </div>
        </motion.article>
      ))}
    </motion.div>
  );
}

export function LandingView() {
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPosterOpen(false);
    };
    if (isPosterOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPosterOpen]);

  useEffect(() => {
    const initial = window.setTimeout(() => setTimeLeft(getTimeLeft()), 0);
    const interval = window.setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="relative z-10 overflow-hidden bg-transparent text-white">
      <section
        id="hero"
        className="relative mx-auto flex min-h-[64vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
      >
        {/* Hero group — 5th image + text as one centered entity */}
        <div className="flex items-center gap-0 sm:gap-1 md:gap-1.5 lg:gap-2">
          {/* 5th image — left side */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="hidden shrink-0 sm:block"
          >
            <Image
              src="/abb-5th-v2.png"
              alt="5th"
              width={320}
              height={420}
              className="h-[160px] w-auto object-contain sm:h-[180px] md:h-[220px] lg:h-[270px]"
              style={{ filter: 'brightness(1.15) saturate(1.6) contrast(1.1)' }}
            />
          </motion.div>

          {/* Text content — right side */}
          <div className="flex flex-col items-center sm:items-start">
            <motion.div
              initial={{ opacity: 0, scale: 0.82, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-4"
            >
              <Image
                src="/abb-logo.png"
                alt="ABB"
                width={256}
                height={112}
                priority
                className="h-20 w-auto object-contain sm:h-24 lg:h-28"
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.12 }}
              className="text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl"
            >
              Launchpad
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.24 }}
              className="mt-3 text-xl font-normal text-white/85 sm:text-2xl lg:text-4xl"
            >
              Fuelling Ideas, Accelerating Future
            </motion.p>
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-white/10 bg-black/42 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="About This Program" title="Industry-academia innovation, built for real problems" />
          <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
            {/* Left: Nashik Image */}
            <motion.div
              {...fadeUp}
              className="group relative min-h-[380px] overflow-hidden border border-white/10 bg-black"
            >
              <Image
                src="/nashik-trimbakeshwar.png"
                alt="Trimbakeshwar, Nashik"
                width={785}
                height={505}
                className="h-full min-h-[380px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-black/10 to-black/78" />
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.65 }}
                className="absolute bottom-6 left-6 border-l-2 border-[#ff000f] bg-black/46 px-5 py-4 backdrop-blur-sm"
              >
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#ff000f]">
                  Nashik: Heritage to Innovation
                </p>
                <p className="mt-2 max-w-sm text-sm font-semibold text-white/88">
                  From Nashik&apos;s timeless Vedic wisdom and green heritage to future-ready innovations shaping a sustainable tomorrow.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Poster Image */}
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
              onClick={() => setIsPosterOpen(true)}
              className="group relative min-h-[380px] cursor-pointer overflow-hidden border border-white/10 bg-black flex items-center justify-center p-2 transition-all duration-300 hover:border-[#ff000f]/60 hover:shadow-[0_0_30px_rgba(255,0,15,0.25)]"
              title="Click to view poster full screen"
            >
              <Image
                src="/launchpad-poster.jpg"
                alt="ABB LaunchPad 5th College Collaboration Event Poster"
                width={785}
                height={1100}
                className="h-full max-h-[500px] w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                <div className="rounded-full bg-[#ff000f] p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                  <ZoomIn className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-white bg-black/80 px-3 py-1 border border-white/20">
                  Click to Expand
                </span>
              </div>
            </motion.div>
          </div>

          {/* Overview text box below image and poster */}
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.18 }}
            className="mt-8 border border-white/10 bg-[#090909]/72 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.36)] sm:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#ff000f]">Overview</p>
            <p className="mt-4 text-xl font-bold leading-relaxed text-white sm:text-2xl">
              ABB Launchpad 2026 is a flagship Industry-Academia innovation program designed to bridge the gap between classroom learning and real-world industrial challenges.
            </p>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              This program brings together engineering students and ABB teams to solve practical industrial challenges through mentoring, technology access, and focused project execution.
            </p>
          </motion.div>

          {/* Key Impact Stats */}
          <motion.div {...stagger} className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Users, value: '100+', label: 'Students Engaged' },
              { icon: Award, value: '19+', label: 'Real Business Challenges Solved' },
              { icon: BookOpen, value: '100+', label: 'Learning Hours' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  variants={itemMotion}
                  whileHover={{ y: -8, borderColor: 'rgba(255,0,15,0.65)' }}
                  className="border border-white/10 bg-[#090909]/66 p-6 text-center shadow-[0_16px_44px_rgba(0,0,0,0.28)]"
                >
                  <Icon className="mx-auto h-8 w-8 text-[#ff000f]" />
                  <span className="mt-4 block text-4xl font-bold text-white">{item.value}</span>
                  <span className="mt-2 block text-xs uppercase tracking-[0.22em] text-white/50">
                    {item.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="schedule" className="relative bg-[#050505]/42 py-14 sm:py-20 overflow-hidden">
        {/* Ambient background glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#ff000f]/[0.03] blur-[120px]" />

        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <SectionTitle kicker="Event Schedule" title="Action Plan" />

          <div className="mt-14 space-y-6">
            {agenda.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 90,
                      damping: 18,
                      delay: index * 0.07,
                    },
                  }}
                  viewport={{ once: true, margin: '-40px' }}
                  className="group relative"
                >
                  {/* Icon cube — top-left corner, overlapping the card */}
                  <div className="absolute -left-1 -top-3 z-20 hidden sm:block">
                    <div className="grid h-[34px] w-[34px] place-items-center border border-[#ff000f]/50 bg-[#0a0a0a] transition-all duration-400 group-hover:border-[#ff000f] group-hover:shadow-[0_0_20px_rgba(255,0,15,0.4)]">
                      <Icon className="h-4 w-4 text-[#ff000f]" />
                    </div>
                  </div>

                  {/* Card */}
                  <div className="relative overflow-hidden border border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-sm transition-all duration-400 group-hover:scale-[1.015] group-hover:border-[#ff000f]/30 group-hover:shadow-[0_12px_48px_rgba(255,0,15,0.1),0_4px_20px_rgba(0,0,0,0.5)] group-hover:z-10">
                    {/* Top red border line */}
                    <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#ff000f]/60 via-[#ff000f]/30 to-transparent transition-all duration-400 group-hover:from-[#ff000f] group-hover:via-[#ff000f]/60 group-hover:to-[#ff000f]/20" />

                    {/* Mobile layout */}
                    <div className="p-5 sm:hidden">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center border border-[#ff000f]/50 bg-[#0a0a0a] text-[#ff000f]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff000f]">
                            Step {String(index + 1).padStart(2, '0')}
                          </p>
                          <h3 className="text-sm font-bold text-white">{item.phase}</h3>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-white/60">{item.date}</p>
                      <p className="mt-2 text-xs leading-relaxed text-white/40">{item.purpose}</p>
                    </div>

                    {/* Desktop 3-column layout */}
                    <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1.4fr]">
                      {/* Column 1 — Step + Phase */}
                      <div className="border-r border-white/[0.06] px-7 py-6 pl-10 transition-colors duration-300 group-hover:border-[#ff000f]/10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff000f] transition-all duration-300 group-hover:tracking-[0.28em]">
                          Step {String(index + 1).padStart(2, '0')}
                        </p>
                        <h3 className="mt-1.5 text-[17px] font-bold text-white">{item.phase}</h3>
                      </div>

                      {/* Column 2 — Dates */}
                      <div className="border-r border-white/[0.06] px-7 py-6 transition-colors duration-300 group-hover:border-[#ff000f]/10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                          Dates
                        </p>
                        <p className="mt-1.5 text-[15px] font-semibold text-white/80">{item.date}</p>
                      </div>

                      {/* Column 3 — Content / Purpose */}
                      <div className="px-7 py-6">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/30">
                          Content
                        </p>
                        <p className="mt-1.5 text-[14px] leading-relaxed text-white/55 transition-colors duration-300 group-hover:text-white/70">{item.purpose}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-black/38 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div {...fadeUp} className="border border-white/10 bg-[#090909]/68 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Timer className="h-6 w-6 text-[#ff000f]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Countdown</p>
                <h2 className="text-2xl font-bold text-white">Registration Opens</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {timeUnits.map(([key, label]) => (
                <div key={key} className="border border-white/10 bg-black p-4 text-center">
                  <span className="block text-3xl font-bold tabular-nums text-white">
                    {String(timeLeft[key]).padStart(2, '0')}
                  </span>
                  <span className="mt-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-7 space-y-4 border-t border-white/10 pt-6 text-sm text-white/75">
              <p className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-[#ff000f]" />
                03 August 2026, 9:00 AM IST
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[#ff000f]" />
                ABB India Limited, Satpur, Nashik
              </p>
            </div>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.12 }}
            className="min-h-[340px] overflow-hidden border border-white/10 bg-[#090909] shadow-[0_22px_70px_rgba(0,0,0,0.38)]"
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2755.052340638405!2d73.72655283588146!3d20.002875411003306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddec671e4dde8f%3A0xe13d322758665730!2sABB%20India%20Limited!5e0!3m2!1sen!2sus!4v1781852892801!5m2!1sen!2sus"
              title="ABB India Limited Nashik map"
              width="100%"
              height="100%"
              className="h-full min-h-[340px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      <section id="benefits" className="bg-[#050505]/42 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Program Impact" title="Key Benefits" />
          <motion.div {...stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <motion.article
                  key={benefit.title}
                  variants={itemMotion}
                  whileHover={{ y: -8, scale: 1.015 }}
                  className="relative overflow-hidden border border-white/10 bg-black/46 p-5 shadow-[0_18px_54px_rgba(0,0,0,0.3)]"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff000f] to-transparent opacity-70" />
                  <div className="mb-5 grid h-11 w-11 place-items-center border border-[#ff000f]/35 bg-[#ff000f]/10 text-[#ff000f]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/64">{benefit.desc}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section id="tracks" className="bg-black/38 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="Innovation Tracks" title="Pilot Scope" />
          <motion.div {...stagger} className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {trackCards.map((track, index) => (
              <motion.article
                key={track.title}
                variants={itemMotion}
                whileHover={{ y: -10, scale: 1.018 }}
                className="group text-center"
              >
                <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-[#111] shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
                  <Image
                    src={track.image}
                    alt={track.title}
                    width={560}
                    height={360}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-black/10 to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#ff000f]">
                      Track {String(index + 1).padStart(2, '0')}
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-white/78">{track.caption}</p>
                  </div>
                </div>
                <h3 className="mt-5 text-sm font-bold uppercase text-white">{track.title}</h3>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="team" className="bg-black/38 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle title="Core Team" />
          <PeopleGrid people={coreTeam} />
        </div>
      </section>

      <section id="mentors" className="bg-[#050505]/42 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle title="Industry Mentors" />
          <PeopleGrid people={industryMentors} compact />
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black py-8 text-center text-xs uppercase tracking-[0.28em] text-white/40">
        ABB Launchpad | Fuelling Ideas, Accelerating Future
      </footer>

      {/* Fullscreen Poster Lightbox Modal */}
      <AnimatePresence>
        {isPosterOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsPosterOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4 backdrop-blur-md sm:p-8"
          >
            {/* Top controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-3 sm:top-6 sm:right-6">
              <span className="hidden text-xs font-semibold uppercase tracking-widest text-white/60 sm:inline-block">
                Press ESC or click outside to close
              </span>
              <button
                type="button"
                onClick={() => setIsPosterOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/80 text-white transition-colors hover:border-[#ff000f] hover:bg-[#ff000f]"
                aria-label="Close full screen view"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Poster image container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[92vh] max-w-[92vw] overflow-auto rounded-lg border border-white/15 bg-black p-2 shadow-2xl"
            >
              <Image
                src="/launchpad-poster.jpg"
                alt="ABB LaunchPad 5th College Collaboration Event Poster Fullscreen"
                width={1200}
                height={1680}
                priority
                className="h-auto max-h-[88vh] w-auto max-w-full object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
