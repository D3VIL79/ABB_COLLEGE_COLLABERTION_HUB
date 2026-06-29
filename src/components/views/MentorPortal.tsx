'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePlatformStore, MentorRequest } from '@/store/usePlatformStore';
import { 
  Users, MessageSquareCode, Calendar, CheckCircle2, ChevronRight, 
  Trash2, PhoneCall, Video, VideoOff, Mic, MicOff, Send, HelpCircle, Code, ShieldCheck,
  TrendingUp, Award, Clock, Sliders, ClipboardCheck, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

export function MentorPortal() {
  const { 
    activeTab, mentorRequests, assignMentor, resolveMentorRequest, 
    addCalendarEvent, mentors, user, updateUserProfile, addToast,
    allTeams, evaluationRound, submitMentorEvaluation
  } = usePlatformStore();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Mentor profile & settings states
  const [firstName, setFirstName] = useState('Elena');
  const [lastName, setLastName] = useState('Rostova');
  const [email, setEmail] = useState('elena.rostova@abb.com');
  const [bio, setBio] = useState('Senior R&D Engineer at ABB Energy Systems. Specializes in microgrid simulations, smart distribution systems, and battery storage integration.');
  const [mentorStatus, setMentorStatus] = useState<'available' | 'busy'>('available');

  useEffect(() => {
    const isUserAMentor = mentors.some(m => m.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase());
    if (isUserAMentor) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
    } else {
      setFirstName('Elena');
      setLastName('Rostova');
      setEmail('elena.rostova@abb.com');
    }
  }, [user, mentors]);

  // Notification and alert preferences states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [teamsIntegration, setTeamsIntegration] = useState(false);
  
  // Call session states
  const [sessionActive, setSessionActive] = useState(false);
  const [callTime, setCallTime] = useState(0);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  
  // Code editor simulator state
  const [mockCode, setMockCode] = useState(
`// ABB Microgrid Load Balancing Optimization
function balanceGridLoad(demandCurve, batteryCurves) {
  const solarForecasting = predictSolarOutput();
  let remainingDemand = demandCurve - solarForecasting;
  
  if (remainingDemand > 0) {
    // Dispatch batteries...
    return dischargeStorage(batteryCurves, remainingDemand);
  }
  return chargeStorage(batteryCurves, Math.abs(remainingDemand));
}`
  );

  // Workshop Scheduling Form State
  const [schedTitle, setSchedTitle] = useState('');
  const [schedStart, setSchedStart] = useState('');
  const [schedDesc, setSchedDesc] = useState('');
  const [schedSuccess, setSchedSuccess] = useState(false);

  // Team evaluation local states
  const [evaluatingTeamId, setEvaluatingTeamId] = useState<string | null>(null);
  const [slider1, setSlider1] = useState(80);
  const [slider2, setSlider2] = useState(80);
  const [slider3, setSlider3] = useState(80);
  const [verifiedFeatures, setVerifiedFeatures] = useState<Record<string, boolean>>({});
  const [evalComment, setEvalComment] = useState('');
  const [progressSlider, setProgressSlider] = useState(65);

  const evaluatingTeam = allTeams.find(t => t.id === evaluatingTeamId);

  useEffect(() => {
    if (evaluatingTeam) {
      const existing = evaluatingTeam.mentorEvaluations?.find(e => e.round === evaluationRound);
      if (existing) {
        setSlider1(existing.scores[0]?.score ?? 80);
        setSlider2(existing.scores[1]?.score ?? 80);
        setSlider3(existing.scores[2]?.score ?? 80);
        setEvalComment(existing.comment || '');
        setProgressSlider(evaluatingTeam.progress || 15);
        
        const checklistMap: Record<string, boolean> = {};
        existing.checklistRemarks.forEach(r => {
          checklistMap[r.featureName] = r.implemented;
        });
        setVerifiedFeatures(checklistMap);
      } else {
        setSlider1(80);
        setSlider2(80);
        setSlider3(80);
        setEvalComment('');
        setProgressSlider(evaluatingTeam.progress || 15);
        
        const checklistMap: Record<string, boolean> = {};
        (evaluatingTeam.proposedFeatures || []).forEach(f => {
          checklistMap[f.name] = f.implemented;
        });
        setVerifiedFeatures(checklistMap);
      }
    }
  }, [evaluatingTeamId, evaluationRound, allTeams, evaluatingTeam]);

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evaluatingTeamId || !evaluatingTeam) return;
    
    let criteriaNames = ['Score 1', 'Score 2', 'Score 3'];
    if (evaluationRound === 1) {
      criteriaNames = ['Core Idea & PPT', 'Feature Set Feasibility', 'Unique Value Proposition (USP)'];
    } else if (evaluationRound === 2) {
      criteriaNames = ['Functionality Quality', 'Code Architecture & Performance', 'Development Velocity'];
    } else if (evaluationRound === 3) {
      criteriaNames = ['UI/UX Appeal & Aesthetics', 'Integration & Final Polish', 'Presentation & Q&A Readiness'];
    }
    
    const scores = [
      { criteria: criteriaNames[0], score: slider1 },
      { criteria: criteriaNames[1], score: slider2 },
      { criteria: criteriaNames[2], score: slider3 }
    ];
    
    const roundFeatures = (evaluatingTeam.proposedFeatures || []).filter(f => f.round === evaluationRound);
    const checklistRemarks = roundFeatures.map(f => ({
      featureName: f.name,
      implemented: !!verifiedFeatures[f.name],
      score: !!verifiedFeatures[f.name] ? 10 : 0
    }));
    
    const isUserAMentor = mentors.some(m => m.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase());
    const mentorFullName = isUserAMentor ? `${user.firstName} ${user.lastName}` : 'Elena Rostova';
    
    submitMentorEvaluation(evaluatingTeamId, evaluationRound, mentorFullName, scores, checklistRemarks, evalComment, progressSlider);
    addToast('Evaluation Submitted', `Successfully graded Team ${evaluatingTeam.name} for Round ${evaluationRound}`, 'success');
    setEvaluatingTeamId(null);
  };

  // Call timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionActive) {
      timer = setInterval(() => {
        setCallTime(prev => prev + 1);
      }, 1000);
    } else {
      setCallTime(0);
    }
    return () => clearInterval(timer);
  }, [sessionActive]);

  const selectedTicket = mentorRequests.find(r => r.id === selectedTicketId);

  // Copy code helper to format call durations
  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleAcceptTicket = () => {
    if (!selectedTicketId) return;
    assignMentor(selectedTicketId, 'Elena Rostova');
  };

  const handleResolveTicket = () => {
    if (!selectedTicketId) return;
    resolveMentorRequest(selectedTicketId);
    setSessionActive(false);
    setSelectedTicketId(null);
  };

  const handleScheduleWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedTitle || !schedStart) return;

    addCalendarEvent(
      schedTitle,
      `${schedStart}T10:00:00`,
      `${schedStart}T12:00:00`,
      'workshop',
      schedDesc || 'ABB mentoring session'
    );
    
    setSchedSuccess(true);
    setSchedTitle('');
    setSchedStart('');
    setSchedDesc('');
    setTimeout(() => setSchedSuccess(false), 4000);
  };

  return (
    <div className="flex-1 w-full overflow-y-auto bg-background font-satoshi">
      {/* A. HELP TICKETS QUEUE */}
      {activeTab === 'mentor' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Support
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Assistance Tickets Queue
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Accept help request tickets from student teams and launch collaborative call workspaces.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets Roster List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                <h3 className="text-sm font-extrabold text-foreground">Active Assistance Tickets</h3>

                <div className="divide-y divide-border/25">
                  {mentorRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedTicketId(req.id)}
                      className={`py-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/10 px-2 rounded-xl transition-all ${
                        selectedTicketId === req.id ? 'bg-primary/5 border border-primary/25' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                          {req.teamName}
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded border uppercase ${
                            req.priority === 'Urgent' 
                              ? 'border-danger/30 text-danger bg-danger/5 animate-pulse' 
                              : req.priority === 'High' 
                              ? 'border-warning/30 text-warning bg-warning/5' 
                              : 'border-border bg-background text-muted-foreground'
                          }`}>
                            {req.priority}
                          </span>
                        </h4>
                        <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">
                          Track: {req.challengeTitle}
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-normal mt-2 line-clamp-1 font-sans">
                          {req.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {req.status === 'resolved' ? (
                          <span className="text-[10px] font-bold text-success flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                          </span>
                        ) : req.status === 'assigned' ? (
                          <span className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase">
                            Assigned
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-warning flex items-center gap-1 uppercase">
                            Queue
                          </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Video / Action Workspace Panel */}
            <div className="space-y-4">
              {selectedTicket ? (
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-5 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                  
                  <div>
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest">
                      {selectedTicket.type} Help Ticket
                    </span>
                    <h3 className="text-base font-extrabold text-foreground mt-1 leading-snug">
                      Assigned: {selectedTicket.teamName}
                    </h3>
                  </div>

                  <div className="text-xs text-muted-foreground leading-relaxed font-sans bg-muted/10 p-3 rounded-xl border border-border/20">
                    <div className="font-bold text-foreground mb-1">Issue Description:</div>
                    {selectedTicket.description}
                  </div>

                  {selectedTicket.status === 'pending' && (
                    <button
                      onClick={handleAcceptTicket}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Accept Assistance Request
                    </button>
                  )}

                  {selectedTicket.status === 'assigned' && !sessionActive && (
                    <button
                      onClick={() => setSessionActive(true)}
                      className="w-full py-2.5 rounded-xl bg-success hover:bg-success/95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      Launch Call Workspace
                    </button>
                  )}

                  {selectedTicket.status === 'resolved' && (
                    <div className="p-4 rounded-xl border border-success/30 bg-success/5 text-success text-xs font-semibold flex flex-col items-center gap-2 text-center py-10">
                      <CheckCircle2 className="w-8 h-8 text-success" />
                      Ticket has been resolved and completed.
                    </div>
                  )}

                  {/* ACTIVE MEETING ROOM SIMULATOR */}
                  <AnimatePresence>
                    {sessionActive && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[9995] bg-background/95 backdrop-blur-md flex flex-col lg:flex-row p-6 gap-6 font-satoshi"
                      >
                        {/* Call Feeds (Left) */}
                        <div className="flex-1 flex flex-col justify-between border border-border/40 bg-card rounded-2xl p-4 shadow-xl">
                          <div className="flex justify-between items-center pb-3 border-b border-border/20">
                            <div>
                              <h4 className="text-sm font-extrabold text-foreground">Live Call: {selectedTicket.teamName}</h4>
                              <div className="text-[10px] text-muted-foreground uppercase font-bold mt-0.5 tracking-wider">WebSocket Synced Feed</div>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-danger/10 border border-danger/20 text-danger text-xs font-mono font-bold">
                              {formatDuration(callTime)}
                            </div>
                          </div>

                          {/* Cameras Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 flex-1">
                            {/* Student Camera */}
                            <div className="rounded-xl border border-border/30 bg-background/50 flex flex-col items-center justify-center relative overflow-hidden p-4">
                              {videoActive ? (
                                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center text-xl font-bold bg-primary text-white">S</div>
                              ) : (
                                <VideoOff className="w-8 h-8 text-muted-foreground" />
                              )}
                              <span className="text-xs font-bold text-foreground mt-4">Alex Chen (Student)</span>
                              <span className="absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border">ACC-Student</span>
                            </div>

                            {/* Mentor Camera */}
                            <div className="rounded-xl border border-border/30 bg-background/50 flex flex-col items-center justify-center relative overflow-hidden p-4">
                              {videoActive ? (
                                <div className="w-16 h-16 rounded-full border border-border flex items-center justify-center text-xl font-bold bg-[#2196F3] text-white">M</div>
                              ) : (
                                <VideoOff className="w-8 h-8 text-muted-foreground" />
                              )}
                              <span className="text-xs font-bold text-foreground mt-4">Elena Rostova (ABB Mentor)</span>
                              <span className="absolute bottom-3 right-3 text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">ACC-ABB Staff</span>
                            </div>
                          </div>

                          {/* Controls bar */}
                          <div className="flex items-center justify-between pt-3 border-t border-border/20">
                            <div className="flex gap-2">
                              <button
                                onClick={() => setMicActive(!micActive)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  micActive ? 'border-border text-muted-foreground hover:text-foreground' : 'border-danger/30 text-danger bg-danger/5'
                                }`}
                              >
                                {micActive ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => setVideoActive(!videoActive)}
                                className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                                  videoActive ? 'border-border text-muted-foreground hover:text-foreground' : 'border-danger/30 text-danger bg-danger/5'
                                }`}
                              >
                                {videoActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                              </button>
                            </div>

                            <button
                              onClick={handleResolveTicket}
                              className="px-6 py-2.5 rounded-xl bg-danger hover:bg-danger/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md"
                            >
                              Resolve & Close Session
                            </button>
                          </div>
                        </div>

                        {/* Synced Editor (Right) */}
                        <div className="w-full lg:w-[450px] flex flex-col border border-border/40 bg-card rounded-2xl p-4 shadow-xl">
                          <h4 className="text-sm font-extrabold text-foreground flex items-center gap-2 pb-3 border-b border-border/20">
                            <Code className="w-4.5 h-4.5 text-primary" />
                            Collaborative Code Board
                          </h4>
                          
                          <textarea
                            value={mockCode}
                            onChange={(e) => setMockCode(e.target.value)}
                            rows={15}
                            className="flex-1 mt-4 p-3 rounded-xl border border-border/30 bg-background text-xs font-mono text-foreground outline-none focus:border-primary/50 resize-none leading-relaxed"
                          />

                          <div className="text-[10px] text-muted-foreground leading-normal font-sans pt-3 border-t border-border/15 mt-4">
                            Changes in this editor sync dynamically to all student screens in the session.
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="rounded-2xl border border-border/40 bg-card p-5 text-center text-xs text-muted-foreground py-10">
                  Select an active assistance ticket from the list to preview details and launch video workspace.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. MENTOR HUB DASHBOARD & EVALUATION BOARD */}
      {activeTab === 'dashboard' && (() => {
        const isUserAMentor = mentors.some(m => m.name.toLowerCase() === `${user.firstName} ${user.lastName}`.toLowerCase());
        const mentorFullName = isUserAMentor ? `${user.firstName} ${user.lastName}` : 'Elena Rostova';
        const searchLastName = isUserAMentor ? user.lastName : 'Rostova';
        const myAssignedTeams = allTeams.filter(t => 
          t.assignedMentorName === mentorFullName ||
          t.assignedMentorName?.toLowerCase().includes(searchLastName.toLowerCase())
        );

        return (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                Overview
              </span>
              <h2 className="text-xl font-black text-foreground mt-0.5">
                Mentor Command Dashboard
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                Monitor your assigned teams, perform interval round evaluations, and schedule workshops.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Assigned Teams / Evaluation Panel */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Team Evaluation Board (Conditional Panel) */}
                {evaluatingTeamId && evaluatingTeam ? (
                  <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-5 shadow-lg shadow-primary/5">
                    <div className="flex items-center justify-between border-b border-border/20 pb-3">
                      <div>
                        <span className="text-[9px] font-black uppercase text-primary tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/20">Active Evaluation</span>
                        <h3 className="text-sm font-extrabold text-foreground mt-1 flex items-center gap-1.5">
                          <span>Grading: {evaluatingTeam.name}</span>
                          <span className="text-xs font-sans text-muted-foreground">({evaluatingTeam.college})</span>
                        </h3>
                      </div>
                      <button 
                        onClick={() => setEvaluatingTeamId(null)}
                        className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                      >
                        <ChevronLeft className="w-4 h-4" /> Back to roster
                      </button>
                    </div>

                    <form onSubmit={handleSubmitEvaluation} className="space-y-5">
                      <div className="p-3.5 rounded-xl border border-border/30 bg-background/50 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-bold text-foreground">Current Event Interval</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">Evaluation parameters update dynamically.</div>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-wider font-mono">
                          Round {evaluationRound}
                        </div>
                      </div>

                      {/* Criteria sliders */}
                      <div className="space-y-4">
                        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Evaluation Sliders (0 - 100)</h4>
                        
                        {(() => {
                          let label1 = 'Idea & Originality';
                          let label2 = 'Feasibility';
                          let label3 = 'USP & Pitch';
                          
                          if (evaluationRound === 2) {
                            label1 = 'Functionality Quality';
                            label2 = 'Code & Performance';
                            label3 = 'Development Velocity';
                          } else if (evaluationRound === 3) {
                            label1 = 'UI/UX Appeal';
                            label2 = 'Integration & Polish';
                            label3 = 'Presentation & Q&A';
                          }
                          
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 rounded-xl border border-border/25 bg-background space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-foreground">
                                  <span>{label1}</span>
                                  <span className="text-primary font-mono">{slider1}</span>
                                </div>
                                <input type="range" min="0" max="100" value={slider1} onChange={e => setSlider1(Number(e.target.value))} className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                              </div>

                              <div className="p-3 rounded-xl border border-border/25 bg-background space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-foreground">
                                  <span>{label2}</span>
                                  <span className="text-primary font-mono">{slider2}</span>
                                </div>
                                <input type="range" min="0" max="100" value={slider2} onChange={e => setSlider2(Number(e.target.value))} className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                              </div>

                              <div className="p-3 rounded-xl border border-border/25 bg-background space-y-2">
                                <div className="flex justify-between text-[11px] font-bold text-foreground">
                                  <span>{label3}</span>
                                  <span className="text-primary font-mono">{slider3}</span>
                                </div>
                                <input type="range" min="0" max="100" value={slider3} onChange={e => setSlider3(Number(e.target.value))} className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                              </div>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Team Progress Adjuster */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Overall Team Progress</h4>
                        <div className="p-3 rounded-xl border border-border/25 bg-background space-y-2">
                          <div className="flex justify-between text-[11px] font-bold text-foreground">
                            <span>Adjust Team Progress Status</span>
                            <span className="text-primary font-mono">{progressSlider}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={progressSlider} 
                            onChange={e => setProgressSlider(Number(e.target.value))} 
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                          />
                          <p className="text-[9px] text-muted-foreground font-medium italic leading-normal mt-1">
                            Setting this progress updates the team's dashboard metrics and milestone velocity.
                          </p>
                        </div>
                      </div>

                      {/* Checklist Remarks */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Features Verification Checklist (Round {evaluationRound})</h4>
                        {(() => {
                          const roundFeatures = (evaluatingTeam.proposedFeatures || []).filter(f => f.round === evaluationRound);
                          if (roundFeatures.length === 0) {
                            return (
                              <div className="text-[10px] text-muted-foreground bg-background p-3.5 rounded-xl border border-dashed border-border/60 italic text-center">
                                No proposed features submitted by student team for verification in Round {evaluationRound}.
                              </div>
                            );
                          }
                          return (
                            <div className="space-y-2">
                              {roundFeatures.map(f => (
                                <label key={f.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/25 bg-background hover:bg-muted/10 transition-colors cursor-pointer text-left font-sans font-semibold">
                                  <input 
                                    type="checkbox"
                                    checked={!!verifiedFeatures[f.name]}
                                    onChange={e => {
                                      setVerifiedFeatures(prev => ({
                                        ...prev,
                                        [f.name]: e.target.checked
                                      }));
                                    }}
                                    className="mt-0.5 w-4 h-4 rounded border-border/40 text-primary focus:ring-primary/20 cursor-pointer"
                                  />
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                      <span>{f.name}</span>
                                      <span className="text-[8px] font-bold px-1 rounded border border-border/40 text-muted-foreground uppercase shrink-0">Round {f.round}</span>
                                    </div>
                                    <div className="text-[10px] text-muted-foreground leading-normal mt-0.5 font-sans font-medium break-words">{f.description}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Comments */}
                      <div>
                        <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1.5">Mentor suggestions & remarks *</label>
                        <textarea 
                          value={evalComment}
                          onChange={e => setEvalComment(e.target.value)}
                          rows={3} 
                          placeholder="Provide constructive feedback, architectural recommendations, and next-round improvement goals..." 
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none"
                          required
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2">
                        <button 
                          type="button"
                          onClick={() => setEvaluatingTeamId(null)}
                          className="px-5 py-2.5 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit"
                          className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/10"
                        >
                          Submit Round {evaluationRound} Evaluation
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* My Assigned Teams List Roster */
                  <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                    <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                      <Users className="w-4.5 h-4.5 text-primary" />
                      <span>My Assigned Teams ({myAssignedTeams.length})</span>
                    </h3>

                    <div className="divide-y divide-border/25">
                      {myAssignedTeams.map((t) => (
                        <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0 text-left">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                              <span>{t.name}</span>
                              <span className="text-[9px] font-mono bg-muted px-2 py-0.5 rounded border border-border/40 text-muted-foreground shrink-0 uppercase tracking-wide">{t.track}</span>
                            </h4>
                            <div className="text-[10px] text-muted-foreground mt-0.5 leading-normal font-sans truncate max-w-sm">{t.college}</div>
                            
                            {/* Badges List */}
                            {t.badges && t.badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {t.badges.map(badge => (
                                  <span key={badge} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-primary/20 text-primary bg-primary/5 uppercase shrink-0">
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 border-t border-border/10 sm:border-t-0 pt-2 sm:pt-0">
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Progress</span>
                              <span className="text-xs font-bold text-foreground">{t.progress}%</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-bold text-muted-foreground uppercase block">Total Points</span>
                              <span className="text-xs font-extrabold text-primary font-mono">{t.points || 0} pts</span>
                            </div>
                            <button 
                              onClick={() => setEvaluatingTeamId(t.id)}
                              className="px-3.5 py-2 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all font-bold text-xs uppercase cursor-pointer"
                            >
                              Evaluate
                            </button>
                          </div>
                        </div>
                      ))}
                      {myAssignedTeams.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground font-sans text-xs italic">
                          No teams assigned to you at the moment. Admin will assign teams soon.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Workshop Scheduler */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-primary" />
                    <span>Schedule Workshop Slot</span>
                  </h3>
                  
                  <form onSubmit={handleScheduleWorkshop} className="space-y-4">
                    {schedSuccess && (
                      <div className="p-3 rounded-lg border border-success/30 bg-success/5 text-success text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Workshop scheduled successfully!</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Seminar Title *</label>
                      <input
                        value={schedTitle}
                        onChange={(e) => setSchedTitle(e.target.value)}
                        placeholder="e.g. ROS pathfinding tips"
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 animate-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Date Selector *</label>
                      <input
                        type="date"
                        value={schedStart}
                        onChange={(e) => setSchedStart(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 animate-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Workshop Description</label>
                      <textarea
                        value={schedDesc}
                        onChange={(e) => setSchedDesc(e.target.value)}
                        rows={2}
                        placeholder="Enter details about materials and recommended prep..."
                        className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer"
                    >
                      Schedule Session
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* C. MENTOR ANALYTICS / MY IMPACT */}
      {activeTab === 'analytics' && (() => {
        const myRequests = mentorRequests.filter(r => r.mentorName === 'Elena Rostova');
        const myResolvedCount = myRequests.filter(r => r.status === 'resolved').length;
        const myActiveCount = myRequests.filter(r => r.status === 'assigned').length;

        // Mocked progress delta of helped teams
        const helpedTeamsData = [
          { name: 'CyberPulse', track: 'Energy Systems', before: 45, after: 65, delta: 20 },
          { name: 'RoboKnights', track: 'Robotics', before: 60, after: 80, delta: 20 }
        ];

        const requestTypeData = [
          { name: 'Technical', value: myRequests.filter(r => r.type === 'Technical').length || 2, fill: '#ff000f' },
          { name: 'Architecture', value: myRequests.filter(r => r.type === 'Architecture').length || 1, fill: '#3b82f6' },
          { name: 'Deployment', value: myRequests.filter(r => r.type === 'Deployment').length || 1, fill: '#10b981' },
          { name: 'Design', value: myRequests.filter(r => r.type === 'Design').length || 1, fill: '#f59e0b' }
        ];

        const priorityData = [
          { name: 'Low', count: myRequests.filter(r => r.priority === 'Low').length || 1, fill: '#64748b' },
          { name: 'Medium', count: myRequests.filter(r => r.priority === 'Medium').length || 2, fill: '#3b82f6' },
          { name: 'High', count: myRequests.filter(r => r.priority === 'High').length || 1, fill: '#f59e0b' },
          { name: 'Urgent', count: myRequests.filter(r => r.priority === 'Urgent').length || 1, fill: '#ff000f' }
        ];

        return (
          <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                Analytics
              </span>
              <h2 className="text-xl font-black text-foreground mt-0.5">
                My Mentor Impact
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
                Review your session statistics, request distributions, and progress velocity deltas of teams helped.
              </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">Resolved Tickets</span>
                <span className="text-2xl font-black text-foreground mt-1.5 block font-mono">{myResolvedCount} Resolved</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">Support requests successfully closed</span>
              </div>
              <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">Active Assignments</span>
                <span className="text-2xl font-black text-primary mt-1.5 block font-mono">{myActiveCount} Active</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">Currently assigned calls</span>
              </div>
              <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block">Average Help Velocity</span>
                <span className="text-2xl font-black text-emerald-500 mt-1.5 block font-mono">+20% Progress</span>
                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">Average team progress gain post-session</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel: Teams helped list */}
              <div className="bg-[#111] border border-border/10 p-5 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide border-b border-border/5 pb-2">
                  Helped Teams Progress Deltas
                </h3>

                <div className="space-y-3">
                  {helpedTeamsData.map((team, idx) => (
                    <div key={idx} className="bg-[#151515] p-4 rounded-xl border border-border/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-bold text-foreground">{team.name}</div>
                          <span className="text-[9px] text-muted-foreground/60 uppercase font-bold">{team.track}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-500">+{team.delta}% Gain</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                          <span>Before session: {team.before}%</span>
                          <span>Now: {team.after}%</span>
                        </div>
                        <div className="w-full bg-[#202020] h-1.5 rounded-full overflow-hidden flex items-center">
                          <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${team.after}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Charts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pie Chart: Request Types */}
                <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">Request Categories</h4>
                  
                  <div className="h-[150px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={requestTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {requestTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#181818] border border-border/25 p-1.5 rounded text-[10px] font-bold text-foreground">
                                {payload[0].name}: {payload[0].value}
                              </div>
                            );
                          }
                          return null;
                        }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center text-[9px] font-bold mt-2">
                    {requestTypeData.map((entry, idx) => (
                      <span key={idx} style={{ color: entry.fill }}>● {entry.name}</span>
                    ))}
                  </div>
                </div>

                {/* Bar Chart: Priority levels */}
                <div className="bg-[#111111] border border-border/10 p-5 rounded-2xl flex flex-col justify-between">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase">Severity Counts</h4>

                  <div className="h-[150px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                        <XAxis dataKey="name" stroke="#666" fontSize={8} />
                        <YAxis stroke="#666" fontSize={8} allowDecimals={false} />
                        <Tooltip content={({ active, payload }: any) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-[#181818] border border-border/25 p-1.5 rounded text-[10px] font-bold text-foreground">
                                Count: {payload[0].value}
                              </div>
                            );
                          }
                          return null;
                        }} />
                        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                          {priorityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* D. MENTOR PROFILE & SETTINGS */}
      {activeTab === 'profile' && (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              Configuration
            </span>
            <h2 className="text-xl font-black text-foreground mt-0.5">
              Mentor Settings & Preferences
            </h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-normal font-sans">
              Personalize expert profile cards, manage real-time assistance status, and configure support alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Personal info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Card */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Mentor Profile Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">First Name *</label>
                    <input 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Last Name *</label>
                    <input 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Corporate Email Address *</label>
                    <input 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Corporate Affiliation / Department *</label>
                    <input 
                      disabled
                      value="ABB Energy Systems Division" 
                      className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-muted text-muted-foreground outline-none cursor-not-allowed" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Expert Profile Bio</label>
                  <textarea 
                    value={bio} 
                    onChange={e => setBio(e.target.value)} 
                    rows={4}
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50 resize-none leading-relaxed" 
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!firstName || !lastName || !email) {
                        addToast('Required Fields Missing', 'Please fill out all mandatory mentor profile fields.', 'error');
                        return;
                      }
                      updateUserProfile({ firstName, lastName, fullName: `${firstName} ${lastName}`, email });
                      addToast('Mentor Profile Saved', 'Successfully saved expert biography and credentials.', 'success');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-primary hover:bg-primary/95 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all shadow-md shadow-primary/10"
                  >
                    Save Biography
                  </button>
                </div>
              </div>

              {/* Alert System Config */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <MessageSquareCode className="w-4 h-4 text-primary" />
                  Assistance Alerts Dispatcher
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Email Dispatch Alert</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Deliver copy of student code issues directly to your outlook inbox.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailAlerts}
                      onChange={e => setEmailAlerts(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Browser Push Alerts (Sonner)</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Pop live desktop alert cards instantly when a team requests assistance.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={pushAlerts}
                      onChange={e => setPushAlerts(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">Audio Bell Sound Warnings</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Play an acoustic ringtone sound alert for URGENT/HIGH queue tickets.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={audioAlerts}
                      onChange={e => setAudioAlerts(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-border/10 pt-4">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-foreground">ABB MS-Teams Integration</div>
                      <div className="text-[10px] text-muted-foreground leading-normal">Mirror tickets and code snippets directly inside your ABB teams workspace.</div>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={teamsIntegration}
                      onChange={e => setTeamsIntegration(e.target.checked)}
                      className="accent-primary w-4.5 h-4.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Status control */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />

                <div>
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    Availability Status
                  </h3>
                  <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                    Control whether student teams can assign you pending support tickets.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex gap-2 p-1 bg-[#151515] border border-border/10 rounded-xl">
                    <button
                      onClick={() => {
                        setMentorStatus('available');
                        addToast('Status Available', 'You are now online and visible to students seeking assistance.', 'success');
                      }}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        mentorStatus === 'available' 
                          ? 'bg-success text-white font-extrabold shadow shadow-success/15' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ● Online (Ready)
                    </button>
                    <button
                      onClick={() => {
                        setMentorStatus('busy');
                        addToast('Status Offline', 'You are now set to busy. No further automated tickets will be dispatched.', 'info');
                      }}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        mentorStatus === 'busy' 
                          ? 'bg-warning text-black font-extrabold' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      ● Offline (Busy)
                    </button>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground leading-relaxed font-sans bg-muted/10 p-3 rounded-xl border border-border/15 mt-3">
                  {mentorStatus === 'available' ? (
                    <span className="text-success font-semibold">Active Mode: You will receive real-time sound notifications and desktop alerts for incoming requests.</span>
                  ) : (
                    <span className="text-warning font-semibold">Quiet Mode: Support queue calls will accumulate but you will not receive live sounds or screen flashes.</span>
                  )}
                </div>
              </div>

              {/* Specialization Domain tags */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-primary" />
                  Focus Sub-Tracks
                </h3>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Energy Systems', 'Power Electronics', 'Load Balancers', 'Smart Grid Analytics', 'Battery Microgrids', 'ROS Navigation'].map((tag, idx) => (
                    <span key={idx} className="text-[9px] font-bold px-2 py-1 rounded bg-[#202020] text-muted-foreground border border-border/20 uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
