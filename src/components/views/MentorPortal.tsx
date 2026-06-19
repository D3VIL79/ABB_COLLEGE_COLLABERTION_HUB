'use client';

import { useState, useEffect } from 'react';
import { usePlatformStore, MentorRequest } from '@/store/usePlatformStore';
import { 
  Users, MessageSquareCode, Calendar, CheckCircle2, ChevronRight, 
  Trash2, PhoneCall, Video, VideoOff, Mic, MicOff, Send, HelpCircle, Code, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MentorPortal() {
  const { 
    activeTab, mentorRequests, assignMentor, resolveMentorRequest, 
    addCalendarEvent, mentors 
  } = usePlatformStore();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  
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

      {/* B. WORKSHOP SCHEDULER */}
      {activeTab === 'dashboard' && (
        <div className="p-4 sm:p-6 lg:p-8 border-t border-border/20 bg-muted/5">
          <div className="max-w-xl">
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2 mb-4">
              <Calendar className="w-4.5 h-4.5 text-primary" />
              Schedule Event Workshop Slot
            </h3>
            
            <form onSubmit={handleScheduleWorkshop} className="space-y-4 bg-card p-5 rounded-2xl border border-border/40 shadow-sm">
              {schedSuccess && (
                <div className="p-3.5 rounded-xl border border-success/30 bg-success/5 text-success text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Workshop successfully scheduled and linked to student calendars!
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Seminar Title *</label>
                  <input
                    value={schedTitle}
                    onChange={(e) => setSchedTitle(e.target.value)}
                    placeholder="e.g. ROS pathfinding tips"
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-muted-foreground uppercase mb-1">Date Selector *</label>
                  <input
                    type="date"
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-border/30 bg-background text-foreground outline-none focus:border-primary/50"
                  />
                </div>
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
      )}
    </div>
  );
}
