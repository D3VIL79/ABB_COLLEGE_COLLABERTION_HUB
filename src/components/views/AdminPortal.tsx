'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore, Challenge } from '@/store/usePlatformStore';
import { 
  Home, Megaphone, Calendar, Users, CheckCircle2, 
  Trash2, Plus, ArrowRight, ShieldCheck, Mail, Send,
  BarChart3, Settings, Trophy, ShieldAlert, MessageSquareCode, Clock, UserCheck,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnalyticsView } from './AnalyticsView';

export function AdminPortal() {
  const { 
    role, activeTab, allTeams, addNotification, addCalendarEvent, 
    notifications, calendarEvents, challenges, addChallenge, deleteChallenge,
    mentorRequests, assignMentor, resolveMentorRequest, mentors, setTab,
    countdownDate, phases, activePhaseIndex, setCountdownDate, setActivePhaseIndex, addPhase, updatePhase, deletePhase,
    updateChallengeProblemStatements
  } = usePlatformStore();

  const [selectedTrackForPs, setSelectedTrackForPs] = useState<string | null>(null);

  const handleUpdatePsField = (challengeId: string, psId: string, field: string, value: any) => {
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;
    const currentList = ch.problemStatements || [];
    const updatedList = currentList.map(ps => {
      if (ps.id === psId) {
        if (field === 'tags') {
          return { ...ps, tags: value.split(',').map((t: string) => t.trim()).filter(Boolean) };
        } else if (field === 'objectives' || field === 'requirements' || field === 'deliverables') {
          return { ...ps, [field]: value.split('\n').map((o: string) => o.trim()).filter(Boolean) };
        } else {
          return { ...ps, [field]: value };
        }
      }
      return ps;
    });
    updateChallengeProblemStatements(challengeId, updatedList);
  };

  const handleDeletePs = (challengeId: string, psId: string) => {
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;
    const currentList = ch.problemStatements || [];
    const updatedList = currentList.filter(ps => ps.id !== psId);
    updateChallengeProblemStatements(challengeId, updatedList);
  };

  const handleAddPs = (challengeId: string) => {
    const ch = challenges.find(c => c.id === challengeId);
    if (!ch) return;
    const currentList = ch.problemStatements || [];
    const newPs = {
      id: `ps-${challengeId}-${Date.now()}`,
      title: 'New Problem Statement',
      difficulty: 'Intermediate' as const,
      tags: ['General'],
      description: 'Describe the challenge here...',
      background: 'Provide background details here...',
      objectives: ['Objective 1'],
      requirements: ['Requirement 1'],
      deliverables: ['Deliverable 1'],
      evaluationCriteria: [
        { criteria: 'Technical execution', weight: 50 },
        { criteria: 'Innovation', weight: 50 }
      ]
    };
    updateChallengeProblemStatements(challengeId, [...currentList, newPs]);
  };

  // Announcement State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Event Hub Admin Config States
  const [tempDate, setTempDate] = useState('');
  const [newPhaseName, setNewPhaseName] = useState('');
  const [newPhaseDate, setNewPhaseDate] = useState('');
  const [newPhaseDesc, setNewPhaseDesc] = useState('');

  // Sync tempDate with store countdownDate once loaded
  useEffect(() => {
    if (countdownDate) {
      try {
        const d = new Date(countdownDate);
        const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setTempDate(iso);
      } catch (e) {
        setTempDate('');
      }
    }
  }, [countdownDate]);

  const handleSaveDate = () => {
    if (!tempDate) return;
    setCountdownDate(tempDate);
    addNotification(
      'Countdown Timer Updated',
      `The global platform countdown target date has been set to ${new Date(tempDate).toLocaleString()}.`,
      'announcement'
    );
  };

  const handleAddPhase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhaseName || !newPhaseDate || !newPhaseDesc) return;
    addPhase(newPhaseName, newPhaseDate, newPhaseDesc);
    addNotification(
      'New Phase Added',
      `Added event phase "${newPhaseName}" successfully.`,
      'announcement'
    );
    setNewPhaseName('');
    setNewPhaseDate('');
    setNewPhaseDesc('');
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return;
    
    addNotification(broadcastTitle, broadcastContent, 'announcement');
    setBroadcastSuccess(true);
    setBroadcastTitle('');
    setBroadcastContent('');
    setTimeout(() => setBroadcastSuccess(false), 4000);
  };

  // New Event (Challenge) Creation Form States
  const [newTitle, setNewTitle] = useState('');
  const [newTrack, setNewTrack] = useState('Energy Systems');
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Intermediate');
  const [newTags, setNewTags] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newBackground, setNewBackground] = useState('');
  const [newObjectives, setNewObjectives] = useState('');
  const [newRequirements, setNewRequirements] = useState('');
  const [newDeliverables, setNewDeliverables] = useState('');
  const [newMentors, setNewMentors] = useState('');
  const [challengeSuccess, setChallengeSuccess] = useState(false);

  const handleCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription || !newBackground) {
      alert('Please fill out Title, Description, and Background fields.');
      return;
    }

    const challengeObj = {
      id: `ch-${Date.now()}`,
      title: newTitle,
      track: newTrack,
      difficulty: newDifficulty,
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      description: newDescription,
      background: newBackground,
      objectives: newObjectives.split('\n').map(o => o.trim()).filter(Boolean),
      requirements: newRequirements.split('\n').map(r => r.trim()).filter(Boolean),
      deliverables: newDeliverables.split('\n').map(d => d.trim()).filter(Boolean),
      mentors: newMentors.split(',').map(m => m.trim()).filter(Boolean),
      evaluationCriteria: [
        { criteria: 'Technical implementation', weight: 40 },
        { criteria: 'Design & Usability', weight: 30 },
        { criteria: 'Innovation & Pitch', weight: 30 }
      ],
      resources: [
        { name: 'ABB Platform Quickstart Guide', type: 'document' as const, url: '#' }
      ]
    };

    addChallenge(challengeObj);
    setChallengeSuccess(true);
    
    // Clear states
    setNewTitle('');
    setNewTags('');
    setNewDescription('');
    setNewBackground('');
    setNewObjectives('');
    setNewRequirements('');
    setNewDeliverables('');
    setNewMentors('');

    setTimeout(() => setChallengeSuccess(false), 4000);
  };

  // Faculty states: Assigning mentors to tickets
  const [assigneeMentorMap, setAssigneeMentorMap] = useState<{ [ticketId: string]: string }>({});

  const handleAssignMentorSubmit = (ticketId: string) => {
    const selectedMentor = assigneeMentorMap[ticketId];
    if (!selectedMentor) {
      alert('Please select a mentor first.');
      return;
    }
    assignMentor(ticketId, selectedMentor);
    addNotification(
      'Support Request Assigned',
      `Faculty coordinator assigned mentor ${selectedMentor} to help ticket ${ticketId}.`,
      'mentor'
    );
    // Clear selection
    setAssigneeMentorMap(prev => ({ ...prev, [ticketId]: '' }));
  };

  const isAdmin = role === 'admin';

  return (
    <div className="flex-grow w-full overflow-y-auto bg-background font-satoshi">
      
      {/* ========================================== */}
      {/* I. ADMIN WORKFLOWS                         */}
      {/* ========================================== */}
      {isAdmin && (
        <>
          {/* A. ADMIN PORTAL DASHBOARD (Event Hub) */}
          {activeTab === 'dashboard' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  Control Console
                </span>
                <h2 className="text-xl font-black text-foreground mt-0.5">
                  ABB Event Administrator Console
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                  Manage event phases, broadcast emergency announcements, and oversee innovation tracks.
                </p>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-border/40 bg-card p-4 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Active Challenges Tracks</span>
                  <span className="text-base font-extrabold text-foreground mt-1.5 block font-mono">{challenges.length} Tracks</span>
                  <span className="text-[10px] text-muted-foreground block mt-1">Manage tracks in Event Configuration</span>
                </div>
                <div className="rounded-xl border border-border/40 bg-card p-4 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Broadcasting Audiences</span>
                  <span className="text-base font-extrabold text-primary mt-1.5 block font-mono">
                    {allTeams.reduce((sum, t) => sum + t.members.length, 0)} Innovators
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-1">Spans {allTeams.length} registered teams</span>
                </div>
                <div className="rounded-xl border border-border/40 bg-card p-4 relative overflow-hidden">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase block">Current Event Milestone</span>
                  <span className="text-base font-extrabold text-warning mt-1.5 block truncate">
                    {phases[activePhaseIndex]?.name || 'N/A'}
                  </span>
                  <span className="text-[10px] text-muted-foreground block mt-1">Timeline advanced via control center</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timeline Stepper controls */}
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-5">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-primary" />
                    Event Timeline Control Center
                  </h3>
                  
                  <div className="relative border-l border-border/50 pl-6 space-y-6">
                    {phases.map((evt, idx) => {
                      const isActive = idx === activePhaseIndex;
                      const isCompleted = idx < activePhaseIndex;

                      return (
                        <div key={evt.id} className="relative">
                          <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center transition-colors ${
                            isActive 
                              ? 'border-primary shadow-[0_0_8px_rgba(255,0,15,0.3)] bg-primary' 
                              : isCompleted 
                              ? 'border-emerald-500 bg-emerald-500' 
                              : 'border-border'
                          }`}>
                            {isCompleted && <span className="text-[8px] text-white">✓</span>}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                              Phase {idx + 1}
                            </span>
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase">Active</span>
                            )}
                          </div>
                          <h4 className="text-xs font-extrabold text-foreground mt-0.5">{evt.name}</h4>
                          <span className="text-[9px] text-muted-foreground block mt-0.5">{evt.date}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      disabled={activePhaseIndex === 0}
                      onClick={() => setActivePhaseIndex(activePhaseIndex - 1)}
                      className="flex-1 py-2.5 rounded-xl border border-border/30 hover:bg-muted/15 font-bold text-xs uppercase disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Previous Phase
                    </button>
                    <button
                      disabled={activePhaseIndex === phases.length - 1}
                      onClick={() => {
                        const nextIndex = activePhaseIndex + 1;
                        setActivePhaseIndex(nextIndex);
                        const nextPhase = phases[nextIndex];
                        if (nextPhase) {
                          addNotification(
                            'Timeline Phase Advanced',
                            `The event has progressed to "${nextPhase.name}" phase.`,
                            'announcement'
                          );
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Advance Phase
                    </button>
                  </div>
                </div>

                {/* Broadcast panel */}
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Megaphone className="w-4.5 h-4.5 text-primary" />
                    Broadcast Announcement
                  </h3>
                  
                  <form onSubmit={handleBroadcast} className="space-y-4">
                    {broadcastSuccess && (
                      <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Global announcement dispatched successfully!
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Header Title *</label>
                      <input
                        value={broadcastTitle}
                        onChange={(e) => setBroadcastTitle(e.target.value)}
                        placeholder="e.g. Checkpoint 1 Submissions Open"
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Detailed Message *</label>
                      <textarea
                        value={broadcastContent}
                        onChange={(e) => setBroadcastContent(e.target.value)}
                        rows={4}
                        placeholder="Enter broadcast details..."
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Dispatch Broadcast
                    </button>
                  </form>
                </div>
              </div>

              {/* Event Settings & Configuration Panel */}
              <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Settings className="w-4.5 h-4.5 text-primary" />
                    Event Configuration &amp; Timeline Hub
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Configure the global countdown timer target and add, update, or remove schedule phases.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Column 1: Countdown Date Setup */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/20 pb-2">
                      1. Global Countdown Date
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Target Date &amp; Time</label>
                        <input
                          type="datetime-local"
                          value={tempDate}
                          onChange={(e) => setTempDate(e.target.value)}
                          className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 border-white/10"
                        />
                      </div>
                      <button
                        onClick={handleSaveDate}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Update Countdown Timer
                      </button>
                      <div className="text-[10px] text-muted-foreground pt-1">
                        Current Target: <span className="text-white font-bold">{new Date(countdownDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Phase Creator Form */}
                  <div className="space-y-4 lg:border-l lg:border-r lg:border-border/20 lg:px-6">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/20 pb-2">
                      2. Add New Schedule Phase
                    </span>
                    <form onSubmit={handleAddPhase} className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Phase Title</label>
                        <input
                          value={newPhaseName}
                          onChange={(e) => setNewPhaseName(e.target.value)}
                          placeholder="e.g. Mid-Way Checkpoint"
                          className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Date Tag</label>
                        <input
                          value={newPhaseDate}
                          onChange={(e) => setNewPhaseDate(e.target.value)}
                          placeholder="e.g. June 24, 2026"
                          className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 border-white/10"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Description</label>
                        <textarea
                          value={newPhaseDesc}
                          onChange={(e) => setNewPhaseDesc(e.target.value)}
                          placeholder="Details about deliverables..."
                          rows={2}
                          className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none border-white/10"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Add Phase
                      </button>
                    </form>
                  </div>

                  {/* Column 3: Phases Editor / Manager */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block border-b border-border/20 pb-2">
                      3. Manage &amp; Edit Phases
                    </span>
                    <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin">
                      {phases.length === 0 ? (
                        <div className="text-[11px] text-muted-foreground py-8 text-center">No phases configured.</div>
                      ) : (
                        phases.map((p, idx) => (
                          <div key={p.id} className="p-3 bg-background border border-white/10 rounded-xl space-y-2 relative group">
                            <button
                              onClick={() => deletePhase(p.id)}
                              className="absolute top-2 right-2 text-white/40 hover:text-primary transition-colors cursor-pointer"
                              title="Delete phase"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="text-[9px] font-black text-primary uppercase">
                              Phase {idx + 1}
                            </div>
                            <div className="space-y-1.5">
                              <input
                                value={p.name}
                                onChange={(e) => updatePhase(p.id, e.target.value, p.date, p.description)}
                                className="w-full text-[11px] font-bold px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-white"
                              />
                              <input
                                value={p.date}
                                onChange={(e) => updatePhase(p.id, p.name, e.target.value, p.description)}
                                className="w-full text-[10px] font-semibold px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground"
                              />
                              <textarea
                                value={p.description}
                                onChange={(e) => updatePhase(p.id, p.name, p.date, e.target.value)}
                                rows={2}
                                className="w-full text-[9px] px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground resize-none"
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* B. MANAGE EVENTS / CHALLENGES SPRINT */}
          {activeTab === 'manage-events' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  Event Config
                </span>
                <h2 className="text-xl font-black text-foreground mt-0.5">
                  Manage Innovation Challenges
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                  Deploy new competition tracks, upload deliverables templates, or delete active tracks.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Creation Form */}
                <div className="lg:col-span-2 rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-primary" />
                    Deploy New Challenge Track
                  </h3>

                  <form onSubmit={handleCreateChallenge} className="space-y-4">
                    {challengeSuccess && (
                      <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Challenge track deployed successfully! Live in explorer.
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Challenge Title *</label>
                        <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Smart Decarbonization Pipeline" className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Innovation Track *</label>
                        <select value={newTrack} onChange={e => setNewTrack(e.target.value)} className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50">
                          <option>Energy Systems</option>
                          <option>Robotics</option>
                          <option>Artificial Intelligence</option>
                          <option>Sustainability</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Difficulty level *</label>
                        <select value={newDifficulty} onChange={e => setNewDifficulty(e.target.value as any)} className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50">
                          <option>Beginner</option>
                          <option>Intermediate</option>
                          <option>Advanced</option>
                          <option>Expert</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Tags (Comma Separated)</label>
                        <input value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="Grid, AI, ISO-14064" className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Brief Description *</label>
                      <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} rows={2} placeholder="Summary of the challenge scope..." className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Challenge Background *</label>
                      <textarea value={newBackground} onChange={e => setNewBackground(e.target.value)} rows={2} placeholder="Explain the industry context and problem background..." className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Objectives (New Line Separated)</label>
                        <textarea value={newObjectives} onChange={e => setNewObjectives(e.target.value)} rows={3} placeholder="Objective 1&#10;Objective 2" className="w-full text-xs font-semibold p-2 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Requirements (New Line Separated)</label>
                        <textarea value={newRequirements} onChange={e => setNewRequirements(e.target.value)} rows={3} placeholder="Requirement 1&#10;Requirement 2" className="w-full text-xs font-semibold p-2 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Deliverables (New Line Separated)</label>
                        <textarea value={newDeliverables} onChange={e => setNewDeliverables(e.target.value)} rows={3} placeholder="Deliverable 1&#10;Deliverable 2" className="w-full text-xs font-semibold p-2 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Mentors assigned (Comma Separated)</label>
                      <input value={newMentors} onChange={e => setNewMentors(e.target.value)} placeholder="Elena Rostova, Kenji Sato" className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" />
                    </div>

                    <button type="submit" className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-md">
                      Deploy Challenge Track
                    </button>
                  </form>
                </div>

                {/* Challenges Roster List */}
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center justify-between">
                    <span>Deployed Tracks ({challenges.length})</span>
                  </h3>

                  <div className="divide-y divide-border/25 max-h-[500px] overflow-y-auto pr-1 space-y-3">
                    {challenges.map((ch) => {
                      const isExpanded = selectedTrackForPs === ch.id;
                      const pStatements = ch.problemStatements || [];

                      return (
                        <div key={ch.id} className="pt-3 first:pt-0 flex flex-col gap-2.5">
                          <div className="flex flex-col justify-between gap-2.5">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase">{ch.track}</span>
                                <span className="text-[10px] font-bold text-muted-foreground font-mono">{ch.id}</span>
                              </div>
                              <h4 className="text-xs font-extrabold text-foreground mt-1.5 leading-snug">{ch.title}</h4>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] text-muted-foreground">{ch.participantsCount} teams active</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedTrackForPs(isExpanded ? null : ch.id)}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                    isExpanded 
                                      ? 'bg-primary border-primary text-white' 
                                      : 'bg-muted/40 border-border/30 text-foreground hover:bg-muted/60'
                                  }`}
                                >
                                  {isExpanded ? 'Hide PS' : `Manage PS (${pStatements.length})`}
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete track: "${ch.title}"?`)) {
                                      deleteChallenge(ch.id);
                                    }
                                  }}
                                  className="p-1 rounded bg-muted/60 text-muted-foreground hover:text-red-400 border border-border/30 hover:border-red-400/20 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded PS List Editor */}
                          {isExpanded && (
                            <div className="pl-3 border-l-2 border-primary/30 mt-2 space-y-4 pt-1 bg-[#111111]/30 p-3 rounded-lg border border-white/5">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">Problem Statements ({pStatements.length})</span>
                                <button
                                  type="button"
                                  onClick={() => handleAddPs(ch.id)}
                                  className="px-2 py-1 rounded bg-primary/10 border border-primary/20 text-primary text-[9px] font-bold flex items-center gap-1 hover:bg-primary/25 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" /> Add PS
                                </button>
                              </div>

                              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                                {pStatements.length === 0 ? (
                                  <div className="text-[9px] text-muted-foreground text-center py-4">No Problem Statements. Click 'Add PS' to create one.</div>
                                ) : (
                                  pStatements.map((ps, idx) => (
                                    <div key={ps.id} className="p-2.5 bg-background border border-white/5 rounded-lg space-y-2 relative">
                                      <button
                                        type="button"
                                        onClick={() => handleDeletePs(ch.id, ps.id)}
                                        className="absolute top-2 right-2 text-white/30 hover:text-primary transition-colors cursor-pointer"
                                        title="Delete PS"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>

                                      <div className="text-[9px] font-black text-primary">PS {idx + 1} ({ps.id})</div>

                                      <div className="space-y-2 text-[10px]">
                                        <div>
                                          <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Title</label>
                                          <input
                                            value={ps.title}
                                            onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'title', e.target.value)}
                                            className="w-full px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-white font-semibold"
                                          />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Difficulty</label>
                                            <select
                                              value={ps.difficulty}
                                              onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'difficulty', e.target.value)}
                                              className="w-full px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-white"
                                            >
                                              <option>Beginner</option>
                                              <option>Intermediate</option>
                                              <option>Advanced</option>
                                              <option>Expert</option>
                                            </select>
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Tags (comma sep)</label>
                                            <input
                                              value={ps.tags.join(', ')}
                                              onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'tags', e.target.value)}
                                              className="w-full px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-white"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Description</label>
                                          <textarea
                                            value={ps.description}
                                            onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'description', e.target.value)}
                                            rows={2}
                                            className="w-full px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground resize-none"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Background</label>
                                          <textarea
                                            value={ps.background}
                                            onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'background', e.target.value)}
                                            rows={2}
                                            className="w-full px-2 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground resize-none"
                                          />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                          <div>
                                            <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Objectives (lines)</label>
                                            <textarea
                                              value={ps.objectives.join('\n')}
                                              onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'objectives', e.target.value)}
                                              rows={2}
                                              className="w-full px-1.5 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground resize-none"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Requirements (lines)</label>
                                            <textarea
                                              value={ps.requirements.join('\n')}
                                              onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'requirements', e.target.value)}
                                              rows={2}
                                              className="w-full px-1.5 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground resize-none"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[8px] font-bold text-muted-foreground uppercase mb-0.5">Deliverables (lines)</label>
                                            <textarea
                                              value={ps.deliverables.join('\n')}
                                              onChange={(e) => handleUpdatePsField(ch.id, ps.id, 'deliverables', e.target.value)}
                                              rows={2}
                                              className="w-full px-1.5 py-1 rounded bg-muted/20 border border-white/5 focus:border-primary/40 outline-none text-muted-foreground resize-none"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* C. PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="relative h-full flex flex-col">
              <AnalyticsView />
            </div>
          )}
        </>
      )}

      {/* ========================================== */}
      {/* II. FACULTY WORKFLOWS                      */}
      {/* ========================================== */}
      {!isAdmin && (
        <>
          {/* A. FACULTY TEAMS DASHBOARD (Approvals Board) */}
          {activeTab === 'dashboard' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  Teams Console
                </span>
                <h2 className="text-xl font-black text-foreground mt-0.5">
                  Faculty Collaboration Board
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                  Review student team rosters, verify documentation, and approve submissions.
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground">Registered Teams</h3>
                
                <div className="divide-y divide-border/25">
                  {allTeams.map((team) => (
                    <div key={team.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-black text-foreground flex items-center gap-2">
                          {team.name}
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/20 uppercase">
                            {team.track}
                          </span>
                        </h4>
                        <div className="text-[10px] text-muted-foreground mt-1 font-mono leading-none">Code: {team.code}</div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Members: {team.members.length}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Progress: {team.progress}%
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => alert(`Simulated document verification for team ${team.name}`)}
                          className="px-4 py-2 rounded-lg border border-border/30 hover:border-border text-foreground hover:bg-muted/15 font-bold text-xs uppercase transition-all cursor-pointer"
                        >
                          Verify ID Documents
                        </button>
                        <button
                          onClick={() => alert(`Roster for team ${team.name} approved!`)}
                          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10"
                        >
                          Approve Roster
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* B. FACULTY REQUESTS QUEUE */}
          {activeTab === 'requests' && (
            <div className="p-4 sm:p-6 lg:p-8 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                  Support
                </span>
                <h2 className="text-xl font-black text-foreground mt-0.5">
                  Student & Mentor Requests Queue
                </h2>
                <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                  Monitor active assistance tickets generated by teams and assign experts to resolve blocks.
                </p>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground">Support Tickets Log</h3>

                <div className="divide-y divide-border/25">
                  {mentorRequests.length === 0 ? (
                    <div className="py-10 text-center text-xs text-muted-foreground">
                      No active mentor support request tickets logged in database.
                    </div>
                  ) : (
                    mentorRequests.map((req) => {
                      const currentAssignee = assigneeMentorMap[req.id] || '';

                      return (
                        <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                                req.priority === 'Urgent' 
                                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                  : req.priority === 'High' 
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                                  : 'bg-muted border-border/20 text-muted-foreground'
                              }`}>
                                {req.priority} Priority
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">{req.id}</span>
                              <span className={`text-[10px] font-semibold ${
                                req.status === 'resolved' 
                                  ? 'text-emerald-400' 
                                  : req.status === 'assigned' 
                                  ? 'text-blue-400' 
                                  : 'text-yellow-400'
                              }`}>
                                ● {req.status.toUpperCase()}
                              </span>
                            </div>

                            <h4 className="text-xs font-black text-foreground">
                              {req.teamName} · <span className="text-muted-foreground font-semibold">{req.challengeTitle}</span>
                            </h4>

                            <p className="text-[11px] text-muted-foreground leading-relaxed font-sans mt-1">
                              <span className="font-bold text-foreground">Category: {req.type}</span> — {req.description}
                            </p>

                            <div className="flex items-center gap-4 text-[9px] text-muted-foreground">
                              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Created: {new Date(req.createdAt).toLocaleTimeString()}</span>
                              {req.mentorName && (
                                <span className="flex items-center gap-1 text-blue-400"><UserCheck className="w-3.5 h-3.5" /> Assigned: {req.mentorName}</span>
                              )}
                            </div>
                          </div>

                          {/* Action panel */}
                          {req.status !== 'resolved' && (
                            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                              {req.status === 'pending' && (
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <select 
                                    value={currentAssignee}
                                    onChange={e => setAssigneeMentorMap(prev => ({ ...prev, [req.id]: e.target.value }))}
                                    className="text-[11px] font-semibold p-2 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                                  >
                                    <option value="">Choose Mentor...</option>
                                    {mentors.map(m => (
                                      <option key={m.id} value={m.name}>{m.name} ({m.expertise[0]})</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleAssignMentorSubmit(req.id)}
                                    className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors"
                                  >
                                    Assign
                                  </button>
                                </div>
                              )}

                              <button
                                onClick={() => {
                                  resolveMentorRequest(req.id);
                                  addNotification(
                                    'Support Request Resolved',
                                    `Ticket ${req.id} resolved by Faculty.`,
                                    'mentor'
                                  );
                                }}
                                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors w-full sm:w-auto"
                              >
                                Mark Resolved
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================== */}
      {/* III. SHARED PREFERENCES / PROFILE SETTINGS */}
      {/* ========================================== */}
      {activeTab === 'profile' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Configuration
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Personal Preferences Settings
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Manage system subscriptions, access keys, and dashboard translation parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-foreground">SSO Workspace Credentials</h3>
              
              <div className="space-y-3 font-sans">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Campus Profile ID:</span>
                  <span className="font-bold text-foreground font-mono">UID-2026-9812A</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Assigned Role Context:</span>
                  <span className="font-bold text-primary uppercase font-mono">{role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Session Tokens status:</span>
                  <span className="font-bold text-emerald-400 uppercase">Active (SSO)</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/15">
                <button onClick={() => alert('SSO credentials refreshed!')} className="py-2.5 px-5 rounded-xl border border-border/30 hover:border-border text-foreground hover:bg-muted/15 font-bold text-xs uppercase tracking-wide cursor-pointer transition-colors w-full">
                  Refresh Credentials
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
              <h3 className="text-sm font-extrabold text-foreground">Preferences Localization</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Receive Email Reports</span>
                  <input type="checkbox" defaultChecked className="accent-primary" />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Display Emergency Alerts</span>
                  <input type="checkbox" defaultChecked className="accent-primary" />
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Sound Notifications</span>
                  <input type="checkbox" className="accent-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
