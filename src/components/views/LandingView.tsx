'use client';

import { useState, useEffect, useRef } from 'react';
import { usePlatformStore, Challenge } from '@/store/usePlatformStore';
import {
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Award,
  ChevronDown,
  Zap,
  Clock,
  ExternalLink,
  X,
  Cpu,
  BookOpen,
  Trophy,
  Briefcase,
  Settings,
  ClipboardList,
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView, animate, AnimatePresence } from 'framer-motion';

/* ------------------------------------------------------------------ */
/*  CountUp Animation Component                                       */
/* ------------------------------------------------------------------ */
function CountUp({ to, duration = 2 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, to, {
      duration,
      ease: 'easeOut',
      onUpdate(value) {
        node.textContent = Math.round(value).toString();
      },
    });

    return () => controls.stop();
  }, [to, duration, inView]);

  return <span ref={ref}>0</span>;
}

/* ------------------------------------------------------------------ */
/*  Shared animation presets                                          */
/* ------------------------------------------------------------------ */
const EASE = [0.25, 0.46, 0.45, 0.94] as const;

const slideUp = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' } as const,
  transition: { duration: 0.7, ease: EASE },
};

const slideLeft = {
  initial: { opacity: 0, x: -60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-50px' } as const,
  transition: { duration: 0.7, ease: EASE },
};

const slideRight = {
  initial: { opacity: 0, x: 60 },
  whileInView: { opacity: 1, x: 0 },
  viewport: { once: true, margin: '-50px' } as const,
  transition: { duration: 0.7, ease: EASE },
};

const scaleUp = {
  initial: { opacity: 0, scale: 0.92 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, margin: '-50px' } as const,
  transition: { duration: 0.5, ease: EASE },
};

const cardStaggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardStaggerChild = {
  initial: { opacity: 0, y: 40, scale: 0.96 },
  whileInView: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 16, mass: 0.8 },
  },
} as const;

const bookVariants = {
  initial: (direction: number) => ({
    rotateY: direction > 0 ? 80 : -80,
    opacity: 0,
    transformOrigin: direction > 0 ? 'left center' : 'right center',
  }),
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.55,
      ease: EASE,
    },
  },
  exit: (direction: number) => ({
    rotateY: direction > 0 ? -80 : 80,
    opacity: 0,
    transformOrigin: direction > 0 ? 'left center' : 'right center',
    transition: {
      duration: 0.55,
      ease: EASE,
    },
  }),
};

/* ------------------------------------------------------------------ */
/*  Timeline data                                                     */
/* ------------------------------------------------------------------ */
const timelineEvents = [
  {
    date: 'June 22, 2026',
    title: 'Opening Ceremony & Keynote',
    description:
      'Platform launch, welcome address from ABB leadership, and innovation challenge briefing.',
  },
  {
    date: 'June 22, 2026',
    title: 'Team Formation & Ideation',
    description:
      'Form your teams, select your challenge track, and begin the brainstorming sprint.',
  },
  {
    date: 'June 23, 2026',
    title: 'Workshops & Mentor Sessions',
    description:
      'Attend hands-on workshops on Smart Grids, Robotics, Edge AI, and Sustainability.',
  },
  {
    date: 'June 24, 2026',
    title: 'Checkpoint Review',
    description:
      'Present your project architecture and progress to mentors for mid-event feedback.',
  },
  {
    date: 'June 25, 2026',
    title: 'Final Submissions Due',
    description:
      'Submit your code repositories, demo videos, and presentation decks by 23:59 IST.',
  },
  {
    date: 'June 26, 2026',
    title: 'Demo Day & Awards Ceremony',
    description:
      'Top teams present live demos. Winners announced and prizes awarded by ABB executives.',
  },
];

/* ------------------------------------------------------------------ */
/*  Mentor data (static for landing page display)                     */
/* ------------------------------------------------------------------ */
const landingMentors = [
  { initials: 'MV', name: 'Dr. Marcus Vancamp', title: 'Principal Research Engineer', company: 'ABB Energy Industries' },
  { initials: 'ER', name: 'Elena Rostova', title: 'Senior Software Architect', company: 'ABB Robotics & Discrete Automation' },
  { initials: 'KS', name: 'Kenji Sato', title: 'Lead Robotics Researcher', company: 'ABB Corporate Research' },
  { initials: 'SJ', name: 'Sarah Jenkins', title: 'Edge AI Lead Scientist', company: 'ABB Digital Ventures' },
  { initials: 'AP', name: 'Ananya Patel', title: 'Sustainability Lead', company: 'ABB Process Automation' },
  { initials: 'RK', name: 'Raj Kumar', title: 'IoT Platform Architect', company: 'ABB Electrification' },
];

/* ------------------------------------------------------------------ */
/*  Difficulty color helper                                           */
/* ------------------------------------------------------------------ */
function difficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner':
      return 'text-green-400';
    case 'Intermediate':
      return 'text-yellow-400';
    case 'Advanced':
      return 'text-orange-400';
    case 'Expert':
      return 'text-red-400';
    default:
      return 'text-muted-foreground';
  }
}

/* ================================================================== */
/*  LandingView Component                                             */
/* ================================================================== */
export function LandingView() {
  const { challenges, setRole, setTab, countdownDate, phases } = usePlatformStore();
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
  const [selectedTrackChallenge, setSelectedTrackChallenge] = useState<Challenge | null>(null);
  const [activePsIndex, setActivePsIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setActivePsIndex(0);
    setDirection(0);
  }, [selectedTrackChallenge]);

  /* ---- Scroll animations setup ---- */
  const { scrollYProgress: pageScrollY } = useScroll();
  const scaleX = useTransform(pageScrollY, [0, 1], [0, 1]);

  // Hero Parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(heroScroll, [0, 1], ['0px', '120px']);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.96]);

  // Timeline Drawing Scroll
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineScroll } = useScroll({
    target: timelineRef,
    offset: ['start center', 'end center'],
  });

  /* ---- Countdown timer ---- */
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(countdownDate).getTime();

    function tick() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setTimeLeft({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [countdownDate]);

  const formattedTargetDate = new Date(countdownDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  /* ---- CTA handler ---- */
  function handleRegister() {
    setRole('student');
    setTab('onboarding');
  }

  /* ================================================================ */
  return (
    <div className="min-h-screen bg-black text-white font-sans relative">
      {/* Top Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-50 shadow-[0_0_8px_#FF000F]"
        style={{ scaleX }}
      />

      {/* ============================================================ */}
      {/*  1. HERO SECTION                                             */}
      {/* ============================================================ */}
      <section
        id="hero"
        ref={heroRef}
        className="relative flex flex-col items-center justify-center min-h-[60vh] bg-black overflow-hidden py-4 md:py-6"
      >
        {/* Subtle radial gradient overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,0,15,0.08) 0%, transparent 70%)',
          }}
        />

        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-6xl w-full mx-auto"
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          {/* ABB Logo mark */}
          <motion.div
            className="mb-2 flex items-center justify-center w-64 h-16 sm:w-72 sm:h-20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src="/abb-logo.png"
              alt="ABB Logo"
              className="w-full h-full object-contain"
            />
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          >
            ABB College Collaboration Hub
          </motion.h1>

          {/* Map on left, Timer on right side-by-side grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-12 items-stretch text-left">
            {/* Left side: Map */}
            <motion.div
              className="w-full min-h-[300px] md:min-h-[380px] rounded-2xl border border-white/10 overflow-hidden shadow-[0_8px_32px_rgba(255,0,15,0.15)] relative group flex"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2755.052340638405!2d73.72655283588146!3d20.002875411003306!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddec671e4dde8f%3A0xe13d322758665730!2sABB%20India%20Limited!5e0!3m2!1sen!2sus!4v1781852892801!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full"
              />
            </motion.div>

            {/* Right side: Timer and Date */}
            <motion.div
              className="flex flex-col justify-center bg-[#111111]/40 border border-white/5 rounded-2xl p-6 sm:p-8"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
            >
              <div className="flex flex-col space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                    Registration Closes In
                  </h3>
                  <div className="flex gap-3 sm:gap-4 flex-wrap">
                    {[
                      { label: 'Days', value: timeLeft.days },
                      { label: 'Hours', value: timeLeft.hours },
                      { label: 'Mins', value: timeLeft.minutes },
                      { label: 'Secs', value: timeLeft.seconds },
                    ].map((unit) => (
                      <div key={unit.label} className="text-center bg-[#111111] border border-white/10 rounded-xl px-3 py-2 min-w-[70px] sm:min-w-[80px]">
                        <span className="block text-2xl sm:text-3xl font-bold text-white tabular-nums">
                          {String(unit.value).padStart(2, '0')}
                        </span>
                        <span className="block text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                          {unit.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3">
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Date</span>
                    <span className="text-sm font-semibold text-white mt-1 block">
                      {formattedTargetDate}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">Venue Location</span>
                    <div className="flex items-center gap-2 text-sm text-white font-medium mt-1">
                      <MapPin className="w-4.5 h-4.5 text-primary shrink-0" />
                      <span>Satpur, Nashik, Maharashtra, India</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTA below both */}
          <motion.div
            className="mt-12 flex justify-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <button
              onClick={handleRegister}
              className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-lg px-12 py-4 rounded-lg hover:bg-primary/90 transition-all hover:scale-[1.02] cursor-pointer shadow-[0_4px_20px_rgba(255,0,15,0.2)]"
            >
              Register Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  2. ABOUT SECTION                                            */}
      {/* ============================================================ */}
      <section id="about" className="bg-black py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div {...slideUp} className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-6">
              About The Program
            </h2>
          </motion.div>
          <motion.p
            {...slideUp}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto text-center"
          >
            The ABB College Collaboration Hub brings together the brightest
            engineering students from across five premier engineering colleges to solve
            real-world industrial challenges. Over 90 intensive days, participants work
            alongside ABB engineers and mentors to prototype innovative solutions spanning
            e-operations, production planning, quality management, new product development,
            digitalization, AI, and IoT. This is more than a hackathon — it&apos;s a launchpad
            for the next generation of industrial technology leaders.
          </motion.p>

          {/* Stats row */}
          <motion.div
            {...slideUp}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto items-center"
          >
            {/* Card 1: Teams */}
            <div className="text-center">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <span className="block text-4xl sm:text-5xl font-bold text-white">
                <CountUp to={15} />+
              </span>
              <span className="block mt-2 text-sm text-muted-foreground uppercase tracking-wider">
                Participating Teams
              </span>
            </div>

            {/* Card 2: Mentors */}
            <div className="text-center">
              <Award className="w-8 h-8 text-primary mx-auto mb-3" />
              <span className="block text-4xl sm:text-5xl font-bold text-white">
                <CountUp to={18} />
              </span>
              <span className="block mt-2 text-sm text-muted-foreground uppercase tracking-wider">
                Industry Mentors
              </span>
            </div>

            {/* Card 3: Elite Benefits (Modal Trigger) */}
            <div 
              onClick={() => setIsBenefitsOpen(true)}
              className="text-center cursor-pointer group hover:scale-[1.05] transition-transform duration-300 bg-[#111111]/30 hover:bg-[#111111]/60 border border-white/5 hover:border-primary/30 p-6 rounded-2xl"
            >
              <Zap className="w-8 h-8 text-primary mx-auto mb-3 group-hover:animate-pulse" />
              <span className="block text-2xl sm:text-3xl font-extrabold text-white group-hover:text-primary transition-colors">
                Elite Benefits
              </span>
              <span className="block mt-2 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
                Click to View Details →
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  3. TRACKS / CHALLENGES SECTION                              */}
      {/* ============================================================ */}
      <section id="tracks" className="bg-[#050505] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...slideUp}
            className="text-3xl sm:text-4xl font-bold text-primary text-center mb-4"
          >
            Innovation Tracks
          </motion.h2>
          <motion.p
            {...slideUp}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          >
            Choose your challenge track and build solutions that push the boundaries
            of industrial technology.
          </motion.p>

          <motion.div
            variants={cardStaggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                variants={cardStaggerChild}
                whileHover={{
                  y: -8,
                  borderColor: 'rgba(255, 0, 15, 0.3)',
                  boxShadow: '0 12px 30px -10px rgba(255, 0, 15, 0.15)',
                }}
                onClick={() => setSelectedTrackChallenge(challenge)}
                className="bg-[#111111] border border-white/5 rounded-[21px] p-6 flex flex-col justify-between cursor-pointer"
              >
                {/* Track badge */}
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
                    {challenge.track}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-3 leading-snug">
                    {challenge.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {challenge.description}
                  </p>
                </div>

                {/* Bottom row */}
                <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-white/5 pt-3">
                  <span className={`font-semibold ${difficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-xs font-extrabold text-primary hover:underline">
                    View PS →
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. TIMELINE SECTION                                         */}
      {/* ============================================================ */}
      <section id="timeline" className="bg-black py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...slideUp}
            className="text-3xl sm:text-4xl font-bold text-primary text-center mb-4"
          >
            Event Schedule
          </motion.h2>
          <motion.p
            {...slideUp}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          >
            Five days of intensive innovation, mentorship, and collaboration.
          </motion.p>

          <div className="relative max-w-3xl mx-auto" ref={timelineRef}>
            {/* Background line (dim red) */}
            <div className="absolute left-[7px] sm:left-[108px] top-0 bottom-0 w-px bg-white/10" />

            {/* Glowing animated line that draws on scroll */}
            <motion.div
              className="absolute left-[7px] sm:left-[108px] top-0 bottom-0 w-[2px] bg-primary origin-top shadow-[0_0_8px_#FF000F]"
              style={{ scaleY: timelineScroll, transformOrigin: 'top' }}
            />

            <div className="space-y-12">
              {phases.map((evt, idx) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{
                    type: 'spring',
                    stiffness: 80,
                    damping: 15,
                    delay: idx * 0.05,
                  }}
                  className="relative flex gap-6 sm:gap-8"
                >
                  {/* Date column (hidden on small, shown on sm+) */}
                  <div className="hidden sm:block w-24 text-right flex-shrink-0 pt-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      {evt.date}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="relative flex-shrink-0 mt-1.5 flex items-center justify-center w-[15px] h-[15px]">
                    <motion.div
                      className="w-3 h-3 rounded-full bg-black border border-primary z-10 relative"
                      initial={{ scale: 0.8, backgroundColor: '#000000' }}
                      whileInView={{ scale: 1.25, backgroundColor: '#FF000F' }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ type: 'spring', stiffness: 200, damping: 10, delay: idx * 0.05 }}
                    />
                    {/* Ripple pulse */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/40 pointer-events-none"
                      initial={{ scale: 1, opacity: 0.8 }}
                      whileInView={{ scale: [1, 2.2, 1], opacity: [0.8, 0, 0.8] }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>

                  {/* Content */}
                  <div className="pb-2">
                    <span className="block sm:hidden text-xs text-muted-foreground mb-1">
                      {evt.date}
                    </span>
                    <h3 className="text-base font-bold text-white">{evt.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {evt.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. MENTORS SECTION                                          */}
      {/* ============================================================ */}
      <section id="mentors" className="bg-[#050505] py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            {...slideUp}
            className="text-3xl sm:text-4xl font-bold text-primary text-center mb-4"
          >
            Industry Experts &amp; Mentors
          </motion.h2>
          <motion.p
            {...slideUp}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto"
          >
            Learn from ABB&apos;s leading engineers and researchers across multiple domains.
          </motion.p>

          <motion.div
            variants={cardStaggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {landingMentors.map((mentor) => (
              <motion.div
                key={mentor.name}
                variants={cardStaggerChild}
                whileHover={{
                  y: -6,
                  borderColor: 'rgba(255, 0, 15, 0.25)',
                  boxShadow: '0 10px 25px -10px rgba(255, 0, 15, 0.12)',
                }}
                className="bg-[#111111] border border-white/5 rounded-[21px] p-6 flex items-start gap-5 cursor-pointer"
              >
                {/* Avatar circle with initials */}
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {mentor.initials}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{mentor.title}</p>
                  <p className="text-xs text-primary mt-1">{mentor.company}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6. CTA SECTION                                              */}
      {/* ============================================================ */}
      <section className="bg-black py-24 sm:py-32 relative overflow-hidden">
        {/* Subtle red background glow for CTA */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ type: 'spring', stiffness: 70, damping: 15 }}
          className="max-w-7xl mx-auto px-6 text-center relative z-10"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Innovate?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-10">
            Join 15+ teams from elite engineering colleges. Build, learn, and
            access hands-on industry training, certificates, and trophies.
          </p>

          <motion.button
            onClick={handleRegister}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-lg px-10 py-4 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  7. FOOTER                                                   */}
      {/* ============================================================ */}
      <footer className="bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {/* About column */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <img
                  src="/abb-logo.png"
                  alt="ABB Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-white font-bold text-sm">College Collab</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Empowering the next generation of engineers through real-world industrial challenges and mentorship.
              </p>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-white transition-colors cursor-pointer">Challenge Tracks</li>
                <li className="hover:text-white transition-colors cursor-pointer">Mentor Directory</li>
                <li className="hover:text-white transition-colors cursor-pointer">API Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Student Handbook</li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Connect</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> LinkedIn
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> ABB Global
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Events
                </li>
                <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Support
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="hover:text-white transition-colors cursor-pointer">Privacy Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms of Service</li>
                <li className="hover:text-white transition-colors cursor-pointer">Code of Conduct</li>
                <li className="hover:text-white transition-colors cursor-pointer">Cookie Policy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom copyright bar */}
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">
              © 2026 ABB Ltd. All rights reserved.
            </span>
            <span className="text-xs text-muted-foreground">
              ABB College Collaboration Hub — Satpur, Nashik
            </span>
          </div>
        </div>
      </footer>

      {/* Elite Benefits Details Modal */}
      <AnimatePresence>
        {isBenefitsOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBenefitsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-4xl max-h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-[21px] p-6 sm:p-8 overflow-y-auto shadow-2xl z-10 scrollbar-thin scrollbar-thumb-white/10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsBenefitsOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block mb-1">
                    ABB Collaboration Hub
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    Elite Program Benefits &amp; Opportunities
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    Participants of the ABB College Collaboration Hub receive direct exposure to industry-leading technologies, structured mentorship, and professional growth opportunities.
                  </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "3 Months In-Hand Training",
                      desc: "Practical hands-on industry experience working in real-world facilities alongside senior ABB engineers.",
                      icon: Cpu
                    },
                    {
                      title: "Specialized Technical Workshops",
                      desc: "Intensive training sessions covering E-Operations, Production Planning, Quality Management, New Product Development, Digitalization, AI, and IoT.",
                      icon: BookOpen
                    },
                    {
                      title: "Industry Credentials & Certificates",
                      desc: "Receive official participation and achievement certificates validated by ABB Global Innovation Center.",
                      icon: Award
                    },
                    {
                      title: "Exclusive Awards & Trophies",
                      desc: "Top performing teams are honored with premium physical trophies and certificates at the Grand Awards Ceremony.",
                      icon: Trophy
                    },
                    {
                      title: "Multi-Field Experience",
                      desc: "Exposure to diverse technological domains from smart energy distribution to industrial fleet control.",
                      icon: Briefcase
                    },
                    {
                      title: "Premium Tools & SDK Access",
                      desc: "Unlock developer environments, proprietary software kits, simulator APIs, and premium engineering toolchains.",
                      icon: Settings
                    },
                    {
                      title: "Project Management Excellence",
                      desc: "Acquire know-how of professional agile delivery, team collaboration frameworks, and product development lifecycles.",
                      icon: ClipboardList
                    },
                    {
                      title: "Direct Placement Fast-Track",
                      desc: "High-performing participants will be fast-tracked to recruitment interviews for internship and permanent engineering roles at ABB.",
                      icon: Users
                    }
                  ].map((benefit, idx) => {
                    const BenefitIcon = benefit.icon;
                    return (
                      <div 
                        key={idx}
                        className="bg-[#111111] border border-white/5 p-4 rounded-xl flex items-start gap-4 hover:border-primary/20 hover:bg-[#151515] transition-all"
                      >
                        <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-primary shrink-0">
                          <BenefitIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {benefit.title}
                          </h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                            {benefit.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detailed Problem Statement Modal */}
      <AnimatePresence>
        {selectedTrackChallenge && (() => {
          const problemStatements = selectedTrackChallenge.problemStatements || [];
          const totalPages = problemStatements.length + 1; // 1 overview page + N problem statement pages

          return (
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
              {/* Backdrop with blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedTrackChallenge(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />

              {/* Modal Body */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative w-full max-w-3xl max-h-[85vh] bg-[#0c0c0c] border border-white/10 rounded-[21px] p-6 sm:p-8 overflow-y-auto shadow-2xl z-10 scrollbar-thin scrollbar-thumb-white/10"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedTrackChallenge(null)}
                  className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="space-y-6">
                  {/* Category Header with pagination */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
                        {selectedTrackChallenge.track}
                      </span>
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                        {activePsIndex === 0 
                          ? 'Track Overview' 
                          : `PS ${activePsIndex} of ${problemStatements.length}`}
                      </span>
                    </div>

                    {/* Book page turns pagination controls */}
                    <div className="flex items-center gap-2 mr-8">
                      <button
                        disabled={activePsIndex === 0}
                        onClick={() => {
                          setDirection(-1);
                          setActivePsIndex((prev) => Math.max(0, prev - 1));
                        }}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded transition-all cursor-pointer ${
                          activePsIndex === 0
                            ? 'border-white/5 text-white/20 bg-transparent'
                            : 'border-white/20 text-white hover:bg-white/5 active:scale-95'
                        }`}
                      >
                        ← Prev
                      </button>
                      <button
                        disabled={activePsIndex === totalPages - 1}
                        onClick={() => {
                          setDirection(1);
                          setActivePsIndex((prev) => Math.min(totalPages - 1, prev + 1));
                        }}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border rounded transition-all cursor-pointer ${
                          activePsIndex === totalPages - 1
                            ? 'border-white/5 text-white/20 bg-transparent'
                            : 'border-white/20 text-white hover:bg-white/5 active:scale-95'
                        }`}
                      >
                        Next →
                      </button>
                    </div>
                  </div>

                  {/* 3D Book Page Flip Animation Container */}
                  <div style={{ perspective: 1200 }} className="relative overflow-hidden w-full flex items-stretch min-h-[420px]">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                      {activePsIndex === 0 ? (
                        <motion.div
                          key="overview"
                          custom={direction}
                          variants={bookVariants}
                          initial="initial"
                          animate="animate"
                          exit="exit"
                          className="w-full flex flex-col space-y-6"
                          style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                        >
                          <div>
                            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                              Track Overview: {selectedTrackChallenge.title}
                            </h3>
                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-semibold">
                              <span>Active Teams: <span className="text-white font-bold">{selectedTrackChallenge.participantsCount}</span></span>
                              <span>•</span>
                              <span>Mentors: <span className="text-white font-bold">{selectedTrackChallenge.mentors.join(', ')}</span></span>
                            </div>
                          </div>

                          {/* Track Description */}
                          <div className="space-y-2 border-t border-white/5 pt-4">
                            <h4 className="text-sm font-extrabold text-white">About the Track</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {selectedTrackChallenge.description}
                            </p>
                          </div>

                          {/* Track Background */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-extrabold text-white">Track Background &amp; Context</h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {selectedTrackChallenge.background}
                            </p>
                          </div>

                          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed">
                            <span className="font-extrabold text-primary block mb-1">💡 Instructions</span>
                            This track contains <span className="text-white font-bold">{problemStatements.length} problem statements</span>. Use the <span className="text-white font-bold">Next</span> button in the top-right to browse through them and select the challenge you want to tackle.
                          </div>
                        </motion.div>
                      ) : (() => {
                        const currentPs = problemStatements[activePsIndex - 1];
                        if (!currentPs) {
                          return (
                            <div className="w-full text-center py-12 text-muted-foreground text-sm">
                              No problem statements configured for this track yet.
                            </div>
                          );
                        }
                        return (
                          <motion.div
                            key={activePsIndex}
                            custom={direction}
                            variants={bookVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="w-full flex flex-col space-y-6"
                            style={{ transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
                          >
                            <div>
                              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                                {currentPs.title}
                              </h3>
                              <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-semibold">
                                <span>Difficulty: <span className={difficultyColor(currentPs.difficulty)}>{currentPs.difficulty}</span></span>
                                <span>•</span>
                                <span>Active Teams: <span className="text-white font-bold">{selectedTrackChallenge.participantsCount}</span></span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {currentPs.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] bg-white/5 text-white/80 px-2 py-0.5 rounded border border-white/5">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Problem Statement & Background */}
                            <div className="space-y-2 border-t border-white/5 pt-4">
                              <h4 className="text-sm font-extrabold text-white">Problem Statement</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {currentPs.description}
                              </p>
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-sm font-extrabold text-white">Background Context</h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {currentPs.background}
                              </p>
                            </div>

                            {/* Objectives & Deliverables Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Key Objectives</h4>
                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1.5 leading-relaxed">
                                  {currentPs.objectives.map((obj: string, i: number) => (
                                    <li key={i}>{obj}</li>
                                  ))}
                                </ul>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Expected Deliverables</h4>
                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1.5 leading-relaxed">
                                  {currentPs.deliverables.map((del: string, i: number) => (
                                    <li key={i}>{del}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {/* Evaluation Criteria */}
                            <div className="space-y-2 border-t border-white/5 pt-4">
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Evaluation Criteria</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {currentPs.evaluationCriteria.map((crit: { criteria: string; weight: number }, i: number) => (
                                  <div key={i} className="flex justify-between items-center p-2.5 rounded-lg bg-[#111] border border-white/5 text-xs text-muted-foreground">
                                    <span>{crit.criteria}</span>
                                    <span className="font-mono text-primary font-bold">{crit.weight}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })()}
                    </AnimatePresence>
                  </div>

                  {/* Mentors / Submit Track */}
                  <div className="space-y-2 border-t border-white/5 pt-4 flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      Supported by: <span className="text-white font-bold">{selectedTrackChallenge.mentors.join(', ')}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTrackChallenge(null);
                        handleRegister();
                      }}
                      className="px-5 py-2 bg-primary hover:bg-[#e0000d] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Select this Track
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
