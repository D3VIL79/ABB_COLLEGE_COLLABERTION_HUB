'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore, TeamMember, Challenge, Team } from '@/store/usePlatformStore';
import { 
  Users, BookOpen, FileBadge, Calendar, Compass, ShieldAlert, 
  Trash2, Mail, Link as LinkIcon, QrCode, CheckCircle2, ChevronRight, 
  Bookmark, Download, ExternalLink, Settings, ShieldCheck, HelpCircle,
  Trophy, MapPin, Activity, Check, Cpu, Clock, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function StudentPortal() {
  const { 
    activeTab, team, challenges, toggleChallengeBookmark, 
    inviteMember, removeMember, submitProject, requestMentor,
    calendarEvents, notifications, user, updateUserProfile, selectedChallengeId, setSelectedChallengeId, setTab, allTeams,
    countdownDate, phases, activePhaseIndex, addToast
  } = usePlatformStore();

  // Countdown to July 10, 2026 (Phase 2 Ends)
  const [timeLeft, setTimeLeft] = useState({ days: 21, hours: 6, minutes: 30, seconds: 45 });
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

  // Onboarding registration local state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Developer');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // Submissions local state
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [subDesc, setSubDesc] = useState('');
  const [presentationFile, setPresentationFile] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [leaderboardTrack, setLeaderboardTrack] = useState('All');

  // Mentor Requests local state
  const [mentorReqType, setMentorReqType] = useState<'Technical' | 'Design' | 'Research' | 'Architecture' | 'Deployment' | 'General'>('Technical');
  const [mentorReqDesc, setMentorReqDesc] = useState('');
  const [mentorPriority, setMentorPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [mentorRequestedSuccess, setMentorRequestedSuccess] = useState(false);

  // Settings local states
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [language, setLanguage] = useState('English');

  // Copy code helper
  const handleCopyCode = () => {
    if (team) {
      navigator.clipboard.writeText(team.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Submission handler
  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl || !demoUrl || !subDesc || !presentationFile) return;
    submitProject(githubUrl, demoUrl, subDesc, presentationFile);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 4000);
  };

  // Mentor Request handler
  const handleMentorRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorReqDesc) return;
    requestMentor(mentorReqType, 'General', mentorReqDesc, mentorPriority, 'ASAP');
    setMentorRequestedSuccess(true);
    setMentorReqDesc('');
    setTimeout(() => setMentorRequestedSuccess(false), 4000);
  };

  const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);

  return (
    <div className="flex-1 w-full overflow-y-auto bg-background font-satoshi">
      {/* A. STUDENT DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT COLUMN (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-6 flex flex-col">
              
              {/* Widget 1: COUNTDOWN TO DEADLINE */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    COUNTDOWN TO DEADLINE:
                  </span>
                  <span className="text-xs font-semibold text-white mt-1 block">
                    Target Date: {formattedTargetDate}
                  </span>
                </div>

                {/* Numbers block */}
                <div className="flex items-center gap-4 mt-6">
                  <div className="text-center">
                    <span className="block text-3xl font-extrabold text-primary tabular-nums">
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Days</span>
                  </div>
                  <span className="text-xl font-bold text-white/20 -mt-4">:</span>
                  <div className="text-center">
                    <span className="block text-3xl font-extrabold text-primary tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Hours</span>
                  </div>
                  <span className="text-xl font-bold text-white/20 -mt-4">:</span>
                  <div className="text-center">
                    <span className="block text-3xl font-extrabold text-primary tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Mins</span>
                  </div>
                  <span className="text-xl font-bold text-white/20 -mt-4">:</span>
                  <div className="text-center">
                    <span className="block text-3xl font-extrabold text-primary tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                    <span className="block text-[9px] text-muted-foreground uppercase tracking-widest mt-1">Sec</span>
                  </div>
                </div>

                {/* Status Row */}
                <div className="flex items-center gap-5 mt-6 pt-4 border-t border-white/5 text-[10px] text-white/70">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Link Repo
                  </span>
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Internal Check
                  </span>
                </div>
              </div>

              {/* Widget 2: Team: CC Rajuut */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-5 flex flex-col justify-between flex-1">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Team:
                  </span>
                  <span className="text-base font-extrabold text-white mt-1 block">
                    CC Rajuut
                  </span>
                </div>

                {/* 2x2 Grid of members */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "CC Rajuut", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=100&h=100&q=80", status: "Online/Active" },
                    { name: "Stamhran", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80", status: "Online/Active" },
                    { name: "Anna Sharnai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80", status: "Online/Active" },
                    { name: "Om Zambare", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80", status: "Online/Active" }
                  ].map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-10 h-10 rounded-full border border-primary object-cover"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#111111]" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate leading-snug">
                          {member.name}
                        </div>
                        <div className="text-[9px] text-green-500 font-bold tracking-wide mt-0.5">
                          {member.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setTab('team')}
                  className="w-full py-2.5 rounded-lg border border-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary/10 transition-colors cursor-pointer text-center"
                >
                  Open Team Workspace
                </button>
              </div>

              {/* Widget 3: RECOGNITION & LEADERBOARD */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                      RECOGNITION
                    </span>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full border border-primary bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_8px_#FF000F]">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    LEADERBOARD
                  </span>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: "Leaderboard", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=50&h=50&q=80", score: 159, pct: 95 },
                      { rank: 2, name: "Stamhran", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=50&h=50&q=80", score: 158, pct: 90 },
                      { rank: 3, name: "Anna Sharnai", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&h=50&q=80", score: 156, pct: 85 }
                    ].map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-mono text-muted-foreground font-bold shrink-0">{entry.rank}</span>
                          <img src={entry.avatar} alt={entry.name} className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0" />
                          <span className="text-white font-bold truncate">{entry.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${entry.pct}%` }} />
                          </div>
                          <span className="font-bold text-white/95 font-mono">{entry.score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (lg:col-span-7) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col">
              
              {/* Widget 4: UPCOMING DEADLINES */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    UPCOMING DEADLINES
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button className="p-1 rounded bg-[#1f1f1f] text-white/60 hover:text-white transition-colors cursor-pointer">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1 rounded bg-[#1f1f1f] text-white/60 hover:text-white transition-colors cursor-pointer">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Slide 1 */}
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between h-24">
                    <div>
                      <span className="text-[10px] font-bold text-white leading-snug block truncate">Code Submit</span>
                      <span className="text-[9px] text-muted-foreground block mt-1">85% Complete</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-primary" style={{ width: '85%' }} />
                    </div>
                  </div>

                  {/* Slide 2 */}
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between h-24 relative overflow-hidden">
                    <div>
                      <span className="text-[10px] font-bold text-white leading-snug block truncate">Architecture Review</span>
                      <span className="text-[9px] text-primary font-bold block mt-1">25th June</span>
                    </div>
                    <div className="absolute right-2.5 bottom-2.5 text-primary/20 shrink-0">
                      <Cpu className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Slide 3 */}
                  <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between h-24">
                    <div>
                      <span className="text-[10px] font-bold text-white leading-snug block truncate">Refined Schematic</span>
                      <span className="text-[9px] text-muted-foreground block mt-1">90% Complete</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-3">
                      <div className="h-full bg-primary" style={{ width: '90%' }} />
                    </div>
                  </div>
                </div>

                {/* Dots Indicator */}
                <div className="flex items-center justify-center gap-1.5 pt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                  <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                </div>
              </div>

              {/* Widget 5: Active Phase Milestone */}
              {(() => {
                const activePhase = phases[activePhaseIndex] || { name: 'Prototype Submission', date: 'July 10, 2026', description: 'Phase progress details' };
                const pct = Math.round(((activePhaseIndex + 1) / Math.max(1, phases.length)) * 100);
                return (
                  <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between flex-1">
                    {/* Header Status Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Current Phase: {activePhase.name}
                      </span>
                      <div className="px-3 py-0.5 rounded border border-primary/45 bg-primary/10 text-primary font-bold text-[9px] uppercase tracking-wide">
                        {activePhase.date}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center mt-5">
                      {/* Left stats */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-base font-extrabold text-white leading-tight">{activePhase.name}</h3>
                          <span className="text-[11px] text-muted-foreground mt-1.5 block leading-normal">
                            {activePhase.description}
                          </span>
                        </div>
                        
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse" style={{ width: `${pct}%` }} />
                        </div>
                        
                        <p className="text-[10px] text-muted-foreground leading-normal font-sans pt-1">
                          Phase {activePhaseIndex + 1} of {phases.length} ({pct}% through program)
                        </p>
                      </div>

                      {/* Right SVG schematic */}
                      <div className="flex items-center justify-center">
                        <svg viewBox="0 0 200 120" className="w-full h-auto max-w-[180px] select-none">
                          {/* Isometric Grid lines */}
                          <path d="M 20 60 L 100 20 L 180 60 L 100 100 Z" fill="none" stroke="rgba(255,0,15,0.08)" strokeWidth="1" />
                          <path d="M 60 40 L 140 80 M 60 80 L 140 40" fill="none" stroke="rgba(255,0,15,0.05)" strokeWidth="1" />
                          
                          {/* Connected node lines */}
                          <path d="M 80 65 L 110 50 L 140 65 M 110 50 L 110 80" fill="none" stroke="#FF000F" strokeWidth="1.2" opacity="0.5" strokeDasharray="2 2" />
                          
                          {/* Block 1 (Left) */}
                          <g transform="translate(60, 50)">
                            <path d="M 0 10 L 15 2 L 30 10 L 15 18 Z" fill="rgba(255,0,15,0.1)" stroke="#FF000F" strokeWidth="1" />
                            <path d="M 0 10 L 0 25 L 15 33 L 15 18 Z" fill="rgba(255,0,15,0.15)" stroke="#FF000F" strokeWidth="1" />
                            <path d="M 15 18 L 15 33 L 30 25 L 30 10 Z" fill="rgba(255,0,15,0.08)" stroke="#FF000F" strokeWidth="1" />
                          </g>

                          {/* Block 2 (Center) */}
                          <g transform="translate(95, 30)">
                            <path d="M 0 10 L 15 2 L 30 10 L 15 18 Z" fill="rgba(255,0,15,0.2)" stroke="#FF000F" strokeWidth="1" />
                            <path d="M 0 10 L 0 35 L 15 43 L 15 18 Z" fill="rgba(255,0,15,0.25)" stroke="#FF000F" strokeWidth="1" />
                            <path d="M 15 18 L 15 43 L 30 35 L 30 10 Z" fill="rgba(255,0,15,0.12)" stroke="#FF000F" strokeWidth="1" />
                            <circle cx="15" cy="2" r="2.5" fill="#FF000F" className="animate-pulse" />
                          </g>

                          {/* Block 3 (Right) */}
                          <g transform="translate(130, 50)">
                            <path d="M 0 10 L 15 2 L 30 10 L 15 18 Z" fill="rgba(255,0,15,0.1)" stroke="#FF000F" strokeWidth="1" />
                            <path d="M 0 10 L 0 20 L 15 28 L 15 18 Z" fill="rgba(255,0,15,0.15)" stroke="#FF000F" strokeWidth="1" />
                            <path d="M 15 18 L 15 28 L 30 20 L 30 10 Z" fill="rgba(255,0,15,0.08)" stroke="#FF000F" strokeWidth="1" />
                          </g>
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Widget 6: ACTIVITY FEED */}
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 space-y-4">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  ACTIVITY FEED
                </span>

                <div className="relative pl-6 space-y-6 py-2">
                  {/* Timeline vertical connector */}
                  <div className="absolute left-[7px] top-4 bottom-4 w-px bg-white/10" />

                  {/* Log 1 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-primary shadow-[0_0_6px_#FF000F]" />
                    <div className="text-xs font-bold text-white leading-snug">
                      Welcone, Prototype Submission
                    </div>
                    <div className="text-[9px] text-muted-foreground font-medium mt-0.5 font-sans">
                      21 months - 1 hour ago
                    </div>
                  </div>

                  {/* Log 2 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                    <div className="text-xs font-bold text-white leading-snug">
                      Mock Pitch - Due: 19th
                    </div>
                    <div className="text-[9px] text-muted-foreground font-medium mt-0.5 font-sans">
                      19 months - 3 hour ago
                    </div>
                  </div>

                  {/* Log 3 */}
                  <div className="relative">
                    <div className="absolute -left-[23px] top-1.5 w-2 h-2 rounded-full bg-white/20" />
                    <div className="text-xs font-bold text-white leading-snug">
                      Refined Schematic
                    </div>
                    <div className="text-[9px] text-muted-foreground font-medium mt-0.5 font-sans">
                      18 months - 5 hours ago
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* B. MY TEAM WORKSPACE */}
      {activeTab === 'team' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Collaboration
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              My Team Workspace
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Manage member roles, invite developers, and upload project code.
            </p>
          </div>

          {!team ? (
            <div className="py-20 text-center max-w-md mx-auto border border-dashed border-border rounded-2xl p-6 bg-card">
              <Users className="w-12 h-12 text-muted-foreground/35 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-foreground">No active team detected</h3>
              <p className="text-xs text-muted-foreground mt-1 font-sans">
                You must complete Onboarding registration or create a team using the Role Switcher before using this workspace.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Roster list (2 columns) */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center justify-between">
                    <span>Roster & Assignments ({team.members.length})</span>
                    <span className="text-[10px] font-mono bg-muted px-2 py-0.5 rounded border text-muted-foreground">
                      Track: {team.track}
                    </span>
                  </h3>

                  <div className="divide-y divide-border/25">
                    {team.members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0 gap-4">
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {member.fullName}
                            {member.id === 'm-leader' && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wide">Owner</span>
                            )}
                          </h4>
                          <div className="text-[10px] text-muted-foreground leading-normal mt-0.5 font-mono">{member.email}</div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.map((s, idx) => (
                              <span key={idx} className="text-[9px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                            member.role === 'Leader' 
                              ? 'border-primary/30 text-primary bg-primary/5' 
                              : 'border-border/30 text-muted-foreground bg-background'
                          }`}>
                            {member.role}
                          </span>
                          {member.id !== 'm-leader' && (
                            <button 
                              onClick={() => removeMember(member.id)}
                              className="p-1.5 rounded-lg border border-border/30 text-muted-foreground hover:text-danger hover:border-danger/20 hover:bg-danger/5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team invites tool */}
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground">Invite Classmates</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter invitee email..."
                      className="w-full text-xs font-semibold p-2.5 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as any)}
                      className="text-xs font-semibold p-2.5 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                    >
                      <option>Developer</option>
                      <option>Designer</option>
                      <option>Researcher</option>
                      <option>Presenter</option>
                      <option>Analyst</option>
                    </select>
                    <button
                      onClick={() => {
                        if (inviteEmail) {
                          inviteMember(inviteEmail, inviteRole);
                          setInviteEmail('');
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shrink-0 cursor-pointer"
                    >
                      Send Invite
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-border/15">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <LinkIcon className="w-4 h-4" />
                      {copiedCode ? 'Copied code!' : 'Copy invite code'}
                    </button>
                    <button
                      onClick={() => setShowQr(!showQr)}
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      Show QR code
                    </button>
                  </div>

                  <AnimatePresence>
                    {showQr && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl border border-border/30 bg-muted/15 flex flex-col items-center gap-2 overflow-hidden"
                      >
                        <div className="w-32 h-32 bg-white rounded-lg border p-1 flex items-center justify-center font-bold text-black text-2xl font-mono relative">
                          ABB QR
                          <span className="absolute bottom-1 right-1 text-[8px] font-semibold text-muted-foreground">Mock Scanner</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-semibold uppercase">Scan to join {team.name}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Submissions & Mentor request widget (1 column) */}
              <div className="space-y-6">
                {/* Project Submission Form */}
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground">Project Submission</h3>
                  
                  {team.submissions.length > 0 ? (
                    <div className="p-4 rounded-xl border border-success/30 bg-success/5 space-y-3">
                      <div className="text-xs font-bold text-success flex items-center gap-1.5">
                        <CheckCircle2 className="w-4.5 h-4.5" /> Project Received
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
                        Your submission has been cataloged. You can check the Judge tab once review cycles conclude.
                      </p>
                      <div className="pt-2 border-t border-success/20 text-[10px] text-muted-foreground space-y-1 text-left">
                        <div className="truncate"><span className="font-bold text-foreground">Repo:</span> {team.submissions[0].githubUrl}</div>
                        <div className="truncate"><span className="font-bold text-foreground">Demo:</span> {team.submissions[0].demoUrl}</div>
                        <div className="truncate"><span className="font-bold text-foreground">Deck:</span> {team.submissions[0].presentationFile}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitProject} className="space-y-4">
                      {isSubmitted && (
                        <div className="p-3 rounded-lg border border-success/30 bg-success/5 text-success text-xs font-semibold">
                          Submission successfully uploaded!
                        </div>
                      )}
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 text-left">GitHub Repo *</label>
                        <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/..." className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 text-left">Demo link *</label>
                        <input value={demoUrl} onChange={e => setDemoUrl(e.target.value)} placeholder="https://..." className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 text-left">Presentation File Name *</label>
                        <input value={presentationFile} onChange={e => setPresentationFile(e.target.value)} placeholder="team_deck.pdf" className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1 text-left">System summary *</label>
                        <textarea value={subDesc} onChange={e => setSubDesc(e.target.value)} rows={3} placeholder="Briefly describe what your algorithm does..." className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                      </div>
                      <button type="submit" className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md">
                        Submit Deliverables
                      </button>
                    </form>
                  )}
                </div>

                {/* Help Request ticket */}
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground">Request Technical Mentor</h3>
                  
                  <form onSubmit={handleMentorRequest} className="space-y-4">
                    {mentorRequestedSuccess && (
                      <div className="p-3 rounded-lg border border-success/30 bg-success/5 text-success text-xs font-semibold">
                        Mentor request ticket created successfully!
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Help Category *</label>
                      <select 
                        value={mentorReqType} 
                        onChange={e => setMentorReqType(e.target.value as any)}
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                      >
                        <option>Technical</option>
                        <option>Design</option>
                        <option>Research</option>
                        <option>Architecture</option>
                        <option>Deployment</option>
                        <option>General</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Priority level *</label>
                      <select 
                        value={mentorPriority} 
                        onChange={e => setMentorPriority(e.target.value as any)}
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                        <option>Urgent</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Describe Issue *</label>
                      <textarea value={mentorReqDesc} onChange={e => setMentorReqDesc(e.target.value)} rows={3} placeholder="What codebase issues or hardware constraints do you need help with?" className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-foreground text-background dark:bg-card dark:text-foreground hover:bg-foreground/90 transition-all font-bold text-xs uppercase tracking-wider border border-border/40 cursor-pointer">
                      Queue Ticket
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* C. PROBLEM EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Discovery
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Innovation Tracks Explorer
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Select or save innovation problems. Complete deliverables according to requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Explorer list */}
            <div className="lg:col-span-2 space-y-4">
              {challenges.map((ch) => (
                <div 
                  key={ch.id} 
                  onClick={() => setSelectedChallengeId(ch.id)}
                  className={`p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer relative ${
                    selectedChallengeId === ch.id 
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' 
                      : 'border-border/40 bg-card hover:border-border hover:shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center gap-4">
                    <span className="px-2.5 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                      {ch.track}
                    </span>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded border">
                        {ch.difficulty}
                      </span>
                      <button 
                        onClick={() => toggleChallengeBookmark(ch.id)}
                        className={`p-1 rounded-lg border transition-colors ${
                          ch.bookmarked 
                            ? 'border-primary/30 bg-primary/10 text-primary' 
                            : 'border-border/30 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground mt-4 leading-snug">
                    {ch.title}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-normal mt-2 line-clamp-2 font-sans">
                    {ch.description}
                  </p>

                  <div className="flex items-center justify-between gap-4 mt-6 pt-3 border-t border-border/15">
                    <span className="text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">{ch.participantsCount}</span> teams active
                    </span>
                    <span className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                      View details
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Challenge Details Drawer (Right) */}
            <div className="space-y-4">
              {selectedChallenge ? (
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  
                  <div>
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">
                      {selectedChallenge.track}
                    </span>
                    <h3 className="text-base font-extrabold text-foreground mt-1 leading-snug">
                      {selectedChallenge.title}
                    </h3>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-border/15">
                    <div className="text-xs font-bold text-foreground">Background</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed font-sans">
                      {selectedChallenge.background}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-foreground">Key Objectives</div>
                    <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-1 leading-normal font-sans">
                      {selectedChallenge.objectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-foreground">Download Resources</div>
                    <div className="space-y-2">
                      {selectedChallenge.resources.map((res, idx) => (
                        <a 
                          key={idx} 
                          href="#" 
                          className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-muted/10 hover:bg-muted/20 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all"
                        >
                          <span className="truncate">{res.name}</span>
                          <Download className="w-3.5 h-3.5 shrink-0 text-primary" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/40 bg-card p-5 text-center text-xs text-muted-foreground py-10">
                  Select a challenge challenge track from the list to preview details and resources.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* D. CERTIFICATE CENTER */}
      {activeTab === 'certificates' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Recognition
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Certificates & Awards
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Download cryptographic certificates issued by ABB Event coordinators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { type: 'participation', title: 'ABB Innovation Program Certification', date: 'June 25, 2026', hash: 'SHA256-ABB-89240182A9BC' },
              { type: 'achievement', title: 'Smart Grid Hackathon Placement Certificate', date: 'June 25, 2026', hash: 'SHA256-ABB-109482098BC1' },
            ].map((cert, idx) => (
              <div key={idx} className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm space-y-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold uppercase tracking-wider">
                      {cert.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">{cert.date}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-foreground mt-4 leading-snug">
                    {cert.title}
                  </h3>
                  <div className="text-[10px] text-muted-foreground leading-normal mt-1">
                    Recipient: <span className="font-bold text-foreground">{user.fullName}</span>
                  </div>
                  <div className="text-[9px] text-muted-foreground/50 font-mono mt-3 truncate">
                    Hash: {cert.hash}
                  </div>
                </div>

                <button
                  onClick={() => addToast('Download Started', `Simulated PDF download initiated for ${cert.title}.`, 'success')}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/30 hover:border-border text-foreground hover:bg-muted/15 font-bold text-xs uppercase tracking-wide cursor-pointer transition-all"
                >
                  <Download className="w-4 h-4 text-primary" />
                  Download Certificate PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* C. TEAM LEADERBOARD */}
      {activeTab === 'leaderboard' && (() => {
        const getVelocityValue = (t: Team) => {
          if (!t.progressHistory || t.progressHistory.length < 2) return 0;
          const latest = t.progressHistory[t.progressHistory.length - 1].progress;
          const earliest = t.progressHistory[0].progress;
          return Math.round(((latest - earliest) / t.progressHistory.length) * 10) / 10;
        };

        const getVelocityLabel = (t: Team) => {
          const val = getVelocityValue(t);
          if (val > 15) return '🔥 Fast';
          if (val > 5) return '✅ Steady';
          if (val > 0) return '⚠️ Stalled';
          return '🔴 Stuck';
        };

        const sortedRankedTeams = [...allTeams].sort((a, b) => {
          const aScore = a.submissions[0]?.score || 0;
          const bScore = b.submissions[0]?.score || 0;
          if (bScore !== aScore) return bScore - aScore;
          return b.progress - a.progress;
        });

        const myTeamRank = team ? sortedRankedTeams.findIndex(t => t.id === team.id) + 1 : 0;
        const myTeamScore = team?.submissions[0]?.score;

        const filteredLeaderboardTeams = sortedRankedTeams.filter(t => 
          leaderboardTrack === 'All' || t.track === leaderboardTrack
        );

        return (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                Standings
              </span>
              <h2 className="text-xl font-black text-foreground mt-0.5">
                Team Leaderboard
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                Real-time standings based on evaluation grades, project milestones, and collaboration metrics.
              </p>
            </div>

            {/* "My Team" Status Banner */}
            {team && (
              <div className="bg-primary/5 border border-primary/25 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm shadow-primary/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/25">YOUR STANDING</span>
                    <span className="text-xs text-muted-foreground font-bold">{team.name}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1.5 flex items-baseline gap-1">
                    Rank #{myTeamRank} <span className="text-xs font-semibold text-muted-foreground font-mono">out of {allTeams.length}</span>
                  </h3>
                </div>
                <div className="flex gap-6 items-center">
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Progress</span>
                    <span className="text-sm font-extrabold text-foreground">{team.progress}%</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Collab score</span>
                    <span className="text-sm font-extrabold text-foreground">{team.collaborationScore} pts</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase block">Grade</span>
                    <span className="text-sm font-extrabold text-primary font-mono">{myTeamScore !== undefined ? `${myTeamScore}%` : 'TBD'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Track Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto select-none custom-scrollbar pb-1">
              {['All', 'Energy Systems', 'Robotics', 'Sustainability', 'E-Operations', 'AI', 'IoT'].map(track => (
                <button
                  key={track}
                  onClick={() => setLeaderboardTrack(track)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border ${
                    leaderboardTrack === track 
                      ? 'bg-primary text-white border-primary shadow-sm' 
                      : 'bg-[#121212] text-muted-foreground border-border/15 hover:text-foreground hover:bg-[#181818]'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>

            {/* Top Podiums Grid */}
            {leaderboardTrack === 'All' && filteredLeaderboardTeams.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Rank 2 */}
                <div className="order-2 md:order-1 rounded-2xl border border-border/40 bg-card p-6 flex flex-col items-center justify-center text-center relative mt-6 md:mt-10">
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-slate-400/10 border border-slate-400/25 flex items-center justify-center text-slate-400 font-extrabold text-lg shadow-lg">
                    2
                  </div>
                  <Trophy className="w-8 h-8 text-slate-400 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">
                    {filteredLeaderboardTeams[1]?.name || 'TBD'}
                  </h3>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {filteredLeaderboardTeams[1]?.track || 'Innovation Track'}
                  </span>
                  <div className="mt-4 text-lg font-black text-foreground">
                    {filteredLeaderboardTeams[1]?.submissions[0]?.score ? `${filteredLeaderboardTeams[1].submissions[0].score}%` : 'TBD'}
                  </div>
                </div>

                {/* Rank 1 */}
                <div className="order-1 rounded-2xl border border-primary/30 bg-primary/5 p-6 flex flex-col items-center justify-center text-center relative shadow-lg shadow-primary/5">
                  <div className="absolute -top-8 w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/35 flex items-center justify-center text-yellow-500 font-extrabold text-2xl shadow-xl">
                    1
                  </div>
                  <Trophy className="w-10 h-10 text-yellow-500 mb-3 animate-bounce" style={{ animationDuration: '3s' }} />
                  <h3 className="text-base font-extrabold text-foreground">
                    {filteredLeaderboardTeams[0]?.name || 'TBD'}
                  </h3>
                  <span className="text-xs text-muted-foreground mt-1">
                    {filteredLeaderboardTeams[0]?.track || 'Innovation Track'}
                  </span>
                  <div className="mt-4 text-2xl font-black text-primary">
                    {filteredLeaderboardTeams[0]?.submissions[0]?.score ? `${filteredLeaderboardTeams[0].submissions[0].score}%` : 'TBD'}
                  </div>
                </div>

                {/* Rank 3 */}
                <div className="order-3 rounded-2xl border border-border/40 bg-card p-6 flex flex-col items-center justify-center text-center relative mt-6 md:mt-10">
                  <div className="absolute -top-6 w-12 h-12 rounded-full bg-amber-600/10 border border-amber-600/25 flex items-center justify-center text-amber-700 font-extrabold text-lg shadow-lg">
                    3
                  </div>
                  <Trophy className="w-8 h-8 text-amber-700 mb-3" />
                  <h3 className="text-sm font-bold text-foreground">
                    {filteredLeaderboardTeams[2]?.name || 'TBD'}
                  </h3>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {filteredLeaderboardTeams[2]?.track || 'Innovation Track'}
                  </span>
                  <div className="mt-4 text-lg font-black text-foreground">
                    {filteredLeaderboardTeams[2]?.submissions[0]?.score ? `${filteredLeaderboardTeams[2].submissions[0].score}%` : 'TBD'}
                  </div>
                </div>
              </div>
            )}

            {/* Standings Table */}
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-foreground">Standings List</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/20 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 text-center w-12">Rank</th>
                      <th className="pb-3 text-center w-12">Trend</th>
                      <th className="pb-3 px-4">Team</th>
                      <th className="pb-3 px-4">College Hub</th>
                      <th className="pb-3 px-4">Track</th>
                      <th className="pb-3 px-4 text-center">Members</th>
                      <th className="pb-3 px-4">Progress</th>
                      <th className="pb-3 px-4 text-center">Velocity</th>
                      <th className="pb-3 px-4 text-center">Collab Score</th>
                      <th className="pb-3 px-4 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/15">
                    {filteredLeaderboardTeams.map((t, idx) => {
                      const score = t.submissions[0]?.score;
                      const isGraded = t.submissions[0]?.status === 'reviewed' || score !== undefined;
                      const velocity = getVelocityValue(t);
                      
                      // Simulated trend index
                      const isTrendingUp = velocity > 5;
                      const isTrendingDown = velocity === 0;

                      return (
                        <tr key={t.id} className={`text-xs font-semibold text-muted-foreground hover:bg-muted/5 transition-colors ${t.id === team?.id ? 'bg-primary/5 text-foreground' : ''}`}>
                          <td className="py-4 text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold ${
                              idx === 0 
                                ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                                : idx === 1 
                                ? 'bg-slate-400/10 text-slate-400 border border-slate-400/20' 
                                : idx === 2 
                                ? 'bg-amber-600/10 text-amber-700 border border-amber-600/20' 
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {idx + 1}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            {isTrendingUp ? (
                              <span className="text-emerald-500 font-bold" title="Trending Up">↑</span>
                            ) : isTrendingDown ? (
                              <span className="text-rose-500 font-bold" title="Stalled/Trending Down">↓</span>
                            ) : (
                              <span className="text-muted-foreground/45 font-bold" title="Steady">→</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-foreground font-bold">
                            {t.name}
                            {t.id === team?.id && (
                              <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider">Your Team</span>
                            )}
                          </td>
                          <td className="py-4 px-4 truncate max-w-[150px]">{t.college}</td>
                          <td className="py-4 px-4 uppercase text-[10px] tracking-wider">{t.track}</td>
                          <td className="py-4 px-4 text-center font-mono">{t.members.length}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-muted border border-border/20 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${t.progress}%` }} />
                              </div>
                              <span className="text-[10px] font-mono">{t.progress}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center font-medium">
                            {getVelocityLabel(t)}
                          </td>
                          <td className="py-4 px-4 text-center font-mono text-foreground">{t.collaborationScore} pts</td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-foreground">
                            {isGraded ? (
                              <span className="text-primary">{score}%</span>
                            ) : (
                              <span className="text-muted-foreground/45 text-[10px] uppercase font-semibold">TBD</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredLeaderboardTeams.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-muted-foreground/50">No teams enrolled in this track yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* D. HELP DESK */}
      {activeTab === 'help-desk' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Support
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Support Desk
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Contact technical helpers, request logistics assistance, or browse event guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Primary Contacts Card */}
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-5 shadow-sm relative overflow-hidden md:col-span-2">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
              <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                Contact Help Services
              </h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">
                If you have technical questions regarding ABB simulator APIs, hardware devices, network credentials, or submission requirements, reach out directly.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border/15">
                <div className="rounded-xl border border-border/20 bg-background/50 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Official Help Email</span>
                  <a href="mailto:support.collaboration@in.abb.com" className="text-sm font-extrabold text-primary hover:underline block truncate">
                    support.collaboration@in.abb.com
                  </a>
                  <a href="mailto:escalations.hackathon@in.abb.com" className="text-xs font-semibold text-muted-foreground hover:underline block truncate">
                    escalations.hackathon@in.abb.com
                  </a>
                </div>

                <div className="rounded-xl border border-border/20 bg-background/50 p-4 space-y-2">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Helpline Numbers</span>
                  <div className="text-sm font-extrabold text-foreground block font-mono">
                    +91 (80) 6757-8888
                  </div>
                  <div className="text-[11px] font-semibold text-muted-foreground block font-mono">
                    +91 (80) 6757-9999 (Emergency)
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 flex gap-3">
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary border border-primary/20 mt-0.5">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Physical Support Desk</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed font-sans">
                    Located in **Bhoruka Tech Park, Main Block Room 204 (Floor 2)**. Staffed continuously from June 22 to June 26, 2026.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Ticket Status Widget */}
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Ticket Quick links</h3>
                <p className="text-[11px] text-muted-foreground font-sans mt-1">
                  Need a mentor immediately? You can launch a ticket from your Team workspace.
                </p>

                <div className="mt-4 space-y-2">
                  <button 
                    onClick={() => setTab('team')}
                    className="w-full text-left p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-muted/10 text-xs font-bold text-foreground flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Request Technical Mentor</span>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                  <button 
                    onClick={() => setTab('twin')}
                    className="w-full text-left p-3 rounded-xl border border-border/20 bg-background/30 hover:bg-muted/10 text-xs font-bold text-foreground flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span>Find physical help desk</span>
                    <ChevronRight className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              <div className="text-[9px] text-muted-foreground font-sans leading-normal pt-4 border-t border-border/15">
                Support response SLA is 10 minutes for Urgent tags, 30 minutes for Medium priority.
              </div>
            </div>
          </div>

          {/* Quick FAQ Accordion */}
          <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-foreground">Frequently Asked Questions</h3>
            <div className="divide-y divide-border/25">
              {[
                { q: "Where do we find the simulator access tokens?", a: "Access tokens are generated inside the Venue Map (Digital Twin) tab by selecting the active Smart Power Lab or Robotics Control rooms." },
                { q: "When is the final code cutoff?", a: "Final cutoff is July 10, 2026 at 23:59:59 IST. Submissions page will lock. Late merges are auto-rejected." },
                { q: "Can we replace a team member?", a: "Rosters are locked after Onboarding. If a replacement is needed, email support.collaboration@in.abb.com for manual verification." },
              ].map((faq, idx) => (
                <div key={idx} className="py-3.5 first:pt-0 last:pb-0">
                  <h4 className="text-xs font-bold text-foreground">{faq.q}</h4>
                  <p className="text-[11px] text-muted-foreground font-sans mt-1.5 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* E. USER SETTINGS */}
      {activeTab === 'profile' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Configuration
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Account Preferences
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Manage notifications subscriptions and accessibility metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-foreground">Personal Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                </div>
                <button
                  onClick={() => {
                    updateUserProfile({ firstName, lastName, fullName: `${firstName} ${lastName}` });
                    addToast('Profile Updated', 'Your profile settings have been updated successfully.', 'success');
                  }}
                  className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-primary/10"
                >
                  Save Settings
                </button>
              </div>
            </div>

            {/* Notification settings */}
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-foreground">Subscriptions & Languages</h3>
                
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Email Announcements</span>
                    <input type="checkbox" defaultChecked className="accent-primary" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Push Alerts (Sonner)</span>
                    <input type="checkbox" defaultChecked className="accent-primary" />
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>SMS Emergency Warnings</span>
                    <input type="checkbox" className="accent-primary" />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/15 space-y-2">
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase">Localization Language</label>
                  <select 
                    value={language} 
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                  >
                    <option>English</option>
                    <option>Hindi (हिन्दी)</option>
                    <option>Marathi (मराठी)</option>
                  </select>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground font-sans leading-normal">
                Language updates translate dashboard controls and email headers. Accessibility configurations meet WCAG standards.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
