'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Briefcase,
  CalendarDays,
  Cpu,
  ExternalLink,
  MapPin,
  Settings,
  Timer,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';

const targetDate = '2026-08-03T09:00:00+05:30';

const timeUnits = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Mins'],
  ['seconds', 'Secs'],
] as const;

const overviewText =
  'ABB launchpad 2026 is a flagship Industry-Academia innovation program designed to bridge the gap between classroom learning and real-world industrial challenges.';

const topicCards = [
  {
    title: 'Automation',
    description:
      'Automation is the application of technology, software, or machinery to perform tasks and processes with minimal to no human intervention. It involves setting up self-operating systems to handle repetitive, time-consuming, or dangerous work.',
  },
  {
    title: 'Digitalization',
    description:
      'Digitalization is the use of digital technologies to transform a business model, improve everyday processes, and create new value-producing opportunities. It changes how an organization operates and delivers value to its customers.',
  },
  {
    title: 'Artificial Intelligence',
    description:
      'Artificial Intelligence is the branch of computer science dedicated to creating systems capable of performing tasks that typically require human intelligence, such as understanding language, recognizing patterns, solving problems, and learning from experience.',
  },
  {
    title: 'IoT',
    description:
      'The Internet of Things refers to the network of physical objects embedded with sensors, software, and connectivity, allowing them to collect and exchange data with other devices and systems over the internet in real time.',
  },
  {
    title: 'AGV',
    description:
      'An Automated Guided Vehicle is a computer-controlled, driverless mobile robot used in industrial applications to transport materials, heavy loads, or inventory across a facility, plant, or distribution warehouse.',
  },
  {
    title: 'Simulation',
    description:
      'Simulation is the creation of a virtual model or digital replica of a real-world physical system, process, or environment. It is used to study, analyze, and predict how systems behave under different conditions.',
  },
];

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
    phase: 'Phase I',
    date: '03 August 2026',
    content: 'Kick Off Meeting',
    detail: 'Launch briefing, program expectations, and challenge orientation.',
  },
  {
    phase: 'Phase II',
    date: '06 August 2026 to 31 August 2026',
    content: 'Understanding Process & Identifying Problem Statement',
    detail: 'Observe, question, map the process, and lock the right problem.',
  },
  {
    phase: 'Phase III',
    date: '01 September 2026 to 09 October 2026',
    content: 'Working on Problem & Finding Solution',
    detail: 'Prototype, iterate with mentors, validate, and prepare the solution.',
  },
  {
    phase: 'Phase IV',
    date: '12 October 2026 to 16 October 2026',
    content: 'Final Project Submission',
    detail: 'Submit project artifacts, demo evidence, and final documentation.',
  },
  {
    phase: 'Phase V',
    date: '19 October 2026 to 30 October 2026',
    content: 'Competition',
    detail: 'Present, demo, defend, and compete for recognition.',
  },
];

const benefits = [
  {
    title: '3 Months In-Hand Training',
    desc: 'Practical industry exposure while working around real manufacturing and digital workflows.',
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
    desc: 'Hands-on exposure to engineering toolchains, simulation ideas, and structured delivery methods.',
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

const coreTeam = [
  {
    name: 'Manoj M. Wagh',
    role: 'Local Product Line Manager - Vacuum',
    linkedin: 'https://in.linkedin.com/in/manojmwagh',
  },
  {
    name: 'Rohan Ghogare',
    role: 'Local Division Operations Manager',
    linkedin: 'https://in.linkedin.com/in/rohan-ghogare-42490b16',
  },
  {
    name: 'Dayanand Kulkarni',
    role: 'Division HR Business Partner & Industrial Relations',
    linkedin: 'https://in.linkedin.com/in/dayanand-kulkarni-3420301b1',
  },
  {
    name: 'Shrikant Nimbalkar',
    role: 'Manufacturing Digitalization Manager',
    linkedin: 'https://in.linkedin.com/in/shrikant-nimbalkar-80038376',
  },
  {
    name: 'Vinod Dattawadkar',
    role: 'Sr. Manager - Production & Operational Excellence',
    linkedin: 'https://in.linkedin.com/in/vinod-dattawadkar-b6a13553',
  },
  {
    name: 'Abhijeet Vinayaksolanke',
    role: 'EL, ELDS, DSSWPAIS',
    linkedin: 'https://www.linkedin.com/search/results/people/?keywords=Abhijeet%20Vinayaksolanke%20ABB',
  },
];

const industryMentors = [
  {
    name: 'Machhindra Khadake',
    role: 'Senior Manager - Operations at ABB India Ltd',
    linkedin: 'https://in.linkedin.com/in/machhindra-khadake-627a03195',
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
  },
  {
    name: 'Yogesh Chaudhari',
    role: 'Procurement & Logistics Manager, ABB India Ltd',
    linkedin: 'https://in.linkedin.com/in/yogesh-chaudhari-4bb70958',
  },
  {
    name: 'Bhushan Dhake',
    role: 'Testing & Quality Engineer at ABB India Limited',
    linkedin: 'https://in.linkedin.com/in/bhushan-dhake-497255a8',
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
  people: typeof coreTeam;
  compact?: boolean;
}) {
  return (
    <motion.div {...stagger} className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {people.map((person) => (
        <motion.article key={person.name} variants={itemMotion} className="group">
          <h3 className="mb-4 text-xl font-bold text-white">{person.name}</h3>
          <div className="min-h-44 border border-[#ff000f] bg-white p-4 text-black transition-transform duration-300 group-hover:-translate-y-1">
            <div className="flex items-start gap-4">
              <div
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-zinc-100 text-sm font-bold text-zinc-900 ring-1 ring-zinc-200"
                aria-label={`${person.name} portrait`}
              >
                {initialsFor(person.name)}
              </div>
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
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

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
        className="mx-auto flex min-h-[64vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center sm:px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.82, y: -16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-7"
        >
          <Image
            src="/abb-logo.png"
            alt="ABB"
            width={256}
            height={112}
            priority
            className="h-24 w-64 object-contain sm:h-28"
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
          className="mt-4 text-2xl font-normal text-white/85 sm:text-4xl"
        >
          ABB College Collaboration Hub
        </motion.p>
      </section>

      <section id="about" className="border-y border-white/10 bg-black/42 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle kicker="About This Program" title="Industry-academia innovation, built for real problems" />
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
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
                  Nashik Context
                </p>
                <p className="mt-2 max-w-sm text-sm font-semibold text-white/88">
                  Inspired by Nashik&apos;s learning ecosystem, industrial presence, and places like Trimbakeshwar.
                </p>
              </motion.div>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: 0.12 }}
              className="flex flex-col justify-center border border-white/10 bg-[#090909]/72 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.36)] sm:p-8"
            >
              <p className="text-xs font-bold uppercase tracking-[0.34em] text-[#ff000f]">Overview</p>
              <p className="mt-5 text-xl font-bold leading-relaxed text-white sm:text-2xl">{overviewText}</p>
              <p className="mt-6 text-sm leading-7 text-white/70 sm:text-base">
                The ABB College Collaboration Hub brings together engineering students and ABB teams
                to solve practical industrial challenges. Participants work with mentors, explore
                automation and digital technologies, and build project solutions across a focused
                launchpad journey.
              </p>
            </motion.div>
          </div>

          <motion.div {...stagger} className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              { icon: Users, value: '15+', label: 'Participating Teams' },
              { icon: Award, value: '18', label: 'Industry Mentors' },
              { icon: Zap, value: '90', label: 'Program Days' },
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

      <section className="bg-black/38 py-14 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div {...fadeUp} className="border border-white/10 bg-[#090909]/68 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Timer className="h-6 w-6 text-[#ff000f]" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/45">Countdown</p>
                <h2 className="text-2xl font-bold text-white">Kick Off Meeting</h2>
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

      <section id="tracks" className="bg-[#050505]/42 py-14 sm:py-20">
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

      <section id="topics" className="bg-black/38 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionTitle title="Explore the Key Topics" />
          <motion.div {...stagger} className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {topicCards.map((topic) => (
              <motion.article
                key={topic.title}
                variants={itemMotion}
                whileHover={{ y: -8, borderColor: 'rgba(255,255,255,0.95)' }}
                className="border-y border-white/70 bg-black/22 px-2 py-7"
              >
                <h3 className="text-center text-xl font-bold uppercase italic text-white">
                  {topic.title}
                </h3>
                <p className="mt-8 text-sm font-semibold leading-6 text-white/85">
                  {topic.description}
                </p>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="schedule" className="bg-[#050505]/42 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle kicker="Event Schedule" title="Agenda" />
          <motion.div {...stagger} className="relative mx-auto max-w-5xl">
            <div className="absolute left-5 top-0 hidden h-full w-px bg-gradient-to-b from-[#ff000f] via-white/30 to-[#ff000f] md:block" />
            <div className="space-y-5">
              {agenda.map((item, index) => (
                <motion.article
                  key={item.phase}
                  variants={itemMotion}
                  whileHover={{ x: 8, borderColor: 'rgba(255,0,15,0.55)' }}
                  className="relative grid gap-4 border border-white/10 bg-black/42 p-5 shadow-[0_14px_44px_rgba(0,0,0,0.28)] md:grid-cols-[160px_1fr_1.2fr] md:pl-14"
                >
                  <div className="absolute left-[13px] top-7 hidden h-4 w-4 border border-[#ff000f] bg-black shadow-[0_0_18px_rgba(255,0,15,0.75)] md:block" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#ff000f]">
                      Step {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-white">{item.phase}</h3>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/42">Dates</p>
                    <p className="mt-2 text-base font-bold leading-6 text-white">{item.date}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/42">Content</p>
                    <p className="mt-2 text-base font-bold text-white">{item.content}</p>
                    <p className="mt-2 text-sm leading-6 text-white/58">{item.detail}</p>
                  </div>
                </motion.article>
              ))}
            </div>
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
        ABB Launchpad | College Collaboration Hub
      </footer>
    </main>
  );
}
